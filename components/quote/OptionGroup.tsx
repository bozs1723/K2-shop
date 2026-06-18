'use client';

import { cn } from '@/lib/utils';

export interface Choice {
  key: string;
  label: string;
  hint?: string;
}

interface Props {
  label: string;
  choices: Choice[];
  /** single: string | multiple: string[] */
  value: string | string[];
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
}

export function OptionGroup({ label, choices, value, multiple, onChange }: Props) {
  if (choices.length === 0) return null;

  const selected = (key: string) =>
    multiple ? (value as string[]).includes(key) : value === key;

  function toggle(key: string) {
    if (multiple) {
      const arr = value as string[];
      onChange(arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key]);
    } else {
      onChange(key);
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {choices.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => toggle(c.key)}
            className={cn(
              'rounded-xl border px-4 py-2.5 text-sm transition-colors',
              selected(c.key)
                ? 'border-orange-500 bg-orange-50 font-medium text-orange-700'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300',
            )}
          >
            {c.label}
            {c.hint && <span className="ml-1 text-xs text-zinc-400">{c.hint}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
