"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Mail,
    Calendar,
    MapPin,
    ChevronLeft,
    Loader2,
    CreditCard,
    CheckCircle2,
    Settings2,
    Users,
    Bell,
    Heart,
    Smartphone,
    Lock,
    Unlock,
    Trash2,
    Plus,
    AlertCircle,
    Save,
    MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const FEATURE_PRICES = {
    reminders: 50,
    thank_you: 50,
    apple_wallet: 100,
    guest_management: 0 // Base guest management is free (up to 10)
};

const BASE_PRICE = 250;
const EXTRA_GUEST_PRICE = 15;
const FREE_GUESTS = 10;

export default function MyEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [localFeatures, setLocalFeatures] = useState<any>({});
    const [localGuests, setLocalGuests] = useState<any[]>([]);
    const [guestMessages, setGuestMessages] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const userStr = localStorage.getItem('dawati_user');
            if (!userStr) {
                window.location.href = '/login';
                return;
            }
            const user = JSON.parse(userStr);

            const { data, error } = await supabase
                .from('events')
                .select('*, guests(*), orders(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEvents(data || []);
        } catch (err: any) {
            console.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectEvent = async (event: any) => {
        setSelectedEventId(event.id);
        setLocalFeatures(event.features || {});
        setLocalGuests(event.guests || []);

        const { data: messages } = await supabase
            .from('guest_messages')
            .select('*')
            .eq('event_id', event.id)
            .order('created_at', { ascending: false });
        setGuestMessages(messages || []);
    };

    // Live Pricing Calculation
    const calculateLivePrice = () => {
        let total = BASE_PRICE;

        // Features
        Object.keys(FEATURE_PRICES).forEach(key => {
            if (localFeatures[key]) {
                total += FEATURE_PRICES[key as keyof typeof FEATURE_PRICES];
            }
        });

        // Guests
        const extraGuests = Math.max(0, localGuests.length - FREE_GUESTS);
        total += extraGuests * EXTRA_GUEST_PRICE;

        return total;
    };

    const toggleFeature = (feature: string) => {
        const event = events.find(e => e.id === selectedEventId);
        if (event?.is_locked) {
            alert('هذه المناسبة مقفلة. يرجى التواصل مع الإدارة لإجراء تعديلات.');
            return;
        }
        setLocalFeatures({ ...localFeatures, [feature]: !localFeatures[feature] });
    };

    const updateGuests = async (newGuests: any[]) => {
        const event = events.find(e => e.id === selectedEventId);
        if (event?.is_locked) return;
        setLocalGuests(newGuests);
    };

    const handleFinalLock = async () => {
        const confirmLock = confirm('هل أنت متأكد من القفل النهائي؟ لن تتمكن من تعديل القالب أو الميزات بعد هذه الخطوة.');
        if (!confirmLock) return;

        setIsSaving(true);
        try {
            const total = calculateLivePrice();

            // 1. Update Event
            const { error: eventError } = await supabase
                .from('events')
                .update({
                    features: localFeatures,
                    is_locked: true
                })
                .eq('id', selectedEventId);

            if (eventError) throw eventError;

            // 2. Update Order
            const { error: orderError } = await supabase
                .from('orders')
                .update({ amount: total })
                .eq('event_id', selectedEventId);

            if (orderError) throw orderError;

            alert('تم القفل بنجاح. سنقوم بتجهيز دعوتك الآن.');
            fetchEvents();
            setSelectedEventId(null);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />
            <main className="max-w-7xl mx-auto px-6 pt-24 pb-24 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-8">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-extrabold text-primary font-headline tracking-tight">دعواتي</h2>
                        <p className="text-zinc-500 font-body">استعرض وادمج وأدر كافة مناسباتك من مكان واحد.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-12 h-12 text-[#6A0DAD] animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Events List */}
                        <div className={cn("space-y-6", selectedEventId ? "lg:col-span-4" : "lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8")}>
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    onClick={() => handleSelectEvent(event)}
                                    className={cn(
                                        "bg-white rounded-[2rem] overflow-hidden shadow-sm border border-zinc-100 cursor-pointer transition-all duration-300",
                                        selectedEventId === event.id ? "ring-2 ring-[#6A0DAD] shadow-lg" : "hover:shadow-xl"
                                    )}
                                >
                                    <div className="aspect-video relative bg-zinc-100">
                                        <Image src={event.preview_image_url || '/placeholder.png'} alt={event.title} fill className="object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
                                            <h3 className="text-white font-bold">{event.title}</h3>
                                        </div>
                                    </div>
                                    <div className="p-4 flex justify-between items-center bg-zinc-50/50">
                                        <span className="text-[10px] font-bold text-zinc-400">{new Date(event.date).toLocaleDateString('ar-SA')}</span>
                                        {event.is_locked ? <Lock className="w-4 h-4 text-emerald-500" /> : <Settings2 className="w-4 h-4 text-zinc-300" />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Event Details & Controls */}
                        {selectedEventId && (
                            <div className="lg:col-span-8 space-y-8 animate-fade-in-up">
                                <div className="bg-white rounded-[2.5rem] shadow-xl border border-zinc-100 overflow-hidden">
                                    <div className="p-8 space-y-10">
                                        {/* Header */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-3xl font-black text-primary font-headline">{events.find(e => e.id === selectedEventId)?.title}</h3>
                                                <p className="text-zinc-500 text-sm mt-1">تخصيص الميزات وإدارة قائمة المدعوين</p>
                                            </div>
                                            <div className="px-4 py-2 bg-zinc-50 rounded-xl text-center">
                                                <span className="block text-[10px] text-zinc-400 font-bold uppercase">السعر الحالي</span>
                                                <span className="text-2xl font-black text-[#6A0DAD]">{calculateLivePrice()} ر.س</span>
                                            </div>
                                        </div>

                                        {/* Feature Toggles */}
                                        <div className="space-y-4">
                                            <h4 className="font-bold flex items-center gap-2"><Settings2 className="w-5 h-5" /> تفعيل الميزات الإضافية</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[
                                                    { id: 'reminders', label: 'رسائل تذكير واتساب', icon: Bell, price: 50 },
                                                    { id: 'thank_you', label: 'رسائل شكر بعد الحفل', icon: Heart, price: 50 },
                                                    { id: 'apple_wallet', label: 'كروت Apple Wallet', icon: Smartphone, price: 100 },
                                                ].map(f => (
                                                    <div
                                                        key={f.id}
                                                        onClick={() => toggleFeature(f.id)}
                                                        className={cn(
                                                            "p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                                                            localFeatures[f.id] ? "border-[#6A0DAD] bg-[#6A0DAD]/5" : "border-zinc-100 hover:border-zinc-200"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", localFeatures[f.id] ? "bg-[#6A0DAD] text-white" : "bg-zinc-100 text-zinc-400")}>
                                                                <f.icon className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm">{f.label}</p>
                                                                <p className="text-[10px] text-zinc-400">+{f.price} ر.س</p>
                                                            </div>
                                                        </div>
                                                        <div className={cn("w-10 h-5 rounded-full relative transition-all", localFeatures[f.id] ? "bg-[#6A0DAD]" : "bg-zinc-200")}>
                                                            <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", localFeatures[f.id] ? "right-6" : "right-1")} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Guest Management */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold flex items-center gap-2"><Users className="w-5 h-5" /> قائمة المدعوين ({localGuests.length})</h4>
                                                {!events.find(e => e.id === selectedEventId)?.is_locked && (
                                                    <button
                                                        onClick={() => updateGuests([...localGuests, { name: '', phone: '', gender: 'male' }])}
                                                        className="text-xs font-bold text-[#6A0DAD] bg-[#6A0DAD]/5 px-3 py-1 rounded-lg"
                                                    >
                                                        + إضافة مدعو
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                                {localGuests.map((g, idx) => (
                                                    <div key={idx} className="p-3 bg-zinc-50 rounded-xl flex items-center gap-4 border border-zinc-100 relative group">
                                                        <span className="text-[10px] text-zinc-300 font-bold">{idx + 1}</span>
                                                        <input
                                                            placeholder="اسم الضيف"
                                                            className="flex-1 bg-transparent border-none text-sm p-0 focus:ring-0"
                                                            defaultValue={g.name}
                                                            onBlur={(e) => {
                                                                const updated = [...localGuests];
                                                                updated[idx].name = e.target.value;
                                                                updateGuests(updated);
                                                            }}
                                                            disabled={events.find(e => e.id === selectedEventId)?.is_locked}
                                                        />
                                                        <input
                                                            placeholder="الجوال"
                                                            className="w-24 bg-transparent border-none text-sm p-0 focus:ring-0 dir-ltr text-xs"
                                                            defaultValue={g.phone}
                                                            onBlur={(e) => {
                                                                const updated = [...localGuests];
                                                                updated[idx].phone = e.target.value;
                                                                updateGuests(updated);
                                                            }}
                                                            disabled={events.find(e => e.id === selectedEventId)?.is_locked}
                                                        />
                                                        {!events.find(e => e.id === selectedEventId)?.is_locked && (
                                                            <button
                                                                onClick={() => updateGuests(localGuests.filter((_, i) => i !== idx))}
                                                                className="text-zinc-300 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                </div>
                                            </div>

                                        {/* Guest Messages */}
                                        {guestMessages.length > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="font-bold flex items-center gap-2">
                                                    <MessageCircle className="w-5 h-5" /> 
                                                    رسائل الضيوف ({guestMessages.length})
                                                </h4>
                                                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                                                    {guestMessages.map((msg, idx) => (
                                                        <div key={idx} className="p-4 bg-gradient-to-r from-[#6A0DAD]/5 to-pink-50 rounded-2xl border border-zinc-100">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <p className="font-bold text-sm text-primary">{msg.guest_name}</p>
                                                                <span className="text-[10px] text-zinc-400">
                                                                    {new Date(msg.created_at).toLocaleDateString('ar-SA')}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-zinc-600 leading-relaxed font-body">{msg.message}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer Actions */}
                                        <div className="pt-8 border-t border-zinc-50 space-y-6">
                                            <div className="bg-amber-50 p-4 rounded-xl flex gap-3">
                                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                                <p className="text-xs text-amber-800 leading-relaxed font-body">قفل المناسبة يعني تأكيدك لجميع الميزات والقائمة. بعد القفل، سيتم إصدار الفاتورة النهائية ولا يمكن التعديل إلا عبر الدعم الفني.</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={handleFinalLock}
                                                    disabled={events.find(e => e.id === selectedEventId)?.is_locked || isSaving}
                                                    className="flex-1 py-5 bg-[#6A0DAD] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {isSaving ? <Loader2 className="animate-spin" /> : (
                                                        <>
                                                            <Lock className="w-5 h-5" />
                                                            تأكيد وحفظ نهائي
                                                        </>
                                                    )}
                                                </button>
                                                {!events.find(e => e.id === selectedEventId)?.is_locked && (
                                                    <button
                                                        onClick={() => setSelectedEventId(null)}
                                                        className="px-8 py-5 bg-zinc-100 text-zinc-500 rounded-2xl font-bold"
                                                    >
                                                        إلغاء
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
