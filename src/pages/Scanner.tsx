import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Scan, 
  Search, 
  UserCheck, 
  UserX, 
  ArrowLeft, 
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

export default function Scanner() {
  const { event_id } = useParams();
  const [activeTab, setActiveTab] = useState<'scan' | 'search'>('scan');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'fail' | 'already' , msg: string }>({ type: 'idle', msg: '' });
  const [eventData, setEventData] = useState<any>(null);
  const [attendeeStats, setAttendeeStats] = useState({ present: 0, total: 0 });
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    fetchEventData();
    if (activeTab === 'scan') {
      startScanner();
    } else {
      stopScanner();
    }
    return () => stopScanner();
  }, [activeTab, event_id]);

  const fetchEventData = async () => {
    const { data: event } = await supabase.from('events').select('*').eq('id', event_id).single();
    if (event) setEventData(event);

    const { data: guests } = await supabase.from('guests').select('*').eq('event_id', event_id);
    if (guests) {
      setAttendeeStats({
        present: guests.filter(g => g.attended).length,
        total: guests.length
      });
    }
  };

  const startScanner = () => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scannerRef.current.render(onScanSuccess, onScanError);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  const onScanSuccess = (decodedText: string) => {
    // Expected QR content: invite_uuid
    verifyGuest(decodedText);
  };

  const onScanError = (_err: any) => {
    // console.warn(err);
  };

  const verifyGuest = async (guestId: string) => {
    try {
      const { data: guest, error } = await supabase
        .from('guests')
        .select('*')
        .eq('invite_uuid', guestId)
        .eq('event_id', event_id)
        .single();

      if (error || !guest) {
        showStatus('fail', 'الدعوة غير موجودة!');
        return;
      }

      if (guest.attended) {
        showStatus('already', `الضيف ${guest.name} مسجل مسبقاً!`);
        return;
      }

      const { error: updateError } = await supabase
        .from('guests')
        .update({ attended: true, arrival_time: new Date().toISOString() })
        .eq('id', guest.id); // Use PK for update

      if (updateError) throw updateError;

      showStatus('success', `مرحباً بك، ${guest.name}`);
      fetchEventData(); // Refresh stats
    } catch (err) {
      showStatus('fail', 'حدث خطأ غير متوقع');
    }
  };

  const showStatus = (type: any, msg: string) => {
    setStatus({ type, msg });
    
    // Play sound
    const audioPath = type === 'success' ? '/success_beep.mp3' : '/error_beep.mp3';
    const audio = new Audio(audioPath);
    audio.play().catch(() => {});

    setTimeout(() => setStatus({ type: 'idle', msg: '' }), 4000);
  };

  const onSearch = async () => {
    if (!searchQuery) return;
    const { data } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', event_id)
      .or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
    
    if (data) setSearchResults(data);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-body selection:bg-primary/30">
      {/* Mobile Header */}
      <header className="fixed top-0 w-full z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-white/5 rounded-full">
            <ArrowLeft className="w-5 h-5 text-zinc-400 rotate-180" />
          </button>
          <div>
            <h1 className="font-bold text-sm tracking-tight">{eventData?.title || 'بوابة الدخول'}</h1>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
              <span className="text-emerald-500">{attendeeStats.present} حاضر</span>
              <span>/</span>
              <span>{attendeeStats.total} إجمالي</span>
            </div>
          </div>
        </div>
        <div className="p-2 bg-primary/10 rounded-xl">
           <Scan className="w-5 h-5 text-primary" />
        </div>
      </header>

      {/* Status Overlay */}
      {status.type !== 'idle' && (
        <div className={cn(
          "fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300",
          status.type === 'success' ? "bg-emerald-600/90" : 
          status.type === 'already' ? "bg-amber-600/90" : "bg-red-600/90"
        )}>
          {status.type === 'success' ? <UserCheck className="w-24 h-24 mb-6" /> : <UserX className="w-24 h-24 mb-6" />}
          <h2 className="text-3xl font-bold text-center mb-4 font-headline">{status.msg}</h2>
          <div className="w-full max-w-xs h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white animate-progress"></div>
          </div>
        </div>
      )}

      <main className="pt-20 pb-24 px-6">
        {/* Tabs */}
        <div className="flex bg-zinc-900 rounded-2xl p-1 mb-8">
          <button 
            onClick={() => setActiveTab('scan')}
            className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2", activeTab === 'scan' ? "bg-primary text-white" : "text-zinc-500")}
          >
            <Scan className="w-4 h-4" />
            مسح QR
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2", activeTab === 'search' ? "bg-primary text-white" : "text-zinc-500")}
          >
            <Search className="w-4 h-4" />
            بحث كشف
          </button>
        </div>

        {activeTab === 'scan' ? (
          <div className="space-y-8">
            <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-[2rem] border-4 border-primary/20 bg-zinc-900">
               <div id="reader" className="w-full h-full"></div>
               {/* Custom UI Over HTML5Qrcode */}
               <div className="absolute inset-0 pointer-events-none border-[3rem] border-zinc-950/40"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary rounded-3xl animate-pulse"></div>
            </div>
            <p className="text-center text-zinc-500 text-sm font-body">وجه الكاميرا نحو الرمز الموجود في دعوة الضيف</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input 
                type="text" 
                placeholder="ابحث بالاسم أو رقم الجوال..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                className="w-full bg-zinc-900 border-none rounded-2xl pr-12 pl-4 py-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-primary/40 font-body"
              />
            </div>

            <div className="space-y-3">
              {searchResults.length > 0 ? searchResults.map(guest => (
                <div 
                  key={guest.id}
                  onClick={() => !guest.attended && verifyGuest(guest.invite_uuid)}
                  className={cn(
                    "p-4 rounded-2xl flex items-center justify-between transition-all active:scale-95",
                    guest.attended ? "bg-emerald-500/10 border border-emerald-500/20 opacity-60" : "bg-zinc-900 border border-white/5"
                  )}
                >
                  <div>
                    <h4 className="font-bold">{guest.name}</h4>
                    <p className="text-xs text-zinc-500 font-mono">{guest.phone}</p>
                  </div>
                  {guest.attended ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <div className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded-lg">تسجيل دخول</div>
                  )}
                </div>
              )) : (
                <div className="py-12 text-center text-zinc-600">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="text-sm italic">أدخل الاسم للبحث في الكشف (خاص بالذكور)</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Instructions */}
      <div className="fixed bottom-0 w-full p-6 text-center text-[10px] text-zinc-500 uppercase tracking-widest bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
        نظام أمن البوابات الموحد - دعواتي
      </div>
    </div>
  );
}
