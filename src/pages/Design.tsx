import { useState } from 'react';
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
  Users
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { triggerN8N, getWhatsAppNumber } from '../lib/n8n';

// Schemas
const eventSchema = z.object({
  title: z.string().min(3, 'عنوان المناسبة مطلوب'),
  date: z.string().min(1, 'التاريخ مطلوب'),
  time: z.string().min(1, 'الوقت مطلوب'),
  city: z.string().min(1, 'المدينة مطلوبة'),
  district: z.string().min(1, 'الحي مطلوب'),
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

export default function Design() {
  const [phase, setPhase] = useState<'setup' | 'guests'>('setup');
  const [selectedTemplate, setSelectedTemplate] = useState('royal_elegance');
  const [previewType, setPreviewType] = useState<'invitation' | 'barcode'>('invitation');
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
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
      guests: Array(10).fill({ name: '', phone: '', gender: 'male', companionsCount: 0 }),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'guests',
  });

  const totalGuests = fields.length;
  const baseCost = 250;
  const extraGuestCost = 15;
  const totalCost = baseCost + (totalGuests > 10 ? (totalGuests - 10) * extraGuestCost : 0);

  const onSaveEvent = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem('dawati_user');
      if (!userStr) throw new Error('يرجى تسجيل الدخول أولاً');
      const user = JSON.parse(userStr);

      const { data: event, error } = await supabase
        .from('events')
        .insert([{
          user_id: user.id,
          title: data.title,
          date: data.date,
          time: data.time,
          city: data.city,
          district: data.district,
          location_url: data.locationUrl,
          card_template_id: selectedTemplate,
          payment_status: 'unpaid'
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
          amount: totalCost
        }])
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // WhatsApp Redirect
      const waNumber = await getWhatsAppNumber();
      const message = `أرغب بتفعيل الطلب رقم (#${order.id}) - المبلغ: (${totalCost} ر.س)`;
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

  const onSendPreview = async () => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem('dawati_user');
      if (!userStr) throw new Error('يرجى تسجيل الدخول أولاً');
      const user = JSON.parse(userStr);

      const result = await triggerN8N({
        action: 'send_preview',
        is_preview: true,
        customer: {
          name: user.full_name,
          phone: user.phone
        },
        event_id: eventId || undefined,
        images: {
          watermarked: 'https://example.com/preview-watermarked.jpg', // Placeholder
          original: 'https://example.com/preview-original.jpg'
        }
      });

      if (result.success) {
        alert('تم إرسال المعاينة لهاتفك بنجاح!');
      } else {
        throw new Error(result.error);
      }
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
        const response = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'send_bulk_invites',
            eventId: eventId,
            guests: validGuests
          }),
        });
        if (!response.ok) throw new Error('فشل إرسال الدعوات عبر النظام');
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
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/20 pb-8">
        <div className="space-y-2">
          <span className="text-sm font-bold tracking-widest text-primary uppercase font-headline">
            {phase === 'setup' ? 'تصميم المناسبة' : 'إدارة المدعوين'}
          </span>
          <h2 className="text-5xl font-extrabold text-on-surface tracking-tight font-headline">
            {phase === 'setup' ? 'صمّم دعوتك الرقمية' : 'قائمة الضيوف'}
          </h2>
        </div>
        <p className="text-on-surface-variant max-w-md text-lg leading-relaxed font-body">
          {phase === 'setup' 
            ? 'ابتكر دعوة زفافك بلمسة عصرية تحاكي فخامة الورق وتطور التقنية.'
            : 'أضف ضيوفك وتابع حضورهم، النظام سيتولى إشعارهم فورياً.'}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
        {/* Left Column: Form / Guest List */}
        <div className="space-y-12">
          {phase === 'setup' ? (
            <form id="event-form" onSubmit={handleSubmit(onSaveEvent)} className="bg-white p-10 rounded-3xl shadow-sm border border-outline-variant/10 space-y-8">
              <h3 className="text-2xl font-bold text-primary flex items-center gap-3 font-headline">
                <Calendar className="w-6 h-6" />
                تفاصيل المناسبة
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-body">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant px-1">عنوان المناسبة</label>
                  <input
                    {...register('title')}
                    placeholder="زفاف ناصر وسارة"
                    className={cn("w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20", errors.title && "ring-2 ring-error")}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant px-1">تاريخ الحفل</label>
                  <input
                    {...register('date')}
                    type="date"
                    className={cn("w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20", errors.date && "ring-2 ring-error")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant px-1">وقت الحفل</label>
                  <input
                    {...register('time')}
                    type="time"
                    className={cn("w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20", errors.time && "ring-2 ring-error")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant px-1">المدينة</label>
                  <input
                    {...register('city')}
                    placeholder="الرياض"
                    className={cn("w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20", errors.city && "ring-2 ring-error")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant px-1">الحي</label>
                  <input
                    {...register('district')}
                    placeholder="حي الملقا"
                    className={cn("w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20", errors.district && "ring-2 ring-error")}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant px-1">رابط خريطة قوقل</label>
                  <input
                    {...register('locationUrl')}
                    placeholder="https://maps.app.goo.gl/..."
                    className={cn("w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20", errors.locationUrl && "ring-2 ring-error")}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-on-surface font-headline">اختر قالب الدعوة والباركود</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {['royal_elegance', 'modern_chic', 'classic_gold'].map((temp) => (
                    <div 
                      key={temp}
                      onClick={() => setSelectedTemplate(temp)}
                      className={cn(
                        "relative aspect-[3/4] cursor-pointer rounded-2xl overflow-hidden border-4 transition-all",
                        selectedTemplate === temp ? "border-primary scale-105 shadow-xl ring-4 ring-primary/10" : "border-transparent opacity-60"
                      )}
                    >
                      <img 
                        src={`https://images.unsplash.com/photo-1621342621453-9d0d343c1fcb?q=80&w=300`} 
                        alt={temp}
                        className="w-full h-full object-cover"
                      />
                      {selectedTemplate === temp && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center border-2 border-primary">
                          <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-gradient-to-r from-primary to-deeppurple-700 text-white rounded-2xl font-bold text-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all hover:opacity-90 active:scale-95"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      حفظ وطلب التفعيل
                      <ChevronRight className="w-6 h-6" />
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={onSendPreview}
                  disabled={isLoading}
                  className="w-full py-4 bg-white text-primary border-2 border-primary rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:bg-primary/5 active:scale-95"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      أرسل معاينة لنفسي (مجاناً)
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-outline-variant/10 space-y-8 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-primary flex items-center gap-3 font-headline">
                  <Users className="w-6 h-6" />
                  قائمة المدعوين
                </h3>
                <button 
                  onClick={() => append({ name: '', phone: '', gender: 'male', companionsCount: 0 })}
                  className="flex items-center gap-2 text-primary font-bold hover:underline"
                >
                  <Plus className="w-5 h-5" />
                  إضافة مدعو
                </button>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-6 bg-surface-container-low rounded-2xl space-y-4 relative group">
                    <button 
                      onClick={() => remove(index)}
                      className="absolute left-6 top-6 text-on-surface-variant hover:text-error transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        {...registerGuest(`guests.${index}.name` as const)}
                        placeholder="اسم الضيف"
                        className="bg-white border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 font-body"
                      />
                      <input
                        {...registerGuest(`guests.${index}.phone` as const)}
                        placeholder="05xxxxxxxx"
                        className="bg-white border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 font-body text-left dir-ltr"
                      />
                      
                      <div className="flex gap-4 p-1 bg-white rounded-xl">
                        <button
                          type="button"
                          onClick={() => setValue(`guests.${index}.gender`, 'male')}
                          className={cn(
                            "flex-1 py-1 px-3 rounded-lg text-xs font-bold transition-all",
                            watchGuest(`guests.${index}.gender`) === 'male' ? "bg-primary text-white" : "text-on-surface-variant"
                          )}
                        >ذكر</button>
                        <button
                          type="button"
                          onClick={() => setValue(`guests.${index}.gender`, 'female')}
                          className={cn(
                            "flex-1 py-1 px-3 rounded-lg text-xs font-bold transition-all",
                            watchGuest(`guests.${index}.gender`) === 'female' ? "bg-secondary text-white" : "text-on-surface-variant"
                          )}
                        >أنثى</button>
                      </div>

                      {watchGuest(`guests.${index}.gender`) === 'female' && (
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-bold text-on-surface-variant">المرافقين:</label>
                          <select 
                            {...registerGuest(`guests.${index}.companionsCount` as const, { valueAsNumber: true })}
                            className="bg-white border-none rounded-xl py-1 px-4 focus:ring-2 focus:ring-primary/20 text-xs font-bold"
                          >
                            {[...Array(11)].map((_, i) => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={handleSubmitGuests((data) => onAction(data, 'send'))}
                  disabled={isLoading}
                  className="flex-1 py-5 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      تأكيد الحضور والإرسال
                      <Send className="w-6 h-6" />
                    </>
                  )}
                </button>
                <button
                  onClick={handleSubmitGuests((data) => onAction(data, 'save'))}
                  disabled={isLoading}
                  className="flex-1 py-5 bg-white text-primary border-2 border-primary rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 hover:bg-primary/5"
                >
                  حفظ بدون إرسال
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Preview & Summary */}
        <div className="relative">
          <div className="sticky top-32 space-y-8">
            {/* Template Type Switcher */}
            <div className="flex p-1 bg-surface-container rounded-2xl w-fit mx-auto mb-6">
              <button 
                onClick={() => setPreviewType('invitation')}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                  previewType === 'invitation' ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
                )}
              >
                كرت الدعوة
              </button>
              <button 
                onClick={() => setPreviewType('barcode')}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                  previewType === 'barcode' ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
                )}
              >
                كرت الباركود
              </button>
            </div>

            {/* Live Preview Card */}
            <div className="bg-surface-container-lowest p-4 rounded-[2.5rem] shadow-2xl border border-outline-variant/10 relative overflow-hidden group">
              {/* Luxury Watermark */}
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="text-surface-container-highest/60 text-7xl font-black uppercase tracking-[1em] -rotate-45 whitespace-nowrap opacity-20 select-none">
                  دعواتي - DAWATI
                </div>
              </div>

              <div className="relative aspect-[3/4.5] rounded-3xl overflow-hidden bg-white shadow-inner flex flex-col items-center justify-center text-center p-12 border border-primary/5">
                {/* Texture background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')]"></div>
                
                {previewType === 'invitation' ? (
                  <div className="relative z-10 space-y-8 animate-fade-in w-full">
                    <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
                      <QrCode className="w-8 h-8 text-primary opacity-40" />
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-headline font-bold text-3xl text-primary underline decoration-primary/20 underline-offset-8">
                        {eventData.title || 'عنوان المناسبة'}
                      </h4>
                      <div className="w-16 h-0.5 bg-primary/20 mx-auto"></div>
                      <p className="font-serif italic text-lg text-on-surface-variant leading-relaxed max-w-xs mx-auto">
                        بكل الحب، ندعوكم لمشاركتنا فرحة العمر في ليلة تكتمل بوجودكم
                      </p>
                    </div>

                    <div className="space-y-4 font-headline font-semibold text-sm uppercase tracking-[0.2em] text-primary bg-primary/5 p-6 rounded-2xl">
                      <div className="flex items-center justify-center gap-3">
                        <Calendar className="w-4 h-4 opacity-70" />
                        {eventData.date || 'اليوم، التاريخ'}
                      </div>
                      <div className="flex items-center justify-center gap-3">
                         <Clock className="w-4 h-4 opacity-70" />
                         الساعة {eventData.time || '00:00'} مساءً
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <MapPin className="w-4 h-4 opacity-70" />
                        {eventData.city || 'المدينة'} - {eventData.district || 'الحي'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 space-y-12 animate-scale-in w-full flex flex-col items-center">
                    <div className="space-y-4">
                      <h4 className="font-headline font-bold text-xl text-primary tracking-widest uppercase">بطاقة الدخول الذكية</h4>
                      <p className="text-on-surface-variant text-sm font-body">الرجاء إبراز هذا الكود عند البوابة</p>
                    </div>
                    
                    <div className="relative p-6 bg-white rounded-[2rem] shadow-2xl border-4 border-primary/10">
                       <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=DawatiGuest&color=512da8" 
                        alt="Preview QR"
                        className="w-48 h-48"
                      />
                    </div>

                    <div className="space-y-1 italic opacity-60 font-headline text-[10px] tracking-widest text-primary">
                       <p>DESIGNED BY DAWATI ATELIER</p>
                       <p>ENCRYPTED SMART ACCESS</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-6 -right-6 -left-6 bg-white/95 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-lg flex items-center justify-between z-30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold font-headline">معاينة {previewType === 'invitation' ? 'الدعوة' : 'الباركود'}</p>
                    <p className="text-xs text-on-surface-variant font-body">تحديث تلقائي لحظي</p>
                  </div>
                </div>
                {isPaid && (
                  <span className="bg-emerald-100 text-emerald-700 font-bold text-xs px-4 py-2 rounded-full flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    تم الدفع
                  </span>
                )}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 space-y-6">
              <h4 className="text-lg font-bold text-primary font-headline">ملخص التكاليف</h4>
              <div className="space-y-3 font-body">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant text-muted-foreground">التصميم والخدمة الأساسية (أول ١٠ مدعوين)</span>
                  <span className="font-bold">{baseCost} ر.س</span>
                </div>
                {totalGuests > 10 && (
                  <div className="flex justify-between text-sm text-secondary">
                    <span>مدعوين إضافيين ({totalGuests - 10} × {extraGuestCost} ر.س)</span>
                    <span className="font-bold">{(totalGuests - 10) * extraGuestCost} ر.س</span>
                  </div>
                )}
                <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                  <span className="text-xl font-bold font-headline">الإجمالي</span>
                  <span className="text-3xl font-black text-primary font-headline">{totalCost} <span className="text-sm font-normal">ر.س</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
