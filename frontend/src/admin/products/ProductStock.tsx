import { useEffect, useMemo, useState } from "react";

type InventoryRow = {
  id: number;
  name: string;
  mainImageUrl: string | null;
  stock: number;
  isActive: boolean;
};

type PageResp<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-based
  size: number;
};

const PAGE_SIZE = 10;

// 如果你的图片是相对路径（例如 /products/xxx.jpg），这里会自动补上后端域名。
// 如果 mainImageUrl 已经是 http 开头，会原样使用。
function resolveImageUrl(url: string | null): string {
  if (!url) return "";

  // 后端已经返回完整 URL（推荐做法）
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // 后端返回的是相对路径，例如 /products/xxx.jpg
  return `${import.meta.env.VITE_API_BASE_URL}${url}`;
}

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    // 尝试读后端的错误信息
    let msg = `${res.status} ${res.statusText}`;
    try {
      const text = await res.text();
      if (text) msg = text;
    } catch {}
    throw new Error(msg);
  }

  // 有些 PATCH 可能返回空 body，这里做兼容
  const text = await res.text();
  return (text ? JSON.parse(text) : ({} as T)) as T;
}

export default function ProductStock() {
    const [page, setPage] = useState(1); // 1-based for UI
    const [keyword, setKeyword] = useState("");
    const [searchDraft, setSearchDraft] = useState("");

    const [data, setData] = useState<PageResp<InventoryRow> | null>(null);
    const [loading, setLoading] = useState(false);
    const [rowBusy, setRowBusy] = useState<Record<number, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const [editingStockId, setEditingStockId] = useState<number | null> (null);
    const [stockDraft, setStockDraft] = useState<Record<number, string>>({});

    const totalPages = data?.totalPages ?? 0;
    const rows = data?.content ?? [];

    const canPrev = page > 1;
    const canNext = totalPages > 0 && page < totalPages;

    const queryUrl = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", String(PAGE_SIZE));
        if (keyword.trim()) params.set("keyword", keyword.trim());
        return `http://localhost:8080/api/products/admin/inventory?${params.toString()}`;
    }, [page, keyword]);

async function load() {
    setLoading(true);
    setError(null);
    try {
    const resp = await http<PageResp<InventoryRow>>(queryUrl);
    setData(resp);
    } catch (e: any) {
    setError(e?.message ?? "Failed to load inventory");
    setData(null);
    } finally {
    setLoading(false);
    }
}

useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [queryUrl]);

function setBusy(id: number, v: boolean) {
    setRowBusy((prev) => ({ ...prev, [id]: v }));
}

async function changeStock(id: number, delta: number) {
    if (delta === 0) return;
    setBusy(id, true);
    setError(null);

    // optimistic update
    setData((prev) => {
    if (!prev) return prev;
    return {
        ...prev,
        content: prev.content.map((r) =>
        r.id === id ? { ...r, stock: r.stock + delta } : r
        ),
    };
    });

    try {
    const resp = await http<{ productId: number; stock: number }>(
        `http://localhost:8080/api/products/${id}/stock?delta=${encodeURIComponent(delta)}`,
        { method: "PATCH" }
    );

    // 用后端返回的 stock 校正（避免并发/校验导致不一致）
    setData((prev) => {
        if (!prev) return prev;
        return {
        ...prev,
        content: prev.content.map((r) =>
            r.id === id ? { ...r, stock: resp.stock } : r
        ),
        };
    });
    } catch (e: any) {
    // rollback：失败就重新拉一次当前页（最省心且一致）
    setError(e?.message ?? "Failed to update stock");
    await load();
    } finally {
    setBusy(id, false);
    }
}

function startEditStock(id: number, currentStock: number){
    setEditingStockId(id);
    setStockDraft((prev) => ({...prev, [id]:String(currentStock)}));
}
async function commitEditStock(id: number){
    const raw = (stockDraft[id] ?? "").trim();
    if (raw === ""){
        setEditingStockId(null);
        return;
    }

    const next = Number(raw);
    if(!Number.isFinite(next) || !Number.isInteger(next) || next <0 ){
        setError("Stock must be a non-negative integer.");
        return;
    }

    const current = rows.find((x) => x.id === id)?.stock;
    if(typeof current !== "number") return;

    const delta = next - current;
    if (delta !== 0){
        await changeStock(id, delta);
    }

    setEditingStockId(null);
}
async function toggleActive(id: number) {
    setBusy(id, true);
    setError(null);

    // optimistic flip
    setData((prev) => {
    if (!prev) return prev;
    return {
        ...prev,
        content: prev.content.map((r) =>
        r.id === id ? { ...r, isActive: !r.isActive } : r
        ),
    };
    });

    try {
        const resp = await http<any>(
            `http://localhost:8080/api/products/${id}/active/toggle`,
            { method: "PATCH" }
        );

        // ✅ 兼容后端返回 active / isActive 两种字段名
        const nextActive =
            typeof resp?.active === "boolean"
            ? resp.active
            : typeof resp?.isActive === "boolean"
                ? resp.isActive
                : undefined;

        // ✅ 如果拿不到布尔值，千万不要写 undefined 进 state
        if (typeof nextActive !== "boolean") {
            await load(); // 用后端数据重新同步这一页
            return;
        }

        setData((prev) => {
            if (!prev) return prev;
            return {
            ...prev,
            content: prev.content.map((r) =>
                r.id === id ? { ...r, isActive: nextActive } : r
            ),
            };
        });
        } catch (e: any) {
        setError(e?.message ?? "Failed to toggle active status");
        await load();
        } finally {
        setBusy(id, false);
    }

}

function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setKeyword(searchDraft);
}

return (
    <div>
    <div className="mb-4 flex items-center justify-between gap-3">
        <div>
        <h1 className="text-xl font-semibold text-slate-900">Product Stock</h1>
        <p className="text-sm text-slate-500">
            Manage inventory and on-shelf status.
        </p>
        </div>

        <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
            <input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search by product name…"
                className="h-11 w-[280px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400"
            />
            <button
            type="submit"
            className="h-11 w-auto min-w-[80px] rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-800"
            >
                Search
            </button>

            <button
                type="button"
                onClick={() => {
                    setSearchDraft("");
                    setKeyword("");
                    setPage(1);
                }}
                className="h-11 min-w-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
                Reset
            </button>

        </form>
    </div>

    {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
        </div>
    )}

    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
        <table className="min-w-full text-left">
            <thead className="bg-slate-50">
            <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
            </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
            {loading ? (
                <tr>
                <td className="px-4 py-6 text-sm text-slate-500" colSpan={5}>
                    Loading…
                </td>
                </tr>
            ) : rows.length === 0 ? (
                <tr>
                <td className="px-4 py-6 text-sm text-slate-500" colSpan={5}>
                    No products found.
                </td>
                </tr>
            ) : (
                rows.map((r) => {
                const busy = !!rowBusy[r.id];
                const img = resolveImageUrl(r.mainImageUrl);

                return (
                    <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        {img ? (
                            <img
                            src={img}
                            alt={r.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">
                            No image
                            </div>
                        )}
                        </div>
                    </td>

                    <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-900">
                        {r.name}
                        </div>
                        <div className="text-xs text-slate-500">ID: {r.id}</div>
                    </td>

                    <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2">
                        {editingStockId === r.id ? (
                            <input
                                autoFocus
                                value={stockDraft[r.id] ?? ""}
                                onChange={(e) =>
                                setStockDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (!busy) commitEditStock(r.id);
                                }
                                if (e.key === "Escape") {
                                    e.preventDefault();
                                    setEditingStockId(null);
                                }
                                }}
                                onBlur={() => {
                                    setEditingStockId(null);
                                }}
                                inputMode="numeric"
                                className="h-9 w-[68px] rounded-md border border-slate-200 bg-white px-2 text-center text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-slate-400 disabled:opacity-50"
                                disabled={busy}
                            />
                            ) : (
                            <button
                                type="button"
                                onClick={() => startEditStock(r.id, r.stock)}
                                className={`inline-flex w-[80px] min-w-[44px] justify-center tabular-nums rounded-md px-2 py-1 text-sm font-semibold ${
                                r.stock <= 0
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-slate-100 text-slate-800"
                                } hover:brightness-95`}
                                title="Click to edit stock"
                            >
                                {r.stock}
                            </button>
                        )}


                        <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-200">
                            <button
                            disabled={busy}
                            onClick={() => changeStock(r.id, -1)}
                            className="px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Decrease stock"
                            >
                            −
                            </button>
                            <div className="h-7 w-px bg-slate-200" />
                            <button
                            disabled={busy}
                            onClick={() => changeStock(r.id, +1)}
                            className="px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Increase stock"
                            >
                            +
                            </button>
                        </div>

                        <button
                            disabled={busy}
                            onClick={() => changeStock(r.id, +5)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Quick add +5"
                        >
                            +5
                        </button>
                        </div>
                    </td>

                    <td className="px-4 py-3">
                        <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            r.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                        >
                        {r.isActive ? "On shelf" : "Off shelf"}
                        </span>
                    </td>

                    <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                        <button
                            disabled={busy}
                            onClick={() => toggleActive(r.id)}
                            className={`rounded-lg px-3 py-2 text-sm font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                            r.isActive
                                ? "bg-slate-900 text-black hover:bg-slate-800"
                                : "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50"
                            }`}
                            title="Toggle on/off shelf"
                        >
                            {busy ? "Working…" : r.isActive ? "Take off" : "Put on"}
                        </button>
                        </div>
                    </td>
                    </tr>
                );
                })
            )}
            </tbody>
        </table>
        </div>

        {/* footer / pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
        <div className="text-sm text-slate-600">
            Page <span className="font-semibold text-slate-900">{page}</span>{" "}
            {totalPages > 0 ? (
            <>
                of <span className="font-semibold text-slate-900">{totalPages}</span>
            </>
            ) : null}
        </div>

        <div className="flex items-center gap-2">
            <button
            disabled={!canPrev || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
            Prev
            </button>

            <button
            disabled={!canNext || loading}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
            Next
            </button>
        </div>
        </div>
    </div>
    </div>
);
}
