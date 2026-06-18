'use client';

import { formatTHB } from '@/lib/utils';
import { DEFAULT_DEPOSIT_PERCENT } from '@/lib/constants';
import type { QuoteResult } from '@/lib/pricing';

interface Props {
  result: QuoteResult;
  unit: string;
  submitting: boolean;
  disabled: boolean;
  onSubmit: () => void;
}

export function PriceSummary({ result, unit, submitting, disabled, onSubmit }: Props) {
  const deposit = Math.round(result.total * (DEFAULT_DEPOSIT_PERCENT / 100));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-zinc-500">ราคาประมาณการ</span>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
          Estimated
        </span>
      </div>
      <p className="mt-1 text-3xl font-semibold text-zinc-900">{formatTHB(result.total)}</p>

      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between text-zinc-600">
          <dt>
            ราคา/{unit} × {result.quantity}
          </dt>
          <dd>{formatTHB(result.unitPrice)}</dd>
        </div>
        {result.setupFee > 0 && (
          <div className="flex justify-between text-zinc-600">
            <dt>ค่าธรรมเนียม</dt>
            <dd>{formatTHB(result.setupFee)}</dd>
          </div>
        )}
        <div className="flex justify-between text-zinc-600">
          <dt>ระยะเวลาผลิต (โดยประมาณ)</dt>
          <dd>{result.productionDays} วัน</dd>
        </div>
        <div className="flex justify-between border-t border-zinc-100 pt-2 text-zinc-900">
          <dt>มัดจำ {DEFAULT_DEPOSIT_PERCENT}%</dt>
          <dd className="font-medium">{formatTHB(deposit)}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || submitting}
        className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-orange-500 font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'กำลังส่ง...' : 'ส่งคำขอใบเสนอราคา'}
      </button>
      <p className="mt-2 text-center text-xs text-zinc-400">
        * ราคานี้เป็นราคาประมาณการ ทีมงานจะยืนยันราคาจริงอีกครั้ง
      </p>
    </div>
  );
}
