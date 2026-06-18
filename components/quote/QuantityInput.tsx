'use client';

interface Props {
  value: number;
  min?: number;
  onChange: (value: number) => void;
}

export function QuantityInput({ value, min = 1, onChange }: Props) {
  const set = (n: number) => onChange(Math.max(min, Math.floor(n || min)));

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700">
        จำนวน <span className="text-xs font-normal text-zinc-400">(ขั้นต่ำ {min})</span>
      </label>
      <div className="inline-flex items-center rounded-xl border border-zinc-200">
        <button
          type="button"
          onClick={() => set(value - 1)}
          className="flex h-11 w-11 items-center justify-center text-xl text-zinc-600 hover:bg-zinc-50"
          aria-label="ลดจำนวน"
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          onChange={(e) => set(Number(e.target.value))}
          className="h-11 w-20 border-x border-zinc-200 text-center text-base outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => set(value + 1)}
          className="flex h-11 w-11 items-center justify-center text-xl text-zinc-600 hover:bg-zinc-50"
          aria-label="เพิ่มจำนวน"
        >
          +
        </button>
      </div>
    </div>
  );
}
