import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
    subsets: ["arabic", "latin"],
    variable: "--font-cairo",
    display: 'swap',
});

export const metadata: Metadata = {
    title: "دعواتي - منصة الدعوات الرقمية الذكية",
    description: "صمم دعواتك الرقمية الفاخرة وادمجها مع أنظمة الدخول الذكية",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl">
            <body className={`${cairo.variable} font-sans antialiased text-primary selection:bg-surface-container-high selection:text-primary`}>
                {children}
            </body>
        </html>
    );
}
