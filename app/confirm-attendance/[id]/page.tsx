"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, MapPin, Users, Heart, Loader2, MessageSquare } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function ConfirmAttendancePage() {
    const { id } = useParams();
    const [guest, setGuest] = useState<any>(null);
    const [event, setEvent] = useState<any>(null);
    const [companions, setCompanions] = useState(0);
    const [guestMessage, setGuestMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    useEffect(() => {
        if (id) fetchGuestData();
    }, [id]);

    const fetchGuestData = async () => {
        setIsLoading(true);
        try {
            const { data: guestData, error: guestError } = await supabase
                .from('guests')
                .select('*, events(*)')
                .eq('id', id)
                .single();

            if (guestError) throw guestError;
            setGuest(guestData);
            setEvent(guestData.events);
            setCompanions(guestData.companions_count || 0);

            if (guestData.rsvp_status === 'confirmed') {
                setIsConfirmed(true);
            }
        } catch (err: any) {
            console.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const onConfirm = async (status: 'confirmed' | 'declined') => {
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('guests')
                .update({
                    rsvp_status: status,
                    companions_count: guest.gender === 'female' ? companions : 0,
                    guest_message: guestMessage.trim() || null
                })
                .eq('id', id);

            if (error) throw error;

            if (status === 'confirmed') {
                if (guestMessage.trim()) {
                    await supabase.from('guest_messages').insert([{
                        guest_id: id,
                        event_id: event.id,
                        message: guestMessage.trim(),
                        guest_name: guest.name
                    }]);
                }
                setIsConfirmed(true);
            } else {
                alert('تم اعتذارك بنجاح. نتمنى لكم مناسبات سعيدة.');
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <Loader2 className="w-12 h-12 text-[#6A0DAD] animate-spin" />
            </div>
        );
    }

    if (!guest) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6 text-center">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-red-500">حدث خطأ</h2>
                    <p className="text-zinc-500">لم يتم العثور على رابط الدعوة المطلوب.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />
            <main className="max-w-4xl mx-auto px-6 pt-24 pb-24 space-y-8">
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-zinc-100 overflow-hidden text-center">
                    {/* Card Top */}
                    <div className="aspect-[3/4] relative bg-zinc-50">
                        <Image
                            src={event.invitation_image_url || '/placeholder.png'}
                            alt="الدعوة"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="p-10 space-y-8">
                        <div className="space-y-2">
                            <span className="text-[#6A0DAD] font-bold text-sm tracking-widest uppercase">دعوة خاصة لـ</span>
                            <h2 className="text-3xl font-black text-primary font-headline">{guest.name}</h2>
                            <p className="text-zinc-500 font-body">نتشرف بدعوتكم لحضور {event.title}</p>
                        </div>

                        <div className="flex justify-center gap-12 text-zinc-400 text-sm py-4 border-y border-zinc-50">
                            <div className="flex flex-col items-center gap-1">
                                <MapPin className="w-5 h-5 text-[#6A0DAD]" />
                                <span className="font-bold">{event.hall_name}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Users className="w-5 h-5 text-[#6A0DAD]" />
                                <span className="font-bold">حضورك يهمنا</span>
                            </div>
                        </div>

                        {isConfirmed ? (
                            <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 animate-scale-in">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-emerald-700">تم تأكيد حضورك</h3>
                                <p className="text-emerald-600/70 mt-2 font-body">نتطلع لرؤيتك في الحفل بإذن الله.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {guest.gender === 'female' && (
                                    <div className="bg-zinc-50 p-6 rounded-2xl space-y-4">
                                        <label className="text-sm font-bold text-zinc-500 block">عدد المرافقين (من الأطفال أو السيدات)</label>
                                        <div className="flex items-center justify-center gap-6">
                                            <button onClick={() => setCompanions(Math.max(0, companions - 1))} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-bold">-</button>
                                            <span className="text-2xl font-black text-primary w-8">{companions}</span>
                                            <button onClick={() => setCompanions(companions + 1)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-bold">+</button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row gap-4">
                                    <button
                                        onClick={() => onConfirm('confirmed')}
                                        disabled={isSubmitting}
                                        className="flex-[2] bg-[#6A0DAD] text-white py-5 rounded-2xl font-bold text-xl hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : (
                                            <>
                                                <Heart className="w-6 h-6 fill-current text-white/50" />
                                                تأكيد الحضور
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => onConfirm('declined')}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-zinc-100 text-zinc-500 py-5 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
                                    >
                                        اعتذار
                                    </button>
                                </div>

                                <div className="bg-zinc-50 p-6 rounded-2xl space-y-3">
                                    <label className="text-sm font-bold text-zinc-500 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        ترك رسالة للعروسين (اختياري)
                                    </label>
                                    <textarea
                                        value={guestMessage}
                                        onChange={(e) => setGuestMessage(e.target.value)}
                                        placeholder="اكتب تهنئتك هنا..."
                                        maxLength={500}
                                        className="w-full h-24 bg-white border-none rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-[#6A0DAD]/20"
                                    />
                                    <p className="text-xs text-zinc-400 text-left">{guestMessage.length}/500</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <a
                                href={event.location_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[#6A0DAD] font-bold text-sm hover:underline"
                            >
                                <MapPin className="w-4 h-4" /> عرض الموقع على الخريطة
                            </a>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
