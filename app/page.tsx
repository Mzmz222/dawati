"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    QrCode as QrIcon,
    Zap,
    Eye,
    BookOpen,
    Users,
    MessageCircle,
    ChevronDown,
    Loader2,
    Phone,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWhatsAppNumber, triggerN8N } from '@/lib/n8n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Home() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [waNumber, setWaNumber] = useState('966500000000');
    const [demoPhone, setDemoPhone] = useState('');
    const [isDemoLoading, setIsDemoLoading] = useState(false);

    const handleSendDemo = async () => {
        if (!/^05\d{8}$/.test(demoPhone)) {
            alert('يرجى إدخال رقم جوال صحيح (05xxxxxxxx)');
            return;
        }
        setIsDemoLoading(true);
        try {
            const result = await triggerN8N({
                action: 'send_preview',
                is_preview: true,
                customer: {
                    name: 'زائر تجريبي',
                    phone: demoPhone
                },
                images: {
                    watermarked: 'https://vohlymyegztabzgikbqv.supabase.co/storage/v1/object/public/templates-images/demo-preview.jpg',
                    original: 'https://vohlymyegztabzgikbqv.supabase.co/storage/v1/object/public/templates-images/demo-preview.jpg'
                }
            });
            if (result.success) {
                alert('تم إرسال الرسالة التجريبية لهاتفك بنجاح!');
                setDemoPhone('');
            } else {
                throw new Error(result.error || 'فشل الإرسال');
            }
        } catch (err: any) {
            alert('حدث خطأ أثناء الإرسال: ' + err.message);
        } finally {
            setIsDemoLoading(false);
        }
    };

    useEffect(() => {
        getWhatsAppNumber().then(setWaNumber);
    }, []);

    const faqs = [
        { q: "هل يمكنني تعديل البيانات بعد الشراء؟", a: "نعم، يمكنك تعديل كافة البيانات (التاريخ، الموقع، الوقت) في أي وقت وبشكل مجاني تماماً حتى بعد إرسال الدعوة." },
        { q: "كيف يتم تأكيد حضور الضيوف؟", a: "يحتوي كل رابط دعوة على نموذج تأكيد الحضور. بمجرد ضغط الضيف على الزر، ستصلك رسالة تنبيه وسيتم تحديث قائمتك تلقائياً." },
        { q: "هل تعمل الدعوات على جميع الهواتف؟", a: "بالتأكيد، تم تحسين جميع القوالب لتعمل بسلاسة فائقة على هواتف الآيفون والأندرويد وبأحجام شاشات مختلفة." }
    ];

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />
            <main className="flex flex-col">
                {/* Hero Section */}
                <section className="relative min-h-[90vh] flex items-center px-6 md:px-20 overflow-hidden text-center justify-center pt-20">
                    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-12 relative z-10">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-[#6A0DAD]/10 text-[#6A0DAD] text-sm font-bold mb-6 animate-fade-in shadow-sm">
                            فخامة رقمية فريدة
                        </span>
                        <h2 className="text-5xl md:text-8xl font-black text-primary mb-8 leading-[1.1] font-headline tracking-tight">
                            صمّم <br />
                            <span className="text-[#6A0DAD]">دعوتك الرقمية</span>
                        </h2>
                        <p className="text-xl text-zinc-500 mb-10 max-w-2xl leading-relaxed mx-auto font-body">
                            دعوات زفاف ومناسبات بأناقة تتجاوز التوقعات. نجمع بين عراقة الخط العربي وحداثة التصميم الرقمي لنهديك تجربة لا تُنسى.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                href="/design"
                                className="px-8 py-5 bg-[#6A0DAD] text-white rounded-2xl font-bold text-xl hover:scale-105 transition-all flex items-center gap-3 shadow-xl shadow-[#6A0DAD]/20"
                            >
                                ابدأ التصميم الآن
                                <ArrowRight className="w-6 h-6" />
                            </Link>
                            <a
                                href={`https://wa.me/${waNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-5 bg-white text-zinc-700 border border-zinc-200 rounded-2xl font-bold text-xl flex items-center gap-3 shadow-sm hover:bg-zinc-50 transition-colors"
                            >
                                <MessageCircle className="w-6 h-6 text-[#25D366]" />
                                تواصل معنا
                            </a>
                        </div>
                    </div>

                    {/* Decorative Orbs */}
                    <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-[#6A0DAD]/5 rounded-full blur-[120px] -z-10"></div>
                    <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] -z-10"></div>
                </section>

                {/* Demo Message Section */}
                <section className="bg-white py-16 border-y border-zinc-100">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <div className="bg-gradient-to-br from-[#6A0DAD]/5 to-amber-500/5 p-12 rounded-[2.5rem] border border-[#6A0DAD]/10 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-primary font-headline">جرب الرسالة التجريبية (مجاناً)</h3>
                                <p className="text-zinc-500 font-body">أدخل رقم جوالك لتصلك عينة من الدعوة الإلكترونية عبر واتساب الآن.</p>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                                <div className="flex-1 relative">
                                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                                    <input 
                                        type="text" 
                                        value={demoPhone}
                                        onChange={(e) => setDemoPhone(e.target.value)}
                                        placeholder="05xxxxxxxx"
                                        className="w-full bg-white border-2 border-zinc-100 rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-[#6A0DAD]/20 transition-all font-body text-right dir-ltr"
                                    />
                                </div>
                                <button 
                                    onClick={handleSendDemo}
                                    disabled={isDemoLoading}
                                    className="px-8 py-4 bg-[#6A0DAD] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#5a0b94] transition-colors shadow-lg shadow-[#6A0DAD]/20 disabled:opacity-50"
                                >
                                    {isDemoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                                    أرسل لي التجربة
                                </button>
                            </div>
                            <p className="text-[10px] text-zinc-400 font-body">سيتم إرسال رسالة واحدة فقط لغرض التجربة. خصوصيتك محفوظة.</p>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20 space-y-4">
                            <h3 className="text-4xl font-black text-primary font-headline">لماذا منصة دعواتي؟</h3>
                            <p className="text-zinc-400 max-w-xl mx-auto font-body">نبتكر الحلول التقنية لنجعل من مناسباتكم ذكريات خالدة في قلوب ضيوفكم.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-10 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 hover:shadow-xl transition-all duration-500">
                                <div className="w-14 h-14 bg-[#6A0DAD]/10 rounded-2xl flex items-center justify-center mb-8">
                                    <QrIcon className="w-8 h-8 text-[#6A0DAD]" />
                                </div>
                                <h4 className="text-2xl font-bold mb-4 font-headline text-primary">الدخول الذكي</h4>
                                <p className="text-zinc-500 leading-relaxed font-body">نظام QR Code متطور يسهل عملية الدخول ويمنع الازدحام عند البوابة.</p>
                            </div>

                            <div className="p-10 rounded-[2.5rem] bg-[#6A0DAD] text-white shadow-2xl shadow-[#6A0DAD]/20 transform md:-translate-y-4">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                                    <Zap className="w-8 h-8 text-amber-300" />
                                </div>
                                <h4 className="text-2xl font-bold mb-4 font-headline">سرعة التنفيذ</h4>
                                <p className="text-white/80 leading-relaxed font-body">احصل على دعوتك الرقمية الجاهزة فوراً بعد الطلب مباشرة دون أي تأخير.</p>
                            </div>

                            <div className="p-10 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 hover:shadow-xl transition-all duration-500">
                                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8">
                                    <Users className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h4 className="text-2xl font-bold mb-4 font-headline text-primary">إدارة الضيوف</h4>
                                <p className="text-zinc-500 leading-relaxed font-body">لوحة تحكم ذكية تمكنك من متابعة من حضر ومن أكد حضوره بكل بساطة.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 bg-zinc-50">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center mb-16 space-y-2">
                            <span className="text-[#6A0DAD] font-bold text-xs uppercase tracking-widest font-body">لديك استفسار؟</span>
                            <h3 className="text-4xl font-black text-primary font-headline">الأسئلة الأكثر شيوعاً</h3>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="p-6 rounded-3xl bg-white text-right border border-zinc-100 cursor-pointer hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex justify-between items-center w-full">
                                        <h4 className="text-lg font-bold text-primary font-headline">{item.q}</h4>
                                        <ChevronDown className={cn("w-5 h-5 text-zinc-300 transition-transform duration-300", openFaq === index && "rotate-180 text-primary")} />
                                    </div>
                                    <div className={cn(
                                        "grid transition-all duration-500 ease-in-out",
                                        openFaq === index ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                                    )}>
                                        <p className="overflow-hidden text-zinc-500 leading-relaxed font-body text-sm">
                                            {item.a}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
