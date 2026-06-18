import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
            K2
          </span>
          <span className="hidden sm:inline">{APP_NAME}</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-5">
          <Link href="/products" className="px-2 py-2 text-zinc-600 hover:text-zinc-900">
            สินค้า
          </Link>
          <Link href="/track" className="px-2 py-2 text-zinc-600 hover:text-zinc-900">
            ติดตามงาน
          </Link>
          <Link
            href="/quote"
            className="rounded-full bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600"
          >
            ขอราคา
          </Link>
        </nav>
      </div>
    </header>
  );
}
