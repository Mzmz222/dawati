"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Calendar,
    Clock,
    MapPin,
    ChevronRight,
    Plus,
    Trash2,
    Send,
    Eye,
    CheckCircle2,
    Loader2,
    QrCode,
    Users,
    History,
    Settings,
    MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { triggerN8N, getWhatsAppNumber } from '@/lib/n8n';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react'; // Adding missing import reported in previous view
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import FeatureSwitcher from '@/components/ui/FeatureSwitcher';

// Constants
// Tiered pricing logic is handled below

// Schemas
const eventSchema = z.object({
    groomName: z.string().min(2, 'اسم العريس مطلوب'),
    brideName: z.string().min(2, 'اسم العروس مطلوب'),
    date: z.string().min(1, 'التاريخ مطلوب'),
    time: z.string().min(1, 'الوقت مطلوب'),
    city: z.string().min(1, 'المدينة مطلوبة'),
    district: z.string().min(1, 'الحي مطلوب'),
    hallName: z.string().min(1, 'اسم القاعة مطلوب'),
    locationUrl: z.string().url('رابط غير صالح').optional().or(z.literal('')),
});

const guestSchema = z.object({
    name: z.string().min(2, 'الاسم مطلوب'),
    phone: z.string().regex(/^05\d{8}$/, 'رقم غير صحيح'),
    gender: z.enum(['male', 'female']),
    companionsCount: z.number().min(0).max(10).default(0),
});

type EventFormData = z.infer<typeof eventSchema>;
type GuestFormData = z.infer<typeof guestSchema>;

export default function DesignPage() {
    const [phase, setPhase] = useState<'setup' | 'guests'>('setup');
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [previewType, setPreviewType] = useState<'invitation' | 'barcode'>('invitation');
    const [isPaid, setIsPaid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [eventId, setEventId] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const isDemo = searchParams.get('demo') === 'true';
    const [guestsPackage, setGuestsPackage] = useState(10);
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [waNumber, setWaNumber] = useState('966500000000');

    // Pricing Logic
    const getPackagePrice = (pkg: number) => {
        if (pkg <= 50) return 200;
        if (pkg <= 90) return 300;
        if (pkg <= 150) return 400;
        if (pkg <= 190) return 500;
        if (pkg <= 250) return 600;
        if (pkg <= 290) return 700;
        if (pkg <= 350) return 800;
        if (pkg <= 390) return 900;
        if (pkg <= 450) return 1000;
        return 1100;
    };

    const totalPrice = getPackagePrice(guestsPackage) + (mediaType === 'video' ? 50 : 0);

    const fetchDemoData = async () => {
        try {
            const { data: setting } = await supabase.from('site_settings').select('value').eq('key', 'demo_template_id').single();
            if (setting?.value) {
                const { data: temp } = await supabase.from('templates').select('*').eq('id', setting.value).single();
                if (temp) setSelectedTemplate(temp);
                reset({
                    groomName: 'فهد',
                    brideName: 'سارة',
                    date: new Date().toISOString().split('T')[0],
                    time: '20:00',
                    city: 'الرياض',
                    district: 'الملقا',
                    hallName: 'قاعة الفخامة',
                    locationUrl: 'https://maps.google.com'
                });
                setIsPaid(false);
            }
        } catch (err) { console.error(err); }
    };
    const [features, setFeatures] = useState({
        reminders: false,
        thank_you: false,
        apple_wallet: false,
        guest_management: true
    });

    useEffect(() => {
        getWhatsAppNumber().then(setWaNumber);
        const userStr = localStorage.getItem('dawati_user');
        if (!userStr && !isDemo) {
            alert('يرجى تسجيل الدخول أولاً لتتمكن من التصميم');
            router.push('/login?redirect=/design');
            return;
        }
        if (isDemo) fetchDemoData();
    }, [isDemo, router]);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<EventFormData>({
        resolver: zodResolver(eventSchema),
    });

    const eventData = watch();

    const {
        control,
        register: registerGuest,
        handleSubmit: handleSubmitGuests,
        watch: watchGuest,
        setValue,
    } = useForm<{ guests: GuestFormData[] }>({
        defaultValues: {
            guests: [{ name: '', phone: '', gender: 'male', companionsCount: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'guests',
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        const { data } = await supabase.from('templates').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
            setTemplates(data);
            setSelectedTemplate(data[0]);
        }
    };

    // Pricing Calculation
    const guestCount = fields.length;
    // Tiered pricing used from guestsPackage instead of guestCount for phase 1 flow

    const onSaveEvent = async (data: EventFormData) => {
        if (!selectedTemplate) {
            alert('يرجى اختيار قالب أولاً');
            return;
        }
        setIsLoading(true);
        try {
            const userStr = localStorage.getItem('dawati_user');
            if (!userStr) throw new Error('يرجى تسجيل الدخول أولاً');
            const user = JSON.parse(userStr);

            const { data: event, error } = await supabase
                .from('events')
                .insert([{
                    user_id: user.id,
                    title: `${data.groomName} & ${data.brideName}`,
                    date: data.date,
                    time: data.time,
                    city: data.city,
                    district: data.district,
                    hall_name: data.hallName,
                    location_url: data.locationUrl,
                    card_template_id: selectedTemplate.id,
                    payment_status: 'unpaid',
                    features
                }])
                .select()
                .single();

            if (error) throw error;
            setEventId(event.id);

            // Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_id: user.id,
                    event_id: event.id,
                    status: 'pending_payment',
                    amount: totalPrice
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // WhatsApp Redirect
            const waNumber = await getWhatsAppNumber();
            const message = `أرغب بتفعيل الطلب رقم (#${order.id}) - المبلغ: (${totalPrice} ر.س) لعدد (${guestCount}) مدعو.`;
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

            alert('تم حفظ المناسبة بنجاح. سيتم توجيهك للواتساب لتأكيد الدفع.');
            window.open(waUrl, '_blank');

            setPhase('guests');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const onAction = async (data: { guests: GuestFormData[] }, action: 'send' | 'save') => {
        if (!eventId) return;
        setIsLoading(true);
        try {
            const validGuests = data.guests.filter(g => g.name && g.phone);

            const { error } = await supabase
                .from('guests')
                .insert(validGuests.map(g => ({
                    event_id: eventId,
                    name: g.name,
                    phone: g.phone,
                    gender: g.gender,
                    companions_count: g.gender === 'female' ? g.companionsCount : 0,
                    rsvp_status: 'pending'
                })));

            if (error) throw error;

            if (action === 'send') {
                const result = await triggerN8N({
                    action: 'send_bulk_invites',
                    is_preview: false,
                    event_id: eventId,
                    guests: validGuests
                });
                if (!result.success) throw new Error('فشل إرسال الدعوات عبر النظام');
                alert('تم إطلاق عملية إرسال الدعوات بنجاح!');
            } else {
                alert('تم حفظ الدعوات بنجاح في قسم (دعواتي). يمكنك إرسالها لاحقاً.');
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />
            <main className="max-w-7xl mx-auto px-6 pt-24 pb-24 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-8">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-extrabold text-primary font-headline tracking-tight">
                            {phase === 'setup' ? 'صمّم دعوتك' : 'قائمة الضيوف'}
                        </h2>
                        <p className="text-zinc-500 font-body">
                            {phase === 'setup' ? 'املأ تفاصيل ليلتكم الكبيرة واحصل على معاينة فورية.' : 'أضف ضيوفك ليقوم النظام بإرسال الدعوات لهم.'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Form Side */}
                    <div className="lg:col-span-7 space-y-8">
                        {phase === 'setup' ? (
                            <form onSubmit={handleSubmit(onSaveEvent)} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-600">اسم العريس</label>
                                        <input {...register('groomName')} disabled={isDemo} placeholder="فهد" className="w-full bg-zinc-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 disabled:opacity-60" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-600">اسم العروس</label>
                                        <input {...register('brideName')} disabled={isDemo} placeholder="سارة" className="w-full bg-zinc-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 disabled:opacity-60" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-600">تاريخ الحفل</label>
                                        <input {...register('date')} disabled={isDemo} type="date" className="w-full bg-zinc-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 disabled:opacity-60" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-600">وقت الحفل</label>
                                        <input {...register('time')} disabled={isDemo} type="time" className="w-full bg-zinc-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 disabled:opacity-60" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-600">المدينة</label>
                                        <input {...register('city')} disabled={isDemo} placeholder="الرياض" className="w-full bg-zinc-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 disabled:opacity-60" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-600">الحي</label>
                                        <input {...register('district')} disabled={isDemo} placeholder="حي الملقا" className="w-full bg-zinc-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 disabled:opacity-60" />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-bold text-zinc-600">اسم القاعة</label>
                                        <input {...register('hallName')} disabled={isDemo} placeholder="قاعة الفخامة" className="w-full bg-zinc-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 disabled:opacity-60" />
                                    </div>
                                </div>

                                <div className="space-y-6 pt-4 border-t border-zinc-100">
                                    <h3 className="text-xl font-bold font-headline">إعدادات الطلب</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-zinc-600">عدد المدعوين</label>
                                            <select value={guestsPackage} onChange={(e) => setGuestsPackage(Number(e.target.value))} disabled={isDemo} className="w-full bg-zinc-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 disabled:opacity-60">
                                                {[...Array(50)].map((_, i) => <option key={i} value={(i + 1) * 10}>{(i + 1) * 10} مدعو</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-zinc-600">نوع الدعوة</label>
                                            <div className="flex bg-zinc-50 p-1 rounded-xl">
                                                <button type="button" onClick={() => !isDemo && setMediaType('image')} className={cn("flex-1 py-2 rounded-lg font-bold text-sm", mediaType === 'image' ? "bg-white shadow text-primary" : "text-zinc-400")}>صورة</button>
                                                <button type="button" onClick={() => !isDemo && setMediaType('video')} className={cn("flex-1 py-2 rounded-lg font-bold text-sm", mediaType === 'video' ? "bg-white shadow text-primary" : "text-zinc-400")}>فيديو (+50)</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg">اختر القالب</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {templates.map(t => (
                                            <div
                                                key={t.id}
                                                className={cn(
                                                    "aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-4 transition-all",
                                                    selectedTemplate?.id === t.id ? "border-[#6A0DAD] shadow-lg" : "border-transparent opacity-60",
                                                    isDemo && "cursor-default"
                                                )}
                                                onClick={() => !isDemo && setSelectedTemplate(t)}
                                            >
                                                <img src={t.preview_image_url} className="w-full h-full object-cover" alt={t.name} />
                                            </div>
                                        ))}
                                        {/* Custom Template Option */}
                                        <div
                                            onClick={() => !isDemo && setSelectedTemplate({ id: 'custom', name: 'تصميم خاص', preview_image_url: '/logo/dawati-logo.png' })}
                                            className={cn(
                                                "aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-4 transition-all flex flex-col items-center justify-center bg-zinc-50 gap-2 border-dashed",
                                                selectedTemplate?.id === 'custom' ? "border-[#6A0DAD] bg-white shadow-lg" : "border-zinc-300 opacity-60"
                                            )}
                                        >
                                            <Plus className="w-8 h-8 text-[#6A0DAD]" />
                                            <span className="text-[10px] font-bold text-zinc-500">تصميم خاص</span>
                                        </div>
                                    </div>

                                    {selectedTemplate?.id === 'custom' && (
                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 animate-fade-in">
                                            <AlertCircle className="w-5 h-5 text-amber-600" />
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-amber-900">ترغب في تصميم فريد؟</p>
                                                <p className="text-[10px] text-amber-800">تحدث معنا لتجهيز التصميم الذي يليق بمناسبتكم.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const user = JSON.parse(localStorage.getItem('dawati_user') || '{}');
                                                    const msg = `مرحباً دعواتي، أنا العميل (${user.full_name || 'جديد'}) أرغب بطلب تصميم خاص لدعوتي.`;
                                                    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
                                                }}
                                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                                            >
                                                <MessageCircle className="w-3 h-3" /> تواصل الآن
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <FeatureSwitcher features={features} onChange={(f: any) => setFeatures(f)} />

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={isLoading || isDemo}
                                        className="w-full py-4 bg-[#6A0DAD] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : (isDemo ? 'لا يمكن الحفظ في نمط التجربة' : 'حفظ وطلب التفعيل')}
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-xl">المدعوين ({fields.length})</h3>
                                    <button
                                        onClick={() => append({ name: '', phone: '', gender: 'male', companionsCount: 0 })}
                                        className="bg-zinc-50 text-[#6A0DAD] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> إضافة مدعو جديد
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="p-4 bg-zinc-50 rounded-2xl flex flex-col md:flex-row gap-4 relative">
                                            <button onClick={() => remove(index)} className="absolute left-2 top-2 text-zinc-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                            <input {...registerGuest(`guests.${index}.name` as const)} placeholder="اسم الضيف" className="flex-1 bg-white border-none rounded-lg p-2 text-sm" />
                                            <input {...registerGuest(`guests.${index}.phone` as const)} placeholder="05xxxxxxxx" className="flex-1 bg-white border-none rounded-lg p-2 text-sm dir-ltr" />
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => setValue(`guests.${index}.gender`, 'male')} className={cn("px-3 py-1 rounded-lg text-xs font-bold", watchGuest(`guests.${index}.gender`) === 'male' ? "bg-[#6A0DAD] text-white" : "bg-white")}>ذكر</button>
                                                <button type="button" onClick={() => setValue(`guests.${index}.gender`, 'female')} className={cn("px-3 py-1 rounded-lg text-xs font-bold", watchGuest(`guests.${index}.gender`) === 'female' ? "bg-pink-500 text-white" : "bg-white")}>أنثى</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-8 space-y-4">
                                    <div className="p-4 bg-zinc-50 rounded-xl flex justify-between items-center">
                                        <span className="font-bold text-zinc-500">التكلفة الإجمالية</span>
                                        <span className="text-2xl font-black text-[#6A0DAD]">{totalPrice} ر.س</span>
                                    </div>
                                    <button
                                        onClick={handleSubmitGuests((data) => onAction(data, 'send'))}
                                        className="w-full py-4 bg-[#6A0DAD] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                                    >
                                        تأكيد وإرسال الدعوات
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview Side */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-zinc-100 flex flex-col items-center">
                                <div className="w-full aspect-[3/4.2] rounded-[2rem] overflow-hidden bg-zinc-50 relative border border-zinc-200">
                                    {/* Watermark */}
                                    {!isPaid && (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none rotate-[-45deg] opacity-10">
                                            <span className="text-5xl font-black tracking-widest">دعواتي DAWATI</span>
                                        </div>
                                    )}

                                    {selectedTemplate && (
                                        <div className="relative w-full h-full">
                                            <img src={selectedTemplate.invitation_image_url} className="w-full h-full object-cover" alt="Preview" />
                                            {/* Dynamic Preview Overlay Text */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                                <h4 className="text-2xl font-bold" style={{ color: selectedTemplate.fields_config?.fields?.[0]?.color }}>
                                                    {eventData.groomName || 'اسم العريس'} & {eventData.brideName || 'اسم العروس'}
                                                </h4>
                                                <p className="mt-4 text-sm opacity-80">{eventData.date || '٢٠٢٦/٠٤/١٣'}</p>
                                                <p className="text-sm opacity-80">{eventData.hallName || 'قاعة الفرح'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 flex gap-2">
                                    <button onClick={() => setPreviewType('invitation')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold", previewType === 'invitation' ? "bg-[#6A0DAD] text-white" : "bg-zinc-100 text-zinc-500")}>دعوة</button>
                                    <button onClick={() => setPreviewType('barcode')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold", previewType === 'barcode' ? "bg-[#6A0DAD] text-white" : "bg-zinc-100 text-zinc-500")}>باركود</button>
                                </div>
                            </div>

                            {/* Pricing Card */}
                            <div className="bg-[#6A0DAD] text-white p-6 rounded-3xl shadow-lg">
                                <h4 className="font-bold flex items-center gap-2 mb-4"><Users className="w-5 h-5" /> تفاصيل التكلفة</h4>
                                <div className="space-y-2 text-sm opacity-90">
                                    <div className="flex justify-between"><span>باقة المدعوين ({guestsPackage})</span><span>{getPackagePrice(guestsPackage)} ر.س</span></div>
                                    {mediaType === 'video' && <div className="flex justify-between"><span>ترقية فيديو</span><span>+50 ر.س</span></div>}
                                    <div className="pt-3 border-t border-white/20 flex justify-between font-black text-xl">
                                        <span>الإجمالي</span>
                                        <span>{totalPrice} ر.س</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
