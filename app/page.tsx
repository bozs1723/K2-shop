import Link from "next/link";
import { APP_NAME, APP_DESCRIPTION, PRODUCT_CATEGORIES } from "@/lib/constants";

const STEPS = [
  { no: "1", title: "ขอราคาทันที", desc: "เลือกสินค้า ขนาด วัสดุ จำนวน และอัปโหลดไฟล์งาน ระบบคำนวณราคาให้อัตโนมัติ" },
  { no: "2", title: "ยืนยันใบเสนอราคา", desc: "รับใบเสนอราคาและยืนยันออเดอร์ พร้อมชำระมัดจำได้ทันที" },
  { no: "3", title: "เข้าสู่สายการผลิต", desc: "ระบบเปิดใบงานอัตโนมัติ ติดตามสถานะ รอผลิต → ผลิต → QC → แพ็ก" },
  { no: "4", title: "จัดส่งถึงมือ", desc: "แจ้งเลขพัสดุและบริษัทขนส่ง ติดตามสถานะการจัดส่งได้ตลอด" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  qr_sign: "🔳",
  acrylic_keychain: "🔑",
  dtg_shirt: "👕",
  sticker: "🏷️",
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white text-zinc-900">
      {/* Navbar */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
              K2
            </span>
            <span>{APP_NAME}</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#products" className="hidden text-zinc-600 hover:text-zinc-900 sm:block">หมวดสินค้า</a>
            <a href="#steps" className="hidden text-zinc-600 hover:text-zinc-900 sm:block">ขั้นตอนสั่งงาน</a>
            <Link
              href="/dashboard"
              className="rounded-full bg-black px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-800"
            >
              เข้าสู่ระบบ
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24 text-center sm:py-32">
        <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600 ring-1 ring-inset ring-orange-200">
          Operating System สำหรับโรงงานงานพิมพ์
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          ผลิตงานพิมพ์และป้าย
          <span className="text-orange-500"> ครบวงจร</span> ในระบบเดียว
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
          {APP_DESCRIPTION} ตั้งแต่ขอราคา ใบเสนอราคา มัดจำ เปิดใบงาน คิวการผลิต ไปจนถึงการจัดส่ง
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/quote"
            className="flex h-12 items-center justify-center rounded-full bg-orange-500 px-8 font-medium text-white transition-colors hover:bg-orange-600"
          >
            ขอราคาทันที
          </Link>
          <Link
            href="/dashboard"
            className="flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 font-medium transition-colors hover:bg-zinc-50"
          >
            เข้าสู่ระบบจัดการ
          </Link>
        </div>
      </section>

      {/* หมวดสินค้า */}
      <section id="products" className="border-t border-zinc-100 bg-zinc-50 py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight">หมวดสินค้า</h2>
          <p className="mt-3 text-center text-zinc-600">สินค้ายอดนิยมที่เราพร้อมผลิตให้คุณ</p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(PRODUCT_CATEGORIES).map(([key, label]) => (
              <div
                key={key}
                className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="text-4xl">{CATEGORY_EMOJI[key] ?? "📦"}</div>
                <h3 className="mt-4 text-lg font-medium">{label}</h3>
                <p className="mt-1 text-sm text-zinc-500">รับผลิตคุณภาพสูง ราคาประเมินได้ทันที</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ขั้นตอนสั่งงาน */}
      <section id="steps" className="py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight">ขั้นตอนสั่งงาน</h2>
          <p className="mt-3 text-center text-zinc-600">ตั้งแต่ขอราคา จนถึงส่งของถึงมือ</p>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.no} className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-semibold text-white">
                  {step.no}
                </div>
                <h3 className="mt-4 text-lg font-medium">{step.title}</h3>
                <p className="mt-1 text-sm text-zinc-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200 py-8">
        <div className="mx-auto w-full max-w-6xl px-6 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} {APP_NAME} · ระบบบริหารโรงงานผลิตงานพิมพ์และป้าย
        </div>
      </footer>
    </div>
  );
}
