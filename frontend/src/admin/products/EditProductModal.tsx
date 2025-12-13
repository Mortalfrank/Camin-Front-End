import { useEffect, useState } from "react";
import type { Product } from "./AddProductModal";

const MAX_OTHER_IMAGES = 9;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

type ProductImage = {
  id: number;
  productId: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
};

type EditProductModalProps = {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess: (updated: Product) => void;
};

export default function EditProductModal({
  isOpen,
  product,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const [name, setName] = useState("");
  const [series, setSeries] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [texture, setTexture] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // ✅ 图片相关 state
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [otherImageFiles, setOtherImageFiles] = useState<File[]>([]);

  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [otherImagePreviews, setOtherImagePreviews] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 已存在于数据库的 other pictures
  const [existingOtherImages, setExistingOtherImages] = useState<ProductImage[]>([]);
  // 仅在前端记录“本次编辑会删掉哪些旧图”，真正删除在 Save 时做
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  // 每次打开 & product 变化时，把后端数据填入表单
  useEffect(() => {
    if (isOpen && product) {
      setName(product.name || "");
      setSeries(product.series || "");
      setBrand(product.brand || "");
      setModel(product.model || "");
      setTexture(product.texture || "");
      setPrice(product.price != null ? String(product.price) : "");
      setDescription(product.description || "");

      setMainImageFile(null);
      setOtherImageFiles([]);

      // 主图预览：优先用后端给的 URL
      if ((product as any).mainImageUrl) {
        setMainImagePreview((product as any).mainImageUrl);
      } else {
        setMainImagePreview(null);
      }

      // 先清空旧的预览、删除标记
      setOtherImagePreviews([]);
      setExistingOtherImages([]);
      setImagesToDelete([]);

      setFormError(null);
      setSaving(false);

      // 请求该产品的 other pictures
      const fetchOtherImages = async () => {
        try {
          const res = await fetch(
            `http://localhost:8080/api/products/${product.id}/images`,
          );
          if (!res.ok) {
            console.warn("Failed to load other images:", res.status);
            return;
          }

          const data: ProductImage[] = await res.json();
          setExistingOtherImages(data);
        } catch (e) {
          console.error("Error fetching other images", e);
        }
      };

      fetchOtherImages();
    }
  }, [isOpen, product]);

  if (!isOpen || !product) {
    return null;
  }

  const handleClose = () => {
    if (saving) return;
    onClose(); // 不调后端，state 也不需要特别处理；下次打开会重新 useEffect + fetch
  };

  const handleRemoveOtherImage = (index: number) => {
    setOtherImageFiles((prev) => prev.filter((_, i) => i !== index));

    setOtherImagePreviews((prev) => {
      const toRemove = prev[index];
      if (toRemove && !toRemove.startsWith("http")) {
        URL.revokeObjectURL(toRemove);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // 👇 点击旧图的减号：只在前端标记要删除，不立刻调 DELETE
  const handleMarkExistingImageForDeletion = (imageId: number) => {
    if (imagesToDelete.includes(imageId)) return; // 已标记过就不重复
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError("Product Name is required.");
      return;
    }
    if (!price.trim()) {
      setFormError("Price is required.");
      return;
    }
    const priceNumber = Number(price);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      setFormError("Price must be a valid non-negative number.");
      return;
    }

    // 主图如果重新上传了，就验证大小
    if (mainImageFile && mainImageFile.size > MAX_FILE_SIZE) {
      setFormError("Main picture size cannot exceed 10MB.");
      return;
    }

    if (otherImageFiles.length > MAX_OTHER_IMAGES) {
      setFormError(
        `You can only upload up to ${MAX_OTHER_IMAGES} other pictures. Currently selected: ${otherImageFiles.length}`,
      );
      return;
    }

    const oversizedOther = otherImageFiles.filter(
      (file) => file.size > MAX_FILE_SIZE,
    );
    if (oversizedOther.length > 0) {
      setFormError(
        "Some other pictures exceed 10MB. Please compress them and try again.",
      );
      return;
    }

    setFormError(null);
    setSaving(true);

    try {
      // 1️⃣ 先更新产品信息 + 新增图片
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("series", series.trim());
      formData.append("brand", brand.trim());
      formData.append("model", model.trim());
      formData.append("description", description.trim());
      formData.append("texture", texture.trim());
      formData.append("price", String(priceNumber));
      formData.append("stock", String(product.stock ?? 0));

      // 如果用户上传了新主图，就带上；否则让后端保留原来的 main_image_url
      if (mainImageFile) {
        formData.append("image", mainImageFile);
      }

      otherImageFiles.forEach((file) => {
        formData.append("otherImages", file);
      });

      const res = await fetch(
        `http://localhost:8080/api/products/${product.id}`,
        {
          method: "PUT", // 如果你后端用 PATCH，就换成 "PATCH"
          body: formData,
        },
      );

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        let errorMessage = "";
        if (contentType?.includes("application/json")) {
          const errorData = await res.json();
          errorMessage =
            (errorData as any).message ||
            (errorData as any).error ||
            JSON.stringify(errorData);
        } else {
          errorMessage = await res.text();
        }
        throw new Error(`Update product failed (${res.status}): ${errorMessage}`);
      }

      const updated: Product = await res.json();

      // 2️⃣ 再根据本次标记的 imagesToDelete 调用 DELETE
      if (imagesToDelete.length > 0) {
        const deleteResponses = await Promise.all(
          imagesToDelete.map((imageId) =>
            fetch(
              `http://localhost:8080/api/products/${product.id}/images/${imageId}`,
              { method: "DELETE" },
            ),
          ),
        );

        const failed = deleteResponses.filter(
          (r) => !r.ok && r.status !== 204,
        );
        if (failed.length > 0) {
          // 产品已经更新成功，但有图片没删掉 —— 提示一下
          throw new Error(
            `Product updated, but failed to delete ${failed.length} image(s).`,
          );
        }
      }

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error("❌ Update product error:", err);
      setFormError(
        err.message ||
          "Failed to update product or delete images. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Edit Product
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Modify product information and pictures, then click Save to
              update.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            disabled={saving}
          >
            ✕
          </button>
        </div>

        {formError && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
            {formError}
          </div>
        )}

        {/* Form content，布局基本和 Add 一样 */}
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-1">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Series
              </label>
              <input
                type="text"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Model
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Texture
              </label>
              <input
                type="text"
                value={texture}
                onChange={(e) => setTexture(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={0}
                step="0.01"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={saving}
            />
          </div>

          {/* 主图：可预览旧图，也可上传新图 */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <label className="block text-sm font-medium text-slate-800">
              Product Main Picture
            </label>
            <p className="mt-1 text-xs text-slate-500">
              If you upload a new picture, it will replace the existing main
              product image.
            </p>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;

                if (!file) {
                  setMainImageFile(null);
                  // 不清空旧的 URL 预览（来自后端）
                  if ((product as any).mainImageUrl) {
                    setMainImagePreview((product as any).mainImageUrl);
                  } else {
                    setMainImagePreview(null);
                  }
                  return;
                }

                if (!ALLOWED_TYPES.includes(file.type)) {
                  setFormError("Only JPG and PNG images are allowed.");
                  e.target.value = "";
                  return;
                }

                // 如果之前预览是本地 URL，记得释放
                if (mainImagePreview && !mainImagePreview.startsWith("http")) {
                  URL.revokeObjectURL(mainImagePreview);
                }

                setFormError(null);
                setMainImageFile(file);
                setMainImagePreview(URL.createObjectURL(file));
              }}
              className="mt-2 w-full cursor-pointer text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-600"
              disabled={saving}
            />

            {mainImagePreview && (
              <div className="mt-2">
                <img
                  src={mainImagePreview}
                  alt="Main product preview"
                  className="h-24 w-24 rounded-md border border-slate-200 object-cover"
                />
              </div>
            )}
          </div>

          {/* 其他图片：逻辑和 Add 类似 */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <label className="block text-sm font-medium text-slate-800">
              Product Other Pictures
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Optional. You can upload up to {MAX_OTHER_IMAGES} images (max 10MB
              each).
            </p>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              multiple
              onChange={(e) => {
                const newFiles = e.target.files
                  ? Array.from(e.target.files)
                  : [];
                if (newFiles.length === 0) return;

                const prevFiles = otherImageFiles;
                const combined = [...prevFiles, ...newFiles];

                if (combined.length > MAX_OTHER_IMAGES) {
                  setFormError(
                    `You can only upload up to ${MAX_OTHER_IMAGES} images. (Current: ${prevFiles.length}, New: ${newFiles.length})`,
                  );
                  e.target.value = "";
                  return;
                }

                const invalidFormat = newFiles.filter(
                  (f) => !ALLOWED_TYPES.includes(f.type),
                );
                if (invalidFormat.length > 0) {
                  setFormError("Only JPG and PNG images are allowed.");
                  e.target.value = "";
                  return;
                }

                const oversized = newFiles.filter(
                  (f) => f.size > MAX_FILE_SIZE,
                );
                if (oversized.length > 0) {
                  setFormError(
                    `${oversized.length} file(s) exceed 10MB. Please select smaller files.`,
                  );
                  e.target.value = "";
                  return;
                }

                const newPreviews = newFiles.map((f) =>
                  URL.createObjectURL(f),
                );

                setOtherImageFiles(combined);
                setOtherImagePreviews((prev) => [...prev, ...newPreviews]);
                setFormError(null);
                e.target.value = "";
              }}
              className="mt-2 w-full cursor-pointer text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-emerald-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-200"
              disabled={saving}
            />

            {/* 已存在的 other pictures（过滤掉本次标记要删的） */}
            {existingOtherImages.length > 0 && (
              <div className="mt-2 grid grid-cols-5 gap-2">
                {existingOtherImages
                  .filter((img) => !imagesToDelete.includes(img.id))
                  .map((img) => (
                    <div key={img.id} className="relative h-16 w-16">
                      <img
                        src={img.imageUrl}
                        alt={`Existing other product image ${img.id}`}
                        className="h-16 w-16 rounded-md border border-slate-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleMarkExistingImageForDeletion(img.id)}
                        disabled={saving}
                        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full !bg-red-500 text-xs font-bold text-white shadow"
                      >
                        −
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* 本次新增的 other pictures（可以直接从前端列表移除） */}
            {otherImagePreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-5 gap-2">
                {otherImagePreviews.map((url, index) => (
                  <div key={index} className="relative h-16 w-16">
                    <img
                      src={url}
                      alt={`New other product preview ${index + 1}`}
                      className="h-16 w-16 rounded-md border border-slate-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOtherImage(index)}
                      className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full !bg-red-500 text-xs font-bold text-white shadow"
                    >
                      −
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            disabled={saving}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`rounded-md px-5 py-2 text-sm font-semibold text-sky-400 shadow-sm transition ${
              saving
                ? "cursor-wait bg-emerald-300"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
