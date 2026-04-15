"use client";

import Link from 'next/link';
import { User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="bg-white/80 backdrop-blur-md fixed top-0 w-full z-50 bg-zinc-50 shadow-sm">
            <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">

                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-white p-1.5 rounded-xl shadow-sm transition-transform group-hover:scale-105">
                            <Image
                                src="/logo/dawati-logo.png"
                                alt="دعواتي"
                                width={40}
                                height={40}
                                className="h-8 md:h-10 w-auto object-contain"
                            />
                        </div>
                    </Link>
                </div>

                <nav className="hidden md:flex gap-8">
                    <Link
                        href="/design"
                        className={cn(
                            "text-zinc-600 font-bold font-headline hover:text-primary transition-colors px-2 py-1 rounded",
                            pathname === '/design' && "text-primary"
                        )}
                    >
                        المصمّم
                    </Link>
                    <Link
                        href="/my-events"
                        className={cn(
                            "text-zinc-600 font-bold font-headline hover:text-primary transition-colors px-2 py-1 rounded",
                            pathname === '/my-events' && "text-primary"
                        )}
                    >
                        دعواتي
                    </Link>
                </nav>

                <Link
                    href="/login"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#6A0DAD] font-bold overflow-hidden ring-2 ring-zinc-100 cursor-pointer active:scale-95 duration-200 shadow-sm"
                >
                    <User className="w-6 h-6" />
                </Link>
            </div>
        </header>
    );
}
