"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function ProductImageForm({
  productId,
  initialImage,
  productName,
}: {
  productId: string;
  initialImage: string;
  productName: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(initialImage);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(
    initialImage.startsWith("http") ? initialImage : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPreview(initialImage);
    setImageUrl(initialImage.startsWith("http") ? initialImage : "");
  }, [initialImage]);

  function pickFile() {
    inputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function uploadFile() {
    if (!selectedFile) {
      setError("กรุณาเลือกรูปก่อน");
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`/api/admin/products/${productId}/image`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "อัปโหลดไม่สำเร็จ");
      setPreview(data.image);
      setSelectedFile(null);
      setImageUrl("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function saveUrl() {
    if (!imageUrl.trim()) {
      setError("กรุณาใส่ URL รูป");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setPreview(data.image);
      setSelectedFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  const showBlob = preview.startsWith("blob:");

  return (
    <div className="w-full rounded-xl border border-stone-200 bg-stone-50 p-4 sm:w-56">
      <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200">
        {showBlob ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={preview}
            alt={productName}
            fill
            className="object-cover"
            sizes="112px"
          />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={pickFile}
          className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
        >
          เลือกรูป
        </button>
        {selectedFile && (
          <button
            type="button"
            onClick={uploadFile}
            disabled={loading}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
          </button>
        )}
      </div>

      <div className="mt-3 border-t border-stone-200 pt-3">
        <p className="text-xs font-medium text-stone-500">หรือใส่ URL รูป</p>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs"
        />
        <button
          type="button"
          onClick={saveUrl}
          disabled={loading || !imageUrl.trim()}
          className="mt-1 w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs text-stone-700 hover:bg-stone-50 disabled:opacity-50"
        >
          ใช้ URL นี้
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="mt-2 text-[10px] leading-snug text-stone-400">
        JPG, PNG, WebP, GIF · สูงสุด 5 MB
      </p>
    </div>
  );
}
