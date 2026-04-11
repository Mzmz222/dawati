import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { triggerN8N } from '../lib/n8n';
import { 
  BarChart3, 
  Users, 
  Settings as SettingsIcon, 
  TrendingUp, 
  Layout, 
  Mail,
  Lock,
  Type,
  QrCode,
  CreditCard,
  MessageCircle,
  Loader2,
  Send
} from 'lucide-react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({ revenue: 0, customers: 0, events: 0, tickets: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'templates' | 'tickets' | 'orders' | 'settings'>('overview');
  const [tickets, setTickets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [waNumber, setWaNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Template Form State
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'invitation', // 'invitation' | 'barcode'
    preview_url: 'https://images.unsplash.com/photo-1621342621453-9d0d343c1fcb?q=80&w=600',
    fields_config: {},
    qr_config: { x: 50, y: 50, size: 100, color: '#000000' }
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated, activeTab]);

  const fetchAdminData = async () => {
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
    const { count: ticketsCount } = await supabase.from('support_tickets').select('*', { count: 'exact', head: true });
    
    setStats({
      revenue: (eventsCount || 0) * 350,
      customers: usersCount || 0,
      events: eventsCount || 0,
      tickets: ticketsCount || 0
    });

    if (activeTab === 'tickets') {
      const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
      if (data) setTickets(data);
    }

    if (activeTab === 'orders') {
      const { data } = await supabase
        .from('orders')
        .select('*, users(full_name, phone), events(title)')
        .order('created_at', { ascending: false });
      if (data) setOrders(data);
    }

    if (activeTab === 'settings') {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'whatsapp_number').single();
      if (data) setWaNumber(data.value);
    }
  };

  const handleUpdateWa = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'whatsapp_number', value: waNumber });
    setIsLoading(false);
    if (error) alert('فشل تحديث الرقم');
    else alert('تم تحديث رقم واتساب بنجاح');
  };

  const handleApproveOrder = async (orderId: string) => {
    setIsLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId);
    
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'paid' } : o));
    }
    setIsLoading(false);
  };

  const handleSendOfficialInvites = async (order: any) => {
    setIsLoading(true);
    try {
      // 1. Fetch all guests for this event
      const { data: guests, error: guestError } = await supabase
        .from('guests')
        .select('*')
        .eq('event_id', order.event_id);
      
      if (guestError) throw guestError;

      // 2. Trigger n8n
      const result = await triggerN8N({
        action: 'send_bulk_invites',
        is_preview: false,
        order_id: order.id,
        event_id: order.event_id,
        guests: guests
      });

      if (result.success) {
        alert('تم إرسال الإشارة لـ n8n بنجاح لإطلاق الدعوات الرسمية!');
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '4646') { // Simple password for now
      setIsAuthenticated(true);
    } else {
      alert('كلمة مرور خاطئة');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-outline-variant/10 text-center animate-scale-in">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-primary mb-4 font-headline">لوحة الإدارة</h2>
          <p className="text-on-surface-variant mb-8 font-body">الرجاء إدخال كلمة المرور للمتابعة</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              className="w-full bg-surface-container-low border-none rounded-2xl p-4 text-center text-lg focus:ring-2 focus:ring-primary/20 transition-all font-body"
            />
            <button className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all active:scale-95">
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 font-body pb-32">
      {/* Admin Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold text-primary font-headline tracking-tight">إدارة المنصة</h2>
          <p className="text-on-surface-variant text-lg">مرحباً بك، استعرض أداء "دعواتي" وقم بإدارة العمليات.</p>
        </div>
      </section>

      {/* Global Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/10 flex flex-col justify-between group hover:shadow-xl transition-shadow">
          <div>
            <span className="text-tertiary font-bold text-[10px] tracking-[0.2em] uppercase mb-2 block">إجمالي الإيرادات</span>
            <h3 className="text-3xl font-black text-primary font-headline">{stats.revenue.toLocaleString()} <span className="text-sm font-normal text-on-surface-variant">ر.س</span></h3>
          </div>
          <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+١٢٪ هذا الشهر</span>
          </div>
        </div>
        <div className="bg-primary text-on-primary p-8 rounded-3xl shadow-xl flex flex-col justify-between">
          <Users className="w-10 h-10 opacity-30" />
          <div>
            <h3 className="text-3xl font-black font-headline">{stats.customers}</h3>
            <p className="opacity-90 font-bold text-sm">عميل مسجل</p>
          </div>
        </div>
        <div className="bg-secondary-container text-on-secondary-container p-8 rounded-3xl shadow-sm flex flex-col justify-between">
          <Layout className="w-10 h-10 opacity-30" />
          <div>
            <h3 className="text-3xl font-black font-headline">{stats.events}</h3>
            <p className="opacity-80 font-bold text-sm">مناسبة نشطة</p>
          </div>
        </div>
        <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 flex flex-col justify-between">
          <Mail className="w-10 h-10 text-on-surface-variant opacity-30" />
          <div>
            <h3 className="text-3xl font-black text-on-surface font-headline">{stats.tickets}</h3>
            <p className="text-on-surface-variant font-bold text-sm">تذكرة دعم مفتوحة</p>
          </div>
        </div>
      </section>

      {/* Admin Tabs */}
      <div className="flex bg-surface-container-low rounded-2xl p-1 w-full md:w-fit overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
          { id: 'orders', label: 'الطلبات', icon: CreditCard },
          { id: 'users', label: 'العملاء', icon: Users },
          { id: 'templates', label: 'القوالب', icon: SettingsIcon },
          { id: 'tickets', label: 'الدعم الفني', icon: Mail },
          { id: 'settings', label: 'الإعدادات', icon: MessageCircle }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:bg-white/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        {activeTab === 'templates' ? (
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-primary font-headline">إضافة قالب جديد</h3>
                  <p className="text-on-surface-variant text-sm">ارفع صورة القالب وحدد الإحداثيات المناسبة</p>
                </div>
                <button className="bg-primary text-on-primary px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">حفظ القالب</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Preview & Config */}
                <div className="space-y-6">
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-surface-container-low border-2 border-dashed border-outline-variant/30 relative group">
                    <img 
                      src={newTemplate.preview_url} 
                      alt="Template Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button className="bg-white text-primary px-6 py-3 rounded-xl font-bold shadow-xl">تغيير الصورة</button>
                    </div>
                    {/* Simulated QR Tooltip if Barcode Type */}
                    {newTemplate.type === 'barcode' && (
                      <div 
                        className="absolute bg-primary/20 border-2 border-primary border-dashed rounded-lg flex items-center justify-center shadow-2xl"
                        style={{
                          left: `${newTemplate.qr_config.x}%`,
                          top: `${newTemplate.qr_config.y}%`,
                          width: `${newTemplate.qr_config.size}px`,
                          height: `${newTemplate.qr_config.size}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <QrCode className="text-primary w-1/2 h-1/2 opacity-50" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-on-surface px-1">نوع القالب</label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setNewTemplate({...newTemplate, type: 'invitation'})}
                        className={cn(
                          "flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                          newTemplate.type === 'invitation' ? "border-primary bg-primary/5 text-primary" : "border-outline-variant/20 text-on-surface-variant"
                        )}
                      >
                        <Type className="w-6 h-6" />
                        <span className="font-bold text-sm">كرت دعوة</span>
                      </button>
                      <button 
                         onClick={() => setNewTemplate({...newTemplate, type: 'barcode'})}
                         className={cn(
                          "flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                          newTemplate.type === 'barcode' ? "border-primary bg-primary/5 text-primary" : "border-outline-variant/20 text-on-surface-variant"
                        )}
                      >
                        <QrCode className="w-6 h-6" />
                        <span className="font-bold text-sm">كرت باركود</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-on-surface-variant px-1">اسم القالب</label>
                       <input type="text" placeholder="مثلاً: الملكي الذهبي" className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-on-surface-variant px-1">الفئة</label>
                       <select className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20">
                          <option>زفاف</option>
                          <option>تخرج</option>
                          <option>عيد ميلاد</option>
                       </select>
                    </div>
                  </div>

                  {newTemplate.type === 'barcode' ? (
                    <div className="p-6 bg-surface-container rounded-3xl space-y-6">
                      <h4 className="font-bold text-primary flex items-center gap-2">
                        <SettingsIcon className="w-4 h-4" />
                        إعدادات الباركود
                      </h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-on-surface-variant">الموقع الأفقي (X%)</label>
                          <input 
                            type="range" 
                            min="0" max="100" 
                            value={newTemplate.qr_config.x}
                            onChange={(e) => setNewTemplate({...newTemplate, qr_config: {...newTemplate.qr_config, x: Number(e.target.value)}})}
                            className="w-full accent-primary" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-on-surface-variant">الموقع الرأسي (Y%)</label>
                          <input 
                            type="range" 
                            min="0" max="100" 
                            value={newTemplate.qr_config.y}
                            onChange={(e) => setNewTemplate({...newTemplate, qr_config: {...newTemplate.qr_config, y: Number(e.target.value)}})}
                            className="w-full accent-primary" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-on-surface-variant">حجم الباركود (px)</label>
                          <input 
                            type="number" 
                            value={newTemplate.qr_config.size}
                            onChange={(e) => setNewTemplate({...newTemplate, qr_config: {...newTemplate.qr_config, size: Number(e.target.value)}})}
                            className="w-full bg-white border-none rounded-xl p-3" 
                          />
                        </div>
                         <div className="space-y-2">
                          <label className="text-xs font-bold text-on-surface-variant">اللون</label>
                          <input 
                            type="color" 
                            value={newTemplate.qr_config.color}
                            onChange={(e) => setNewTemplate({...newTemplate, qr_config: {...newTemplate.qr_config, color: e.target.value}})}
                            className="w-full h-10 bg-white border-none rounded-xl p-1" 
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-surface-container rounded-3xl space-y-4">
                      <h4 className="font-bold text-primary flex items-center gap-2">
                        <SettingsIcon className="w-4 h-4" />
                        إعدادات النصوص
                      </h4>
                      <p className="text-xs text-on-surface-variant">اضغط على المعاينة لتحديد موقع النصوص (قيد التطوير)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'tickets' ? (
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
             <table className="w-full text-right font-body">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-xs font-bold uppercase tracking-widest">
                    <th className="px-8 py-5">العميل</th>
                    <th className="px-8 py-5">الرسالة</th>
                    <th className="px-8 py-5 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-bold">{t.name}</div>
                        <div className="text-xs text-on-surface-variant">{t.phone}</div>
                      </td>
                      <td className="px-8 py-5 text-sm text-on-surface-variant max-w-md truncate">{t.message}</td>
                      <td className="px-8 py-5 text-center">
                        <button className="text-primary font-bold text-sm hover:underline">رد عبر واتساب</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        ) : activeTab === 'orders' ? (
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
             <table className="w-full text-right font-body">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-xs font-bold uppercase tracking-widest">
                    <th className="px-8 py-5">العميل / المناسبة</th>
                    <th className="px-8 py-5">المبلغ</th>
                    <th className="px-8 py-5 text-center">الحالة</th>
                    <th className="px-8 py-5 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-bold">{o.users?.full_name}</div>
                        <div className="text-xs text-primary">{o.events?.title}</div>
                        <div className="text-[10px] text-on-surface-variant font-mono">#{o.id}</div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="font-bold text-lg">{o.amount} ر.س</div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-bold",
                          o.status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {o.status === 'paid' ? 'مدفوع' : 'بانتظار التحويل'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {o.status === 'paid' ? (
                            <button 
                              disabled={isLoading}
                              onClick={() => handleSendOfficialInvites(o)}
                              className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:shadow-lg transition-all"
                            >
                              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              إرسال الدعوات الرسمية
                            </button>
                          ) : (
                            <button 
                              disabled={isLoading}
                              onClick={() => handleApproveOrder(o.id)}
                              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:shadow-lg transition-all"
                            >
                              تأكيد الدفع يدوياً
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        ) : activeTab === 'settings' ? (
          <div className="lg:col-span-3 bg-white p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
             <div className="max-w-md space-y-8">
               <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-primary font-headline">إعدادات عامة</h3>
                  <p className="text-on-surface-variant text-sm">إدارة المتغيرات العالمية للموقع.</p>
               </div>
               
               <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface px-1">رقم واتساب الاستقبال (بما في ذلك مفتاح الدولة)</label>
                    <input 
                      type="text" 
                      value={waNumber}
                      onChange={(e) => setWaNumber(e.target.value)}
                      placeholder="9665xxxxxxxx" 
                      className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20" 
                    />
                 </div>
                 <button 
                   onClick={handleUpdateWa}
                   disabled={isLoading}
                   className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-3"
                 >
                   {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'حفظ التغييرات'}
                 </button>
               </div>
             </div>
          </div>
        ) : (
          <div className="lg:col-span-3 bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/10 text-center py-20">
             <BarChart3 className="w-16 h-16 mx-auto mb-6 text-on-surface-variant opacity-20" />
             <p className="text-on-surface-variant font-body mb-4">اختر أحد التبويبات لعرض البيانات التفصيلية.</p>
          </div>
        )}
      </div>
    </div>
  );
}
