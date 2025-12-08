import { useEffect, useState } from "react";

export type Product = {
  id: number;
  name: string;
  series?: string;
  brand?: string;
  model?: string;
  description?: string;
  texture: string;
  price: number;
  stock: number;
  mainImageUrl?: string;
};

type AddProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (created: Product) => void;
};

export default function AddProductModal({
  isOpen,
  onClose,
  onSuccess,
}: AddProductModalProps) {
  const [addName, setAddName] = useState("");
  const [addSeries, setAddSeries] = useState("");
  const [addBrand, setAddBrand] = useState("");
  const [addModel, setAddModel] = useState("");
  const [addTexture, setAddTexture] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addImageUrl, setAddImageUrl] = useState("");

  const [addSaving, setAddSaving] = useState(false);
  const [addFormError, setAddFormError] = useState<string | null>(null);

  // 每次打开弹窗时重置表单
  useEffect(() => {
    if (isOpen) {
      setAddName("");
      setAddSeries("");
      setAddBrand("");
      setAddModel("");
      setAddTexture("");
      setAddPrice("");
      setAddDescription("");
      setAddImageUrl("");
      setAddFormError(null);
      setAddSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (addSaving) return;
    onClose();
  };

  const handleSaveNewProduct = async () => {
    // 简单校验
    if (!addName.trim()) {
      setAddFormError("Product Name is required.");
      return;
    }
    if (!addPrice.trim()) {
      setAddFormError("Price is required.");
      return;
    }
    const priceNumber = Number(addPrice);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      setAddFormError("Price must be a valid non-negative number.");
      return;
    }

    setAddFormError(null);
    setAddSaving(true);

    try {
      const newProductPayload = {
        name: addName.trim(),
        series: addSeries.trim() || null,
        brand: addBrand.trim() || null,
        model: addModel.trim() || null,
        description: addDescription.trim() || null,
        texture: addTexture.trim() || "",
        price: priceNumber,
        stock: 0,
        mainImageUrl: addImageUrl.trim() || null,
      };

      const res = await fetch("http://localhost:8080/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProductPayload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Create product error:", text);
        throw new Error(
          `Failed to create product (status ${res.status}). ${
            text || ""
          }`.trim()
        );
      }

      const created: Product = await res.json();

      // 通知父组件：新增成功
      onSuccess(created);
      onClose();
    } catch (err: any) {
      console.error(err);
      setAddFormError(
        err.message || "Failed to add product. Please try again."
      );
    } finally {
      setAddSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        {/* 头部 */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Add Product Step</h3>
            <p className="mt-1 text-xs text-slate-500">
              Administrator click Add button → pop up new window and input
              product information, then click Save.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full px-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            disabled={addSaving}
          >
            ✕
          </button>
        </div>

        {/* 表单错误提示 */}
        {addFormError && (
          <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
            {addFormError}
          </div>
        )}

        {/* 内容表单 */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={addSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Series
            </label>
            <input
              type="text"
              value={addSeries}
              onChange={(e) => setAddSeries(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={addSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Brand
            </label>
            <input
              type="text"
              value={addBrand}
              onChange={(e) => setAddBrand(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={addSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Model
            </label>
            <input
              type="text"
              value={addModel}
              onChange={(e) => setAddModel(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={addSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Texture
            </label>
            <input
              type="text"
              value={addTexture}
              onChange={(e) => setAddTexture(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={addSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={addPrice}
              onChange={(e) => setAddPrice(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={addSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              rows={3}
              value={addDescription}
              onChange={(e) => setAddDescription(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={addSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Product Picture URL
            </label>
            <input
              type="text"
              placeholder="e.g. http://localhost:8080/products/hc-cream-1.jpg"
              value={addImageUrl}
              onChange={(e) => setAddImageUrl(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={addSaving}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              For now, please paste an image URL. Later we can support real file
              upload.
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            disabled={addSaving}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSaveNewProduct}
            disabled={addSaving}
            className={`rounded-md px-4 py-2 text-sm font-medium text-sky-400 shadow-sm ${
              addSaving
                ? "bg-emerald-300 cursor-wait"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {addSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
