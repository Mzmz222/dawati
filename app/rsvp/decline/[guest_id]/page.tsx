"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { XCircle, Heart, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function RSVPDeclinePage() {
    const params = useParams();
    const router = useRouter();
    const guestId = params.guest_id as string;
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [guest, setGuest] = useState<any>(null);

    useEffect(() => {
        if (guestId) declineAttendance();
    }, [guestId]);

    const declineAttendance = async () => {
        try {
            const { data: guestData, error: fetchError } = await supabase
                .from('guests')
                .select('*, events(*)')
                .eq('id', guestId)
                .single();

            if (fetchError) throw fetchError;
            setGuest(guestData);

            const { error } = await supabase
                .from('guests')
                .update({ rsvp_status: 'declined' })
                .eq('id', guestId);

            if (error) throw error;
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-[#6A0DAD] animate-spin mx-auto" />
                    <p className="text-zinc-500">جاري تسجيل اعتذارك...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-zinc-50">
                <Header />
                <main className="max-w-md mx-auto px-6 pt-32 pb-20 text-center">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-lg border border-zinc-100 space-y-4">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                            <Heart className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-amber-600">حدث خطأ</h2>
                        <p className="text-zinc-500">لم نتمكن من تسجيل اعتذارك. الرجاء التواصل مع المنظم.</p>
                        <button onClick={() => router.push('/')} className="px-6 py-3 bg-[#6A0DAD] text-white rounded-xl font-bold">
                            العودة للرئيسية
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />
            <main className="max-w-md mx-auto px-6 pt-32 pb-20 text-center">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-zinc-100 space-y-6 animate-scale-in">
                    <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                        <XCircle className="w-14 h-14 text-amber-600" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-primary font-headline">تم تسجيل اعتذارك</h2>
                        <p className="text-zinc-500 font-body">
                            شكراً لاهتمامك. نتمنى لك مناسبات سعيدة
                        </p>
                    </div>
                    <div className="pt-4">
                        <p className="text-sm text-[#6A0DAD] font-bold">
                            {guest?.events?.title || 'المناسبة'}
                        </p>
                    </div>
                    <button onClick={() => router.push('/')} className="w-full px-6 py-4 bg-[#6A0DAD] text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
                        العودة للرئيسية
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
}
