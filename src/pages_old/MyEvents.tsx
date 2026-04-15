import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Copy,
  Plus,
  ArrowRight,
  Image as ImageIcon,
  Youtube,
  QrCode
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  city: string;
  district: string;
  status: string;
}

interface Stats {
  total: number;
  accepted: number;
  declined: number;
  pending: number;
  attended: number;
  companions: number;
}

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventStats(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    const userStr = localStorage.getItem('dawati_user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setEvents(data);
    setIsLoading(false);
  };

  const fetchEventStats = async (id: string) => {
    const { data: guests } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', id);

    if (guests) {
      const stats = {
        total: guests.length,
        accepted: guests.filter(g => g.rsvp_status === 'accepted').length,
        declined: guests.filter(g => g.rsvp_status === 'declined').length,
        pending: guests.filter(g => g.rsvp_status === 'pending').length,
        attended: guests.filter(g => g.attended).length,
        companions: guests.reduce((acc, g) => acc + (g.companions_count || 0), 0)
      };
      setStats(stats);
    }
  };

  const copyScannerLink = (id: string) => {
    const link = `${window.location.origin}/scanner/${id}`;
    navigator.clipboard.writeText(link);
    alert('تم نسخ رابط الحارس بنجاح!');
  };

  const chartData = stats ? [
    { name: 'قبلوا', value: stats.accepted, color: '#10b981' },
    { name: 'اعتذروا', value: stats.declined, color: '#ef4444' },
    { name: 'انتظار', value: stats.pending, color: '#f59e0b' },
  ] : [];

  if (isLoading) return <div className="p-20 text-center font-body">جاري التحميل...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 font-body">
      {!selectedEventId ? (
        <div className="space-y-8 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-extrabold text-primary font-headline">مناسباتي</h2>
            <Link to="/design" className="bg-primary text-white p-3 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/20">
              <Plus className="w-6 h-6" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length === 0 ? (
              <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed text-center space-y-4">
                <Calendar className="w-12 h-12 mx-auto text-on-surface-variant opacity-20" />
                <p className="text-on-surface-variant">لا توجد مناسبات حالياً</p>
                <Link to="/design" className="text-primary font-bold hover:underline">ابدأ بتصميم أول دعوة!</Link>
              </div>
            ) : (
              events.map((event) => (
                <div 
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/10 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      event.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                    )}>
                      {event.status === 'active' ? 'نشطة' : 'منتهية'}
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-[-1rem] transition-all" />
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface mb-2 font-headline">{event.title}</h3>
                  <div className="space-y-3 text-on-surface-variant text-sm">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4" />
                       {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                       <MapPin className="w-4 h-4" />
                       {event.city} - {event.district}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-12 animate-fade-in">
          <button 
            onClick={() => setSelectedEventId(null)}
            className="flex items-center gap-2 text-primary font-bold hover:underline"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            العودة لمناسباتي
          </button>

          {/* Event Dashboard Header */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-primary h-[320px] shadow-xl">
               <img className="absolute inset-0 w-full h-full object-cover opacity-60" src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200" alt="Event" />
               <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent"></div>
               <div className="relative h-full flex flex-col justify-end p-8 space-y-2">
                 <h1 className="text-4xl md:text-5xl font-extrabold text-white font-headline">{events.find(e => e.id === selectedEventId)?.title}</h1>
                 <p className="text-primary-container text-lg opacity-90">{events.find(e => e.id === selectedEventId)?.city} - {events.find(e => e.id === selectedEventId)?.district}</p>
               </div>
            </div>
            <div className="lg:col-span-4 bg-white rounded-3xl p-8 shadow-xl flex flex-col justify-between border border-primary/5">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2 font-headline">
                  <QrCode className="w-6 h-6" />
                  رابط بوابة الأمن
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">استخدم هذا الرابط لتسهيل دخول ضيوفك عند بوابة القاعة. قم بمشاركته مع فريق التنظيم.</p>
                <div 
                  onClick={() => copyScannerLink(selectedEventId!)}
                  className="bg-surface-container-low p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-primary-container transition-colors"
                >
                  <span className="text-primary font-mono text-xs truncate">dawati.com/scanner/{selectedEventId}</span>
                  <Copy className="w-4 h-4 text-primary" />
                </div>
              </div>
              <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold mt-6 shadow-lg shadow-primary/20">
                تعديل تفاصيل الدعوة
              </button>
            </div>
          </section>

          {/* Stats Bento Grid */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border-r-4 border-emerald-500 space-y-2">
               <CheckCircle2 className="w-6 h-6 text-emerald-500" />
               <div className="text-3xl font-extrabold text-on-surface">{stats?.accepted || 0}</div>
               <div className="text-on-surface-variant text-sm font-medium">أكدوا الحضور</div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border-r-4 border-red-500 space-y-2">
               <XCircle className="w-6 h-6 text-red-500" />
               <div className="text-3xl font-extrabold text-on-surface">{stats?.declined || 0}</div>
               <div className="text-on-surface-variant text-sm font-medium">اعتذروا</div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border-r-4 border-amber-500 space-y-2">
               <Clock className="w-6 h-6 text-amber-500" />
               <div className="text-3xl font-extrabold text-on-surface">{stats?.pending || 0}</div>
               <div className="text-on-surface-variant text-sm font-medium">قيد الانتظار</div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border-r-4 border-primary space-y-2">
               <Users className="w-6 h-6 text-primary" />
               <div className="text-3xl font-extrabold text-on-surface">{stats?.attended || 0}</div>
               <div className="text-on-surface-variant text-sm font-medium">حضروا فعلياً</div>
            </div>
          </section>

          {/* Chart and Media */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm h-[400px] flex flex-col border border-outline-variant/10">
              <h3 className="text-xl font-bold text-primary mb-6 font-headline">توزيع الاستجابات</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/10 flex flex-col space-y-6">
              <h3 className="text-xl font-bold text-primary font-headline">صور وذكريات الحفل</h3>
              <p className="text-sm text-on-surface-variant">سيتم عرض الصور ومقاطع الفيديو هنا بعد إضافتها من قبل إدارة المنصة.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-video bg-surface-container-low rounded-2xl flex flex-col items-center justify-center space-y-2 text-on-surface-variant opacity-40 italic">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs italic">قريباً..</span>
                </div>
                <div className="aspect-video bg-surface-container-low rounded-2xl flex flex-col items-center justify-center space-y-2 text-on-surface-variant opacity-40 italic">
                  <Youtube className="w-8 h-8" />
                  <span className="text-xs italic">قريباً..</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
