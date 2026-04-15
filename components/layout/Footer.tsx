"use client";

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-zinc-100 py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="bg-zinc-50 p-2 rounded-xl">
                        <span className="text-[#6A0DAD] font-black text-xl font-headline">دعواتي</span>
                    </div>
                    <p className="text-zinc-500 text-sm font-body text-center md:text-right">
                        جمال الخط العربي بروح العصر الرقمي.
                    </p>
                </div>

                <nav className="flex gap-8">
                    <Link href="/terms" className="text-zinc-400 text-sm hover:text-primary transition-colors">اتفاقية الاستخدام</Link>
                    <Link href="/privacy" className="text-zinc-400 text-sm hover:text-primary transition-colors">سياسة الخصوصية</Link>
                    <Link href="/support" className="text-zinc-400 text-sm hover:text-primary transition-colors">الدعم الفني</Link>
                </nav>

                <div className="text-zinc-300 text-xs font-mono">
                    © {new Date().getFullYear()} DAWATI.CO
                </div>
            </div>
        </footer>
    );
}
