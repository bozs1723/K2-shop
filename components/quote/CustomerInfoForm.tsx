'use client';

export interface CustomerInfo {
  name: string;
  phone: string;
  line_id: string;
  email: string;
  company: string;
}

interface Props {
  value: CustomerInfo;
  onChange: (value: CustomerInfo) => void;
}

const field = 'h-11 w-full rounded-xl border border-zinc-200 px-3.5 text-base outline-none focus:border-orange-400';

export function CustomerInfoForm({ value, onChange }: Props) {
  const set = (k: keyof CustomerInfo, v: string) => onChange({ ...value, [k]: v });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          ชื่อ-นามสกุล <span className="text-red-500">*</span>
        </label>
        <input
          className={field}
          value={value.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="เช่น สมชาย ใจดี"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          เบอร์โทร <span className="text-red-500">*</span>
        </label>
        <input
          className={field}
          type="tel"
          inputMode="tel"
          value={value.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="08x-xxx-xxxx"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">LINE ID</label>
        <input
          className={field}
          value={value.line_id}
          onChange={(e) => set('line_id', e.target.value)}
          placeholder="(ไม่บังคับ)"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">อีเมล</label>
        <input
          className={field}
          type="email"
          value={value.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="(ไม่บังคับ)"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">บริษัท</label>
        <input
          className={field}
          value={value.company}
          onChange={(e) => set('company', e.target.value)}
          placeholder="(ไม่บังคับ)"
        />
      </div>
    </div>
  );
}
