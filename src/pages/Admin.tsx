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
  Send,
  Plus
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
    type: 'invitation', 
    preview_url: '',
    fields_config: {
      fields: [
        { id: 'groomName', label: 'اسم العريس', x: 50, y: 20, fontSize: 32, fontFamily: 'Noto Serif Arabic', color: '#1a1a1a' },
        { id: 'brideName', label: 'اسم العروس', x: 50, y: 30, fontSize: 32, fontFamily: 'Noto Serif Arabic', color: '#1a1a1a' },
        { id: 'hallName', label: 'اسم القاعة', x: 50, y: 45, fontSize: 20, fontFamily: 'Almarai', color: '#4a4a4a' },
        { id: 'date', label: 'التاريخ', x: 30, y: 60, fontSize: 16, fontFamily: 'Almarai', color: '#4a4a4a' },
        { id: 'time', label: 'الوقت', x: 70, y: 60, fontSize: 16, fontFamily: 'Almarai', color: '#4a4a4a' },
        { id: 'city', label: 'المدينة', x: 50, y: 70, fontSize: 16, fontFamily: 'Almarai', color: '#4a4a4a' },
      ]
    },
    qr_config: { x: 50, y: 80, size: 80, color: '#000000' }
  });

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

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

  const handleFieldMove = (id: string, x: number, y: number) => {
    setNewTemplate(prev => ({
      ...prev,
      fields_config: {
        ...prev.fields_config,
        fields: prev.fields_config.fields.map(f => f.id === id ? { ...f, x, y } : f)
      }
    }));
  };

  const handleFieldUpdate = (id: string, updates: any) => {
    setNewTemplate(prev => ({
      ...prev,
      fields_config: {
        ...prev.fields_config,
        fields: prev.fields_config.fields.map(f => f.id === id ? { ...f, ...updates } : f)
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewTemplate(prev => ({ ...prev, preview_url: url }));
    }
  };

  const saveTemplate = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from('card_templates')
      .insert([{
        name: newTemplate.name,
        type: newTemplate.type,
        preview_url: newTemplate.preview_url,
        fields_config: newTemplate.fields_config,
        qr_config: newTemplate.qr_config
      }]);
    
    setIsLoading(false);
    if (error) alert('فشل حفظ القالب: ' + error.message);
    else alert('تم حفظ القالب بنجاح');
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
      const { data: guests, error: guestError } = await supabase
        .from('guests')
        .select('*')
        .eq('event_id', order.event_id);
      
      if (guestError) throw guestError;

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
    if (password === '4646') {
      setIsAuthenticated(true);
    } else {
      alert('كلمة مرور خاطئة');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center px-6 text-right">
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
              className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-center text-lg focus:ring-2 focus:ring-primary/20 transition-all font-body"
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
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 font-body pb-32 text-right">
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
        <div className="bg-zinc-50 p-8 rounded-3xl border border-outline-variant/10 flex flex-col justify-between">
          <Mail className="w-10 h-10 text-on-surface-variant opacity-30" />
          <div>
            <h3 className="text-3xl font-black text-on-surface font-headline">{stats.tickets}</h3>
            <p className="text-on-surface-variant font-bold text-sm">تذكرة دعم مفتوحة</p>
          </div>
        </div>
      </section>

      {/* Admin Tabs */}
      <div className="flex bg-zinc-100 rounded-2xl p-1 w-full md:w-fit overflow-x-auto no-scrollbar">
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
              activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-zinc-500 hover:bg-white/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 pb-12">
        {activeTab === 'templates' ? (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-primary font-headline">محرر القوالب البصري</h3>
                  <p className="text-on-surface-variant text-sm">ارفع صورة القالب واسحب الحقول لتحديد مواضعها</p>
                </div>
                <button 
                  onClick={saveTemplate}
                  disabled={isLoading}
                  className="bg-primary text-on-primary px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  حفظ القالب
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                <div className="xl:col-span-7 space-y-6">
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-100 border-2 border-dashed border-zinc-200 group">
                    {newTemplate.preview_url ? (
                      <>
                        <img 
                          id="template-bg"
                          src={newTemplate.preview_url} 
                          alt="Template" 
                          className="w-full h-full object-contain select-none"
                        />
                        <div className="absolute inset-0">
                          {newTemplate.fields_config.fields.map((field) => (
                            <div
                              key={field.id}
                              onClick={() => setSelectedFieldId(field.id)}
                              onMouseDown={(e) => {
                                const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                                const onMouseMove = (moveEvent: MouseEvent) => {
                                  const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                                  const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;
                                  handleFieldMove(field.id, Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
                                };
                                const onMouseUp = () => {
                                  window.removeEventListener('mousemove', onMouseMove);
                                  window.removeEventListener('mouseup', onMouseUp);
                                };
                                window.addEventListener('mousemove', onMouseMove);
                                window.addEventListener('mouseup', onMouseUp);
                              }}
                              className={cn(
                                "absolute cursor-move select-none whitespace-nowrap p-1 rounded border hover:border-primary transition-colors",
                                selectedFieldId === field.id ? "border-primary bg-primary/10 ring-2 ring-primary/20 z-40" : "border-transparent"
                              )}
                              style={{
                                left: `${field.x}%`,
                                top: `${field.y}%`,
                                transform: 'translate(-50%, -50%)',
                                fontSize: `${field.fontSize}px`,
                                fontFamily: field.fontFamily,
                                color: field.color,
                              }}
                            >
                              {field.label}
                            </div>
                          ))}

                          <div
                            onClick={() => setSelectedFieldId('qr')}
                            onMouseDown={(e) => {
                                const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                                const onMouseMove = (moveEvent: MouseEvent) => {
                                  const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                                  const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;
                                  setNewTemplate(prev => ({ ...prev, qr_config: { ...prev.qr_config, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } }));
                                };
                                const onMouseUp = () => {
                                  window.removeEventListener('mousemove', onMouseMove);
                                  window.removeEventListener('mouseup', onMouseUp);
                                };
                                window.addEventListener('mousemove', onMouseMove);
                                window.addEventListener('mouseup', onMouseUp);
                              }}
                            className={cn(
                              "absolute cursor-move bg-white/80 border-2 border-dashed flex items-center justify-center transition-all",
                              selectedFieldId === 'qr' ? "border-primary ring-4 ring-primary/10 z-40" : "border-zinc-300"
                            )}
                            style={{
                              left: `${newTemplate.qr_config.x}%`,
                              top: `${newTemplate.qr_config.y}%`,
                              width: `${newTemplate.qr_config.size}px`,
                              height: `${newTemplate.qr_config.size}px`,
                              transform: 'translate(-50%, -50%)',
                            }}
                          >
                            <QrCode className="w-1/2 h-1/2 opacity-30" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                        <Plus className="w-12 h-12 text-zinc-300" />
                        <label className="bg-primary text-white px-6 py-2 rounded-xl font-bold cursor-pointer hover:scale-105 transition-transform">
                          رفع صورة القالب
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="xl:col-span-5 space-y-6">
                  <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100 space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-700">اسم القالب</label>
                      <input 
                        type="text" 
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                        placeholder="مثلاً: كلاسيك قولد"
                        className="w-full bg-white border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20" 
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-bold text-zinc-700">تعديل الحقل المختار</label>
                      {selectedFieldId ? (
                        selectedFieldId === 'qr' ? (
                          <div className="space-y-4 animate-fade-in">
                            <div className="p-3 bg-white rounded-xl shadow-sm border border-zinc-200 flex items-center gap-3">
                               <QrCode className="w-5 h-5 text-primary" />
                               <span className="font-bold text-sm">رمز QR</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs text-zinc-500">الحجم (px)</label>
                                <input 
                                  type="number" 
                                  value={newTemplate.qr_config.size}
                                  onChange={(e) => setNewTemplate({...newTemplate, qr_config: { ...newTemplate.qr_config, size: Number(e.target.value) }})}
                                  className="w-full bg-white border rounded-lg p-2 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs text-zinc-500">اللون</label>
                                <input 
                                  type="color" 
                                  value={newTemplate.qr_config.color}
                                  onChange={(e) => setNewTemplate({...newTemplate, qr_config: { ...newTemplate.qr_config, color: e.target.value }})}
                                  className="w-full h-9 bg-white border rounded-lg p-1"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 animate-fade-in">
                             <div className="p-3 bg-white rounded-xl shadow-sm border border-zinc-200 flex items-center gap-3">
                               <Type className="w-5 h-5 text-primary" />
                               <span className="font-bold text-sm">{newTemplate.fields_config.fields.find(f => f.id === selectedFieldId)?.label}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs text-zinc-500">حجم الخط</label>
                                <input 
                                  type="number" 
                                  value={newTemplate.fields_config.fields.find(f => f.id === selectedFieldId)?.fontSize}
                                  onChange={(e) => handleFieldUpdate(selectedFieldId, { fontSize: Number(e.target.value) })}
                                  className="w-full bg-white border rounded-lg p-2 text-sm"
                                />
                              </div>
                               <div className="space-y-1">
                                <label className="text-xs text-zinc-500">لون النص</label>
                                <input 
                                  type="color" 
                                  value={newTemplate.fields_config.fields.find(f => f.id === selectedFieldId)?.color}
                                  onChange={(e) => handleFieldUpdate(selectedFieldId, { color: e.target.value })}
                                  className="w-full h-9 bg-white border rounded-lg p-1"
                                />
                              </div>
                              <div className="col-span-2 space-y-1">
                                <label className="text-xs text-zinc-500">نوع الخط</label>
                                <select 
                                  value={newTemplate.fields_config.fields.find(f => f.id === selectedFieldId)?.fontFamily}
                                  onChange={(e) => handleFieldUpdate(selectedFieldId, { fontFamily: e.target.value })}
                                  className="w-full bg-white border rounded-lg p-2 text-sm"
                                >
                                  <option value="Almarai">Almarai (Modern)</option>
                                  <option value="Noto Serif Arabic">Noto Serif (Classic)</option>
                                  <option value="Cairo">Cairo (Bold)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="p-8 text-center bg-white rounded-xl border-2 border-dashed border-zinc-200">
                          <Type className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                          <p className="text-xs text-zinc-400">اضغط على حقل في المحرر لتعديله</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'tickets' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
             <table className="w-full text-right font-body">
                <thead>
                  <tr className="bg-zinc-50 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                    <th className="px-8 py-5">العميل</th>
                    <th className="px-8 py-5">الرسالة</th>
                    <th className="px-8 py-5 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-bold">{t.name}</div>
                        <div className="text-xs text-zinc-400">{t.phone}</div>
                      </td>
                      <td className="px-8 py-5 text-sm text-zinc-600 max-w-md truncate">{t.message}</td>
                      <td className="px-8 py-5 text-center">
                        <button className="text-primary font-bold text-sm hover:underline">رد عبر واتساب</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        ) : activeTab === 'orders' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
             <table className="w-full text-right font-body">
                <thead>
                  <tr className="bg-zinc-50 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                    <th className="px-8 py-5">العميل / المناسبة</th>
                    <th className="px-8 py-5">المبلغ</th>
                    <th className="px-8 py-5 text-center">الحالة</th>
                    <th className="px-8 py-5 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-bold">{o.users?.full_name}</div>
                        <div className="text-xs text-primary">{o.events?.title}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">#{o.id}</div>
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
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
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
                      className="w-full bg-zinc-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20" 
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
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/10 text-center py-20">
             <BarChart3 className="w-16 h-16 mx-auto mb-6 text-zinc-300 opacity-20" />
             <p className="text-zinc-400 font-body mb-4">اختر أحد التبويبات لعرض البيانات التفصيلية.</p>
          </div>
        )}
      </div>
    </div>
  );
}
