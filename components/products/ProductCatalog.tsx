'use client';

import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Product, ProductCategory } from '@/types';

type Filter = 'all' | ProductCategory;

export function ProductCatalog({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Filter>('all');

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'ทั้งหมด' },
    ...(Object.entries(PRODUCT_CATEGORIES) as [ProductCategory, string][]).map(([key, label]) => ({
      key,
      label,
    })),
  ];

  const visible = filter === 'all' ? products : products.filter((p) => p.category === filter);

  return (
    <div>
      {/* Tabs — เลื่อนแนวนอนได้บนมือถือ */}
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
              filter === tab.key
                ? 'bg-black text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500">
          ยังไม่มีสินค้าในหมวดนี้
          <p className="mt-1 text-sm text-zinc-400">
            (หากเพิ่งติดตั้งระบบ กรุณารัน <code>database/seed.sql</code> บน Supabase)
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
