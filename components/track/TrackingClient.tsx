'use client';

import { useState } from 'react';
import { TrackingSearchForm } from './TrackingSearchForm';
import { StatusTimeline, type TrackResult } from './StatusTimeline';
import { Card } from '@/components/ui/Card';

export function TrackingClient({ initialRef = '' }: { initialRef?: string }) {
  const [refValue, setRefValue] = useState(initialRef);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackResult | null>(null);

  async function search() {
    setError(null);
    setResult(null);
    if (!refValue.trim() || !phone.trim()) {
      setError('กรุณากรอกเลขใบเสนอราคาและเบอร์โทร');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ ref: refValue.trim(), phone: phone.trim() });
      const res = await fetch(`/api/track?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'ค้นหาไม่สำเร็จ');
        return;
      }
      setResult(data as TrackResult);
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <TrackingSearchForm
          refValue={refValue}
          phone={phone}
          loading={loading}
          onChange={(next) => {
            if (next.ref !== undefined) setRefValue(next.ref);
            if (next.phone !== undefined) setPhone(next.phone);
          }}
          onSubmit={search}
        />
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </Card>

      {result && <StatusTimeline data={result} />}
    </div>
  );
}
