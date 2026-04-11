import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Wallet,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function ConfirmAttendance() {
  const { uuid } = useParams();
  const [guest, setGuest] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchInvitation();
  }, [uuid]);

  const fetchInvitation = async () => {
    try {
      const { data: guestData, error: guestError } = await supabase
        .from('guests')
        .select('*, events(*)')
        .eq('invite_uuid', uuid)
        .single();

      if (guestError || !guestData) throw new Error('الدعوة غير موجودة أو انتهت صلاحيتها');
      
      setGuest(guestData);
      setEvent(guestData.events);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRSVP = async (status: 'confirmed' | 'declined') => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('guests')
        .update({ rsvp_status: status })
        .eq('invite_uuid', uuid);

      if (error) throw error;
      setGuest({ ...guest, rsvp_status: status });
      alert(status === 'confirmed' ? 'شكراً لك، نسعد بحضورك!' : 'نعتذر لعدم تمكنك من الحضور، نلقاك في مناسبات أخرى.');
    } catch (err: any) {
      alert('حدث خطأ أثناء تحديث الحالة');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center p-6 text-center space-y-4">
        <XCircle className="w-16 h-16 text-error opacity-20" />
        <h2 className="text-2xl font-bold text-on-surface font-headline">{error}</h2>
        <button onClick={() => window.location.href = '/'} className="text-primary font-bold">العودة للرئيسية</button>
      </div>
    );
  }

  const isIPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-surface-container-lowest font-body pb-20">
      {/* Visual Header */}
      <div className="h-64 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent"></div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-32 relative z-10 space-y-8">
        {/* Invitation Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-outline-variant/10 text-center space-y-8 animate-fade-in">
          <div className="space-y-2">
             <span className="text-primary font-bold text-xs uppercase tracking-widest">دعوة خاصة</span>
             <h1 className="text-3xl font-black text-on-surface font-headline">{event.title}</h1>
          </div>

          <div className="space-y-1">
             <p className="text-on-surface-variant text-sm">مرحباً بك يا</p>
             <h2 className="text-2xl font-bold text-primary">{guest.name}</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 text-right">
            <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase">التاريخ</p>
                <p className="font-bold">{event.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl">
              <Clock className="w-6 h-6 text-primary" />
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase">الوقت</p>
                <p className="font-bold">الساعة {event.time} مساءً</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl">
              <MapPin className="w-6 h-6 text-primary" />
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase">الموقع</p>
                <p className="font-bold">{event.city} - {event.district}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-4">
             {guest.rsvp_status === 'pending' ? (
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => handleRSVP('confirmed')}
                    disabled={isUpdating}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                  >
                    {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : 'سأحضر بكل سرور'}
                  </button>
                  <button 
                     onClick={() => handleRSVP('declined')}
                     disabled={isUpdating}
                     className="w-full py-4 bg-surface-container-high text-on-surface-variant rounded-2xl font-bold text-lg transition-all active:scale-95"
                  >
                    أعتذر عن الحضور
                  </button>
               </div>
             ) : (
               <div className={cn(
                 "p-6 rounded-[2rem] flex flex-col items-center gap-4 shadow-inner",
                 guest.rsvp_status === 'confirmed' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
               )}>
                  {guest.rsvp_status === 'confirmed' ? (
                    <>
                      <CheckCircle2 className="w-12 h-12" />
                      <div className="space-y-1">
                        <p className="font-bold text-xl font-headline">تم تأكيد حضورك</p>
                        <p className="text-sm opacity-80">نتطلع لرؤيتك في الحفل!</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-12 h-12" />
                      <p className="font-bold text-lg">تم تسجيل اعتذارك عن الحضور</p>
                    </>
                  )}
               </div>
             )}
          </div>
          
          {guest.rsvp_status === 'confirmed' && (
            <div className="space-y-4 pt-4 border-t border-outline-variant/10">
              <p className="text-xs text-on-surface-variant font-bold">خيارات الحفظ السريع</p>
              
              {/* Apple Wallet Button - only show if mobile and has URL */}
              {isIPhone && guest.wallet_pass_url && (
                <a 
                  href={guest.wallet_pass_url}
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
                >
                  <Wallet className="w-6 h-6" />
                  Add to Apple Wallet
                </a>
              )}
              
              {!isIPhone && (
                <p className="text-[10px] text-on-surface-variant italic">يرجى تصوير هذه الشاشة لإبرازها عند البوابة</p>
              )}
            </div>
          )}
        </div>

        {/* Branding Footer */}
        <div className="text-center space-y-2 opacity-40">
           <p className="text-[10px] font-bold tracking-[0.3em] uppercase">Powered by</p>
           <h3 className="text-xl font-black font-headline text-primary">دعواتي DAWATI</h3>
        </div>
      </div>
    </div>
  );
}
