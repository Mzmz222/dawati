"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Mail, Phone, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [fullName, setFullName] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Simple Auth simulation / Supabase check
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('phone', phone)
                .single();

            if (error && error.code === 'PGRST116') {
                if (!isNewUser) {
                    setIsNewUser(true);
                    setIsLoading(false);
                    return;
                }
                // Register new user
                const { data: newUser, error: regError } = await supabase
                    .from('users')
                    .insert([{ full_name: fullName, phone }])
                    .select()
                    .single();
                if (regError) throw regError;
                localStorage.setItem('dawati_user', JSON.stringify(newUser));
            } else if (data) {
                localStorage.setItem('dawati_user', JSON.stringify(data));
            } else {
                throw new Error('حدث خطأ أثناء تسجيل الدخول');
            }

            window.location.href = '/design';
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />
            <main className="flex items-center justify-center p-6 min-h-screen pt-20">
                <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-zinc-100 animate-scale-in">
                    <div className="text-center space-y-4 mb-10">
                        <div className="w-16 h-16 bg-[#6A0DAD]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-8 h-8 text-[#6A0DAD]" />
                        </div>
                        <h2 className="text-3xl font-black text-primary font-headline">مرحباً بك مجدداً</h2>
                        <p className="text-zinc-500 font-body">سجل دخولك لتصميم وإدارة دعواتك</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-600 px-1">رقم الجوال</label>
                            <div className="relative">
                                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="05xxxxxxxx"
                                    className="w-full bg-zinc-50 border-none rounded-2xl p-4 pr-12 focus:ring-2 focus:ring-[#6A0DAD]/20 font-body text-left dir-ltr"
                                    required
                                />
                            </div>
                        </div>

                        {isNewUser && (
                            <div className="space-y-2 animate-fade-in">
                                <label className="text-sm font-bold text-zinc-600 px-1">الاسم الكامل</label>
                                <div className="relative">
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="مثال: فهد القرني"
                                        className="w-full bg-zinc-50 border-none rounded-2xl p-4 pr-12 focus:ring-2 focus:ring-[#6A0DAD]/20 font-body"
                                        required={isNewUser}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#6A0DAD] text-white py-5 rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    {isNewUser ? 'إنشاء حساب جديد' : 'متابعة'}
                                    <ArrowLeft className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-zinc-400 font-body leading-relaxed">
                        باستمرارك، فإنك توافق على <Link href="/terms" className="underline hover:text-[#6A0DAD]">اتفاقية الاستخدام</Link> و <Link href="/privacy" className="underline hover:text-[#6A0DAD]">سياسة الخصوصية</Link> الخاصة بنا.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
