import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { formatTHB } from '@/lib/utils';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import type { Product } from '@/types';

const CATEGORY_EMOJI: Record<string, string> = {
  qr_sign: '🔳',
  acrylic_keychain: '🔑',
  dtg_shirt: '👕',
  sticker: '🏷️',
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="flex flex-col gap-3 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="text-4xl">{CATEGORY_EMOJI[product.category] ?? '📦'}</span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600">
          {PRODUCT_CATEGORIES[product.category]}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-medium">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{product.description}</p>
        )}
      </div>
      <div className="flex items-end justify-between border-t border-zinc-100 pt-3">
        <div>
          <p className="text-xs text-zinc-400">เริ่มต้น</p>
          <p className="font-semibold text-orange-600">
            {formatTHB(Number(product.base_price))}
            <span className="text-xs font-normal text-zinc-400"> /{product.unit}</span>
          </p>
        </div>
        <Link
          href={`/quote?product=${product.slug}`}
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          ขอราคา
        </Link>
      </div>
    </Card>
  );
}
