'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatTHB, formatThaiDate } from '@/lib/utils';
import {
  QUOTE_STATUS,
  PRODUCTION_STATUS,
  PRODUCTION_FLOW,
  SHIPMENT_STATUS,
} from '@/lib/constants';
import type { QuoteStatus, ProductionStatus, ShipmentStatus } from '@/types';

export interface TrackResult {
  quote: {
    quote_number: string;
    status: QuoteStatus;
    total: number;
    deposit_amount: number;
    created_at: string;
    customer_name: string;
  };
  job: { job_number: string; status: ProductionStatus; due_date: string | null } | null;
  logs: { status_to: string; note: string | null; created_at: string }[];
  shipment: {
    tracking_number: string | null;
    carrier: string | null;
    status: ShipmentStatus;
    shipped_at: string | null;
  } | null;
}

export function StatusTimeline({ data }: { data: TrackResult }) {
  const { quote, job, shipment } = data;
  const currentIdx = job ? PRODUCTION_FLOW.indexOf(job.status) : -1;

  return (
    <div className="space-y-5">
      {/* ใบเสนอราคา */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">เลขใบเสนอราคา</p>
            <p className="font-mono text-lg font-semibold">{quote.quote_number}</p>
          </div>
          <Badge color={QUOTE_STATUS[quote.status].color}>
            {QUOTE_STATUS[quote.status].label}
          </Badge>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 text-sm">
          <div>
            <dt className="text-zinc-400">ลูกค้า</dt>
            <dd>{quote.customer_name}</dd>
          </div>
          <div>
            <dt className="text-zinc-400">วันที่ขอราคา</dt>
            <dd>{formatThaiDate(quote.created_at)}</dd>
          </div>
          <div>
            <dt className="text-zinc-400">ราคารวม (ประมาณการ)</dt>
            <dd>{formatTHB(Number(quote.total))}</dd>
          </div>
          <div>
            <dt className="text-zinc-400">มัดจำ</dt>
            <dd className="text-orange-600">{formatTHB(Number(quote.deposit_amount))}</dd>
          </div>
        </dl>
      </Card>

      {/* สถานะการผลิต */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">สถานะการผลิต</h3>
          {job && <span className="font-mono text-sm text-zinc-500">{job.job_number}</span>}
        </div>

        {job ? (
          <ol className="mt-5 space-y-4">
            {PRODUCTION_FLOW.map((step, idx) => {
              const done = idx < currentIdx;
              const active = idx === currentIdx;
              return (
                <li key={step} className="flex items-center gap-3">
                  <span
                    className={
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ' +
                      (done
                        ? 'bg-green-500 text-white'
                        : active
                          ? 'bg-orange-500 text-white'
                          : 'bg-zinc-100 text-zinc-400')
                    }
                  >
                    {done ? '✓' : idx + 1}
                  </span>
                  <span
                    className={
                      'text-sm ' + (active ? 'font-semibold text-zinc-900' : 'text-zinc-500')
                    }
                  >
                    {PRODUCTION_STATUS[step].label}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-4 rounded-lg bg-zinc-50 px-3 py-3 text-sm text-zinc-500">
            ยังไม่เริ่มผลิต — รอการยืนยันใบเสนอราคาและชำระมัดจำ
          </p>
        )}

        {job?.due_date && (
          <p className="mt-4 text-sm text-zinc-500">กำหนดเสร็จโดยประมาณ: {formatThaiDate(job.due_date)}</p>
        )}
      </Card>

      {/* การจัดส่ง */}
      {shipment && (
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">การจัดส่ง</h3>
            <Badge color={SHIPMENT_STATUS[shipment.status].color}>
              {SHIPMENT_STATUS[shipment.status].label}
            </Badge>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 text-sm">
            <div>
              <dt className="text-zinc-400">บริษัทขนส่ง</dt>
              <dd>{shipment.carrier ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-zinc-400">เลขพัสดุ</dt>
              <dd className="font-mono">{shipment.tracking_number ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-zinc-400">วันที่ส่ง</dt>
              <dd>{formatThaiDate(shipment.shipped_at)}</dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}
