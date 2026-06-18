'use client';

import { useRef, useState } from 'react';
import {
  UPLOAD_ACCEPT_ATTR,
  UPLOAD_ALLOWED_EXT,
  UPLOAD_MAX_BYTES,
} from '@/lib/constants';

interface Props {
  value?: { url: string; name: string } | null;
  onChange: (file: { url: string; name: string } | null) => void;
}

export function FileUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    const ext = (file.name.split('.').pop() ?? '').toLowerCase();
    if (!UPLOAD_ALLOWED_EXT.includes(ext as (typeof UPLOAD_ALLOWED_EXT)[number])) {
      setError('รองรับเฉพาะ jpg, png, pdf, ai, psd, svg');
      return;
    }
    if (file.size > UPLOAD_MAX_BYTES) {
      setError('ไฟล์ใหญ่เกิน 20MB');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'อัปโหลดไม่สำเร็จ');
        return;
      }
      onChange({ url: data.url, name: data.name });
    } catch {
      setError('อัปโหลดไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {value ? (
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
          <span className="truncate text-sm">📎 {value.name}</span>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="ml-3 shrink-0 text-sm text-red-500 hover:underline"
          >
            ลบ
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 px-4 py-8 text-center transition-colors hover:border-orange-400 hover:bg-orange-50/40 disabled:opacity-60"
        >
          <span className="text-2xl">{uploading ? '⏳' : '⬆️'}</span>
          <span className="mt-2 text-sm font-medium">
            {uploading ? 'กำลังอัปโหลด...' : 'แตะเพื่ออัปโหลดไฟล์งาน'}
          </span>
          <span className="mt-1 text-xs text-zinc-400">jpg, png, pdf, ai, psd, svg · ไม่เกิน 20MB</span>
        </button>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
