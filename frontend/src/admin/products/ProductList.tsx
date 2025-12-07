import { useEffect, useState } from "react";


type Product = {
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
export default function ProductsList() {

    const [selectedAll, setSelectedAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Calculate how many rows are currently selected
    const selectedCount = Object.values(selectedRows).filter(Boolean).length;
    const canEdit = selectedCount === 1;
    const canDelete = selectedCount >= 1;



    useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:8080/api/products");
        if (!res.ok) {
          throw new Error(`Failed to load products: ${res.status}`);
        }
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
    return (
        <div className="space-y-4">
        {/* Page Title */}
        <div>
            <h2 className="text-2xl font-semibold">Product List</h2>
            <p className="text-sm text-slate-500">
            Manage your products here.
            </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* Search bar */}
                <div className="relative w-full max-w-md">
                    <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                </div>

                {/* Button Area */}
                <div className="flex flex-wrap gap-2">
                {/* Add Button */}
                <button
                    type="button"
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-sky-400 shadow-sm transition hover:bg-emerald-700"
                >
                    Add
                </button>

                {/* Edit: It can only be available when exactly one is selected */}
                <button
                    type="button"
                    disabled={!canEdit}
                    className={`rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition
                    ${
                        canEdit
                        ? "text-slate-800 hover:bg-slate-100 cursor-pointer"
                        : "text-slate-400 cursor-not-allowed opacity-60"
                    }`}
                >
                    Edit
                </button>

                {/* Delete: At least one must be selected to be available */}
                <button
                    type="button"
                    disabled={!canDelete}
                    className={`rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition
                    ${
                        canDelete
                        ? "text-red-600 hover:bg-red-50 cursor-pointer"
                        : "text-red-300 cursor-not-allowed opacity-60"
                    }`}
                >
                    Delete
                </button>
            </div>
        </div>

            {/* Main：List */}
            <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-1 text-sm">
                <thead>
                    <tr className="text-left text-xs uppercase text-slate-500">
                        {/* First column：checkbox */}
                        <th className="w-10 px-3 py-2">
                            <input
                                type="checkbox"
                                checked={selectedAll}
                                onChange={(e) => {
                                const checked = e.target.checked;
                                setSelectedAll(checked);

                                // Update the selection status of all rows
                                const newState: Record<number, boolean> = {};
                                products.forEach((p) => {
                                    newState[p.id] = checked;
                                });
                                setSelectedRows(newState);
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                        </th>
                        {/* Second Column: Pictures */}
                        <th className="w-20 px-3 py-2">
                        </th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Series</th>
                        <th className="px-3 py-2">Brand</th>
                        <th className="px-3 py-2">Model</th>
                        <th className="px-3 py-2">Texture</th>
                        <th className="px-3 py-2 text-right">Price</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <tr>
                        <td className="px-3 py-3 text-sm text-slate-500" colSpan={8}>
                            Loading products...
                        </td>
                        </tr>
                    )}

                    {error && !loading && (
                        <tr>
                        <td className="px-3 py-3 text-sm text-red-500" colSpan={8}>
                            {error}
                        </td>
                        </tr>
                    )}

                    {!loading && !error && products.length === 0 && (
                        <tr>
                        <td className="px-3 py-3 text-sm text-slate-500" colSpan={8}>
                            No products found.
                        </td>
                        </tr>
                    )}

                    {!loading &&
                        !error &&
                        products.map((p) => (
                        <tr
                            key={p.id}
                            className="rounded-lg bg-slate-50 align-middle hover:bg-slate-100"
                        >
                            {/* checkbox */}
                            <td className="px-3 py-3">
                            <input
                                type="checkbox"
                                checked={!!selectedRows[p.id]}
                                onChange={(e) => {
                                const checked = e.target.checked;

                                // Update the current line
                                const updatedRows: Record<number, boolean> = {
                                    ...selectedRows,
                                    [p.id]: checked,
                                };
                                setSelectedRows(updatedRows);

                                // If a certain row is unchecked, all selections must become false
                                if (!checked) {
                                    setSelectedAll(false);
                                } else {
                                    // If all rows are checked, set all to true
                                    const allChecked =
                                    products.length > 0 &&
                                    products.every((item) => updatedRows[item.id]);
                                    setSelectedAll(allChecked);
                                }
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            </td>

                            {/* Product Picture */}
                            <td className="px-3 py-3">
                            <div className="h-12 w-12 overflow-hidden rounded-md bg-slate-200">
                                <img
                                src={
                                    p.mainImageUrl ||
                                    "https://via.placeholder.com/64x64.png?text=Img"
                                }
                                alt={p.name}
                                className="h-full w-full object-cover"
                                />
                            </div>
                            </td>

                            {/* Information Line */}
                            <td className="px-3 py-3 font-medium text-slate-900">
                            {p.name}
                            </td>
                            <td className="px-3 py-3 text-slate-800">{p.series}</td>
                            <td className="px-3 py-3 text-slate-800">{p.brand}</td>
                            <td className="px-3 py-3 text-slate-800">{p.model}</td>
                            <td className="px-3 py-3 text-slate-800">{p.texture}</td>
                            <td className="px-3 py-3 text-right font-semibold text-slate-900">
                            {p.price?.toFixed ? p.price.toFixed(2) : p.price}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    );
}
