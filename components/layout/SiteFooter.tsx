import { APP_NAME } from '@/lib/constants';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 py-8">
      <div className="mx-auto w-full max-w-6xl px-4 text-center text-sm text-zinc-500 sm:px-6">
        © {new Date().getFullYear()} {APP_NAME} · ระบบบริหารโรงงานผลิตงานพิมพ์และป้าย
      </div>
    </footer>
  );
}
