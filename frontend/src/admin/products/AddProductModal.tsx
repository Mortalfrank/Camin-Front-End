import { useEffect, useState } from "react";
const MAX_OTHER_IMAGES = 9;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

  // ✅ 主图（必填，单张）
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  // ✅ 其他图片（可选，多张）
  const [otherImageFiles, setOtherImageFiles] = useState<File[]>([]);

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
      setMainImageFile(null);
      setOtherImageFiles([]);
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
    // ⚠️ 保持原有校验逻辑，只把 image 的校验改为 mainImageFile
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
    if (!mainImageFile) {
      setAddFormError("Product main picture is required.");
      return;
    }
    // ✅ 添加主图大小验证
    if (mainImageFile.size > MAX_FILE_SIZE) {
        setAddFormError("Main picture size cannot exceed 10MB.");
        return;
    }

    // ✅ 添加附加图片数量验证
    if (otherImageFiles.length > MAX_OTHER_IMAGES) {
        setAddFormError(
        `You can only upload up to ${MAX_OTHER_IMAGES} other pictures. Currently selected: ${otherImageFiles.length}`
        );
        return;
    }

    // ✅ 添加附加图片大小验证
    const oversizedOtherImages = otherImageFiles.filter(
        (file) => file.size > MAX_FILE_SIZE
    );
    if (oversizedOtherImages.length > 0) {
        setAddFormError(
        "Some other pictures exceed 10MB. Please compress them and try again."
        );
        return;
    }
    setAddFormError(null);
    setAddSaving(true);

    try {
        console.log("📤 准备发送请求...");
        console.log("主图:", mainImageFile?.name, mainImageFile?.size);
        console.log("附加图片数量:", otherImageFiles.length);
        // ✅ 使用 FormData 发送 multipart/form-data（带文件）
        const formData = new FormData();
        formData.append("name", addName.trim());
        formData.append("series", addSeries.trim());
        formData.append("brand", addBrand.trim());
        formData.append("model", addModel.trim());
        formData.append("description", addDescription.trim());
        formData.append("texture", addTexture.trim());
        formData.append("price", String(priceNumber));
        formData.append("stock", "0"); // 新增默认库存 0（保持原逻辑）

        // 👉 为了兼容你现在的后端，这里还是用原来的字段名 "image"
        formData.append("image", mainImageFile);

        // 👉 额外把其他图片也带上，后端暂时可以先不处理
        otherImageFiles.forEach((file) => {
            formData.append("otherImages", file);
        });

        const res = await fetch("http://localhost:8080/api/products", {
            method: "POST",
            body: formData,
            // ❌ 不要手动设置 Content-Type，浏览器会自动加 boundary
        });

        console.log("📥 响应状态:", res.status);

        if (!res.ok) {
            // ✅ 尝试获取详细错误信息
            const contentType = res.headers.get("content-type");
            let errorMessage = "";
            
            if (contentType?.includes("application/json")) {
                const errorData = await res.json();
                errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
            } else {
                errorMessage = await res.text();
            }
            
            console.error("❌ 后端返回错误:", errorMessage);
            throw new Error(`创建商品失败 (${res.status}): ${errorMessage}`);
        }

        const created: Product = await res.json();
        console.log("✅ 商品创建成功:", created);

      // 通知父组件：新增成功
      onSuccess(created);
      onClose();
    } catch (err: any) {
      console.error("❌ 请求失败:", err);
      setAddFormError(
        err.message || "Failed to add product. Please try again."
      );
    } finally {
      setAddSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        {/* 头部 */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Add Product Step
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Administrator click Add button → pop up new window and input
              product information, then upload product picture and click Save.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            disabled={addSaving}
          >
            ✕
          </button>
        </div>

        {/* 表单错误提示 */}
        {addFormError && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
            {addFormError}
          </div>
        )}

        {/* 内容表单 */}
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-1">
          {/* 基本信息：两列布局（大屏），小屏还是一列 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="e.g. Classic Wooden Chair"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                placeholder="Optional"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                placeholder="Brand name"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                placeholder="Model number"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                placeholder="e.g. Smooth, Matte, Glossy"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                placeholder="0.00"
                min={0}
                step="0.01"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={addSaving}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              rows={3}
              value={addDescription}
              onChange={(e) => setAddDescription(e.target.value)}
              placeholder="Short description of the product..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={addSaving}
            />
          </div>

          {/* ✅ 主图上传 */}
          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <label className="block text-sm font-medium text-slate-800">
              Product Main Picture <span className="text-red-500">*</span>
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Upload only one main picture. This image will be shown as the main
              product image.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setMainImageFile(file);
              }}
              className="mt-2 w-full cursor-pointer text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-600"
              disabled={addSaving}
            />
            {mainImageFile && (
              <p className="mt-1 text-xs text-slate-500">
                Selected main picture: {mainImageFile.name}
              </p>
            )}
          </div>

          {/* 其他图片上传 */}
<div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
  <label className="block text-sm font-medium text-slate-800">
    Product Other Pictures
  </label>
  <p className="mt-1 text-xs text-slate-500">
    Optional. You can upload up to {MAX_OTHER_IMAGES} images (max 10MB each).
  </p>
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      
      // ✅ 实时验证数量
      if (files.length > MAX_OTHER_IMAGES) {
        setAddFormError(
          `You can only select up to ${MAX_OTHER_IMAGES} pictures. You selected ${files.length}.`
        );
        e.target.value = ""; // 清空选择
        return;
      }
      
      // ✅ 实时验证大小
      const oversized = files.filter(f => f.size > MAX_FILE_SIZE);
      if (oversized.length > 0) {
        setAddFormError(
          `${oversized.length} file(s) exceed 10MB. Please select smaller files.`
        );
        e.target.value = "";
        return;
      }
      
      setAddFormError(null);
      setOtherImageFiles(files);
    }}
    className="mt-2 w-full cursor-pointer text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-emerald-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-200"
    disabled={addSaving}
  />
  {otherImageFiles.length > 0 && (
    <p className="mt-1 text-xs text-slate-500">
      Selected {otherImageFiles.length} other{" "}
      {otherImageFiles.length === 1 ? "picture" : "pictures"}.
    </p>
  )}
</div>

        {/* 底部按钮 */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            disabled={addSaving}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSaveNewProduct}
            disabled={addSaving}
            className={`rounded-md px-5 py-2 text-sm font-semibold text-sky-400 shadow-sm transition ${
              addSaving
                ? "cursor-wait bg-emerald-300"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {addSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
