import { redirect } from "next/navigation";
import Link from "next/link";
import { resolveToken } from "@/lib/links";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function RedirectPage({ params }: PageProps) {
  const { token } = await params;
  const url = resolveToken(token);

  if (url) {
    redirect(url);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center space-y-4 animate-fade-in">
        <div className="text-7xl font-bold text-red-600">404</div>
        <h1 className="text-xl font-semibold text-zinc-100">ลิ้งค์หมดอายุ</h1>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto">
          ลิ้งค์นี้ถูกใช้ไปแล้วหรือไม่มีอยู่
        </p>
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
          ← กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
