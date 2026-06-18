'use client';

interface Props {
  refValue: string;
  phone: string;
  loading: boolean;
  onChange: (next: { ref?: string; phone?: string }) => void;
  onSubmit: () => void;
}

const field = 'h-11 w-full rounded-xl border border-zinc-200 px-3.5 text-base outline-none focus:border-orange-400';

export function TrackingSearchForm({ refValue, phone, loading, onChange, onSubmit }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">เลขใบเสนอราคา</label>
        <input
          className={field}
          value={refValue}
          onChange={(e) => onChange({ ref: e.target.value })}
          placeholder="QUO-000001"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">เบอร์โทร</label>
        <input
          className={field}
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="08x-xxx-xxxx"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex h-11 items-center justify-center rounded-xl bg-orange-500 px-6 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
      >
        {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
      </button>
    </form>
  );
}
