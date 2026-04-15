"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
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
    Check,
    Eye,
    AlertCircle,
    Upload,
    Heart,
    Image as ImageIcon
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { triggerN8N } from '@/lib/n8n';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [stats, setStats] = useState({ revenue: 0, customers: 0, events: 0, pendingOrders: 0 });
    const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'invitations' | 'templates' | 'tickets' | 'settings'>('orders');
    const [settings, setSettings] = useState<any>({});

    // Data States
    const [orders, setOrders] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [invitations, setInvitations] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && isAuthenticated) fetchAdminData();
    }, [isAuthenticated, activeTab, isMounted]);

    const fetchAdminData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Stats & Revenue
            const { data: paidOrders } = await supabase.from('orders').select('amount').eq('status', 'paid');
            const revenue = paidOrders?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

            const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
            const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
            const { count: pendingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending_payment');

            setStats({
                revenue,
                customers: usersCount || 0,
                events: eventsCount || 0,
                pendingOrders: pendingCount || 0
            });

            // 2. Tab Specific Data
            if (activeTab === 'orders') {
                const { data } = await supabase.from('orders').select('*, users(full_name, phone), events(title)').order('created_at', { ascending: false });
                setOrders(data || []);
            }
            if (activeTab === 'users') {
                const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
                setUsers(data || []);
            }
            if (activeTab === 'invitations') {
                const { data } = await supabase.from('events').select('*, users(full_name, phone)').order('created_at', { ascending: false });
                setInvitations(data || []);
            }
            if (activeTab === 'templates') {
                const { data } = await supabase.from('templates').select('*').order('created_at', { ascending: false });
                setTemplates(data || []);
            }
            if (activeTab === 'tickets') {
                const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
                setTickets(data || []);
            }
            if (activeTab === 'settings') {
                const { data } = await supabase.from('site_settings').select('*');
                const settingsMap = data?.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
                setSettings(settingsMap || {});
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveOrder = async (order: any) => {
        setIsLoading(true);
        try {
            // Update Order
            const { error: orderError } = await supabase.from('orders').update({ status: 'paid' }).eq('id', order.id);
            if (orderError) throw orderError;

            // Update Event
            const { error: eventError } = await supabase.from('events').update({ payment_status: 'paid' }).eq('id', order.event_id);
            if (eventError) throw eventError;

            alert('تم تفعيل الطلب والمناسبة بنجاح');
            fetchAdminData();
        } catch (err: any) {
            alert('خطأ في التفعيل: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadOrderMedia = async (orderId: string, file: File, field: 'final_media_url' | 'empty_qr_url') => {
        setIsLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `order_${orderId}_${field}_${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('templates-images').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('templates-images').getPublicUrl(fileName);
            const { error: updateError } = await supabase.from('orders').update({ [field]: publicUrl }).eq('id', orderId);
            if (updateError) throw updateError;

            alert('تم رفع الملف بنجاح');
            fetchAdminData();
        } catch (err: any) {
            alert('حدث خطأ أثناء الرفع: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSetting = async (key: string, value: string) => {
        const { error } = await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' });
        if (error) alert('خطأ في حفظ الإعدادات');
        else alert('تم حفظ الإعداد بنجاح');
    };

    const toggleEventStatus = async (eventId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
        await supabase.from('events').update({ status: newStatus }).eq('id', eventId);
        fetchAdminData();
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '4646') setIsAuthenticated(true);
        else alert('كلمة مرور خاطئة');
    };

    if (!isMounted) return null;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-zinc-100 text-center">
                    <div className="w-20 h-20 bg-[#6A0DAD]/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <Lock className="w-10 h-10 text-[#6A0DAD]" />
                    </div>
                    <h2 className="text-3xl font-bold text-primary mb-4 font-headline">لوحة الإدارة</h2>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="كلمة المرور"
                            className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-center text-lg focus:ring-2 focus:ring-[#6A0DAD]/20 transition-all font-body"
                        />
                        <button className="w-full bg-[#6A0DAD] text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all">دخول</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 pb-20">
            <Header />
            <main className="max-w-7xl mx-auto px-6 pt-24 space-y-8">
                {/* Stats Summary */}
                <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col justify-between group hover:shadow-lg transition-all">
                        <span className="text-zinc-400 font-bold text-xs uppercase mb-2">إجمالي الإيرادات المؤكدة</span>
                        <h3 className="text-3xl font-black text-[#6A0DAD] font-headline">{stats.revenue.toLocaleString()} <span className="text-sm font-normal">ر.س</span></h3>
                    </div>
                    <div className="bg-[#6A0DAD] text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
                        <Users className="w-8 h-8 opacity-30" />
                        <div>
                            <h3 className="text-3xl font-black font-headline">{stats.customers}</h3>
                            <p className="opacity-80 text-sm font-bold">عميل مسجل</p>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col justify-between">
                        <span className="text-zinc-400 font-bold text-xs mb-2">دعوات نشطة</span>
                        <h3 className="text-3xl font-black text-primary font-headline">{stats.events}</h3>
                    </div>
                    <div className={cn(
                        "p-8 rounded-3xl shadow-sm border flex flex-col justify-between transition-all",
                        stats.pendingOrders > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-zinc-100"
                    )}>
                        <span className="text-zinc-400 font-bold text-xs mb-2">طلبات بانتظار التفعيل</span>
                        <h3 className="text-3xl font-black text-amber-600 font-headline">{stats.pendingOrders}</h3>
                    </div>
                </section>

                {/* Navigation Tabs */}
                <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-zinc-100 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'orders', label: 'الطلبات', icon: CreditCard },
                        { id: 'users', label: 'العملاء', icon: Users },
                        { id: 'invitations', label: 'إدارة الدعوات', icon: Layout },
                        { id: 'templates', label: 'القوالب', icon: SettingsIcon },
                        { id: 'tickets', label: 'الدعم', icon: Mail },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === tab.id ? "bg-[#6A0DAD] text-white shadow-md" : "text-zinc-500 hover:bg-zinc-50"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 overflow-hidden min-h-[500px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[500px]">
                            <Loader2 className="w-10 h-10 text-[#6A0DAD] animate-spin" />
                        </div>
                    ) : (
                        <div className="p-8">
                            {activeTab === 'orders' && (
                                <div className="space-y-6">
                                    <h4 className="text-xl font-bold flex items-center gap-2"><CreditCard className="w-5 h-5" /> الطلبات الأخيرة</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-right">
                                            <thead>
                                                <tr className="border-b border-zinc-100 text-zinc-400 text-sm">
                                                    <th className="pb-4">العميل / الطلب</th>
                                                    <th className="pb-4">المبلغ</th>
                                                    <th className="pb-4 text-center">الحالة</th>
                                                    <th className="pb-4 text-center">الإجراء</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(o => (
                                                    <tr key={o.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-all">
                                                        <td className="py-4">
                                                            <p className="font-bold">{o.users?.full_name}</p>
                                                            <div className="flex gap-2 text-[10px] mt-1">
                                                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded">{o.guests_package} مدعو</span>
                                                                <span className={cn("px-1.5 py-0.5 rounded", o.media_type === 'video' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>
                                                                    {o.media_type === 'video' ? 'فيديو' : 'صورة'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 font-black">
                                                            {o.amount} ر.س
                                                        </td>
                                                        <td className="py-2 text-[10px] space-y-1">
                                                            {/* Media Uploads */}
                                                            <div className="flex flex-col gap-1 items-center">
                                                                <label className="cursor-pointer bg-zinc-100 hover:bg-zinc-200 p-1 px-2 rounded-lg flex items-center gap-1">
                                                                    <Upload className="w-3 h-3" /> {o.final_media_url ? 'تغيير الوسيط' : 'رفع الوسيط'}
                                                                    <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUploadOrderMedia(o.id, e.target.files[0], 'final_media_url')} />
                                                                </label>
                                                                <label className="cursor-pointer bg-zinc-100 hover:bg-zinc-200 p-1 px-2 rounded-lg flex items-center gap-1">
                                                                    <QrCode className="w-3 h-3" /> {o.empty_qr_url ? 'تغيير QR' : 'رفع QR فاضي'}
                                                                    <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUploadOrderMedia(o.id, e.target.files[0], 'empty_qr_url')} />
                                                                </label>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-center">
                                                            {o.status === 'paid' ? (
                                                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold">تم الدفع</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleApproveOrder(o)}
                                                                    className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700"
                                                                >
                                                                    تفعيل
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <div className="space-y-6">
                                    <h4 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5" /> قائمة المسجلين</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {users.map(u => (
                                            <div key={u.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#6A0DAD] shadow-sm">
                                                    <Users className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{u.full_name || 'بدون اسم'}</p>
                                                    <p className="text-xs text-zinc-400 font-mono">{u.phone}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'invitations' && (
                                <div className="space-y-6">
                                    <h4 className="text-xl font-bold flex items-center gap-2"><Layout className="w-5 h-5" /> كافة المناسبات</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {invitations.map(inv => (
                                            <div key={inv.id} className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-16 h-20 rounded-xl bg-zinc-200 overflow-hidden shadow-inner">
                                                        <img src={inv.preview_image_url || '/placeholder.png'} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-primary">{inv.title}</h5>
                                                        <p className="text-xs text-zinc-500">العميل: {inv.users?.full_name} ({inv.users?.phone})</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", inv.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                                                                {inv.status === 'active' ? 'نشطة' : 'متوقفة'}
                                                            </span>
                                                            {inv.features?.reminders && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">تذكير</span>}
                                                            {inv.features?.thank_you && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-700">شكر</span>}
                                                            {inv.features?.apple_wallet && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">Wallet</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => toggleEventStatus(inv.id, inv.status)} className="flex-1 md:flex-none px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-100 transition-all">
                                                            {inv.status === 'active' ? 'إيقاف' : 'تفعيل'}
                                                        </button>
                                                        <button className="flex-1 md:flex-none px-4 py-2 bg-zinc-50 text-primary border border-primary/20 rounded-xl text-xs font-bold flex items-center gap-2">
                                                            <Eye className="w-3 h-3" /> معاينة
                                                        </button>
                                                    </div>

                                                    {/* Admin Production Buttons */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            disabled={inv.payment_status !== 'paid'}
                                                            onClick={() => alert('جاري إرسال الدعوات عبر n8n...')}
                                                            className={cn(
                                                                "flex-1 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 justify-center",
                                                                inv.payment_status === 'paid' ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-400 opacity-50 cursor-not-allowed"
                                                            )}
                                                        >
                                                            <Send className="w-3 h-3" /> إرسال الدعوات
                                                        </button>
                                                        {inv.features?.thank_you && (
                                                            <button
                                                                disabled={inv.payment_status !== 'paid'}
                                                                onClick={() => alert('جاري إرسال رسائل الشكر...')}
                                                                className={cn(
                                                                    "flex-1 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 justify-center",
                                                                    inv.payment_status === 'paid' ? "bg-pink-600 text-white" : "bg-zinc-100 text-zinc-400 opacity-50 cursor-not-allowed"
                                                                )}
                                                            >
                                                                <Heart className="w-3 h-3" /> رسائل الشكر
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Custom Template Upload Section */}
                                                    {inv.card_template_id === 'custom' && (
                                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
                                                            <p className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3" /> قالب خاص لباقة مخصصة
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="رابط الصورة المخصصة"
                                                                    defaultValue={inv.custom_template_url}
                                                                    onBlur={async (e) => {
                                                                        await supabase.from('events').update({ custom_template_url: e.target.value }).eq('id', inv.id);
                                                                    }}
                                                                    className="flex-1 text-[9px] bg-white border-zinc-200 rounded p-1"
                                                                />
                                                                <button className="p-1 px-2 bg-amber-600 text-white rounded text-[9px] font-bold">حفظ</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'templates' && (
                                <div className="space-y-6">
                                    <h4 className="text-xl font-bold flex items-center gap-2"><ImageIcon className="w-5 h-5" /> إدارة القوالب</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {templates.map(t => (
                                            <div key={t.id} className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 space-y-4">
                                                <img src={t.preview_image_url} className="w-full h-48 object-cover rounded-xl" />
                                                <div className="flex justify-between items-center">
                                                    <p className="font-bold text-sm">{t.name}</p>
                                                    <button className="text-[10px] text-[#6A0DAD] font-bold hover:underline">تعديل الإعدادات</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-8 max-w-2xl">
                                    <h4 className="text-xl font-bold flex items-center gap-2"><SettingsIcon className="w-5 h-5" /> إعدادات المنصة</h4>
                                    
                                    <div className="space-y-4 bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-zinc-600">القالب التجريبي (Demo Template ID)</label>
                                            <div className="flex gap-2">
                                                <select 
                                                    value={settings.demo_template_id || ''} 
                                                    onChange={(e) => updateSetting('demo_template_id', e.target.value)}
                                                    className="flex-1 bg-white border-zinc-200 rounded-xl p-3 text-sm"
                                                >
                                                    <option value="">اختر قالب...</option>
                                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                                <button onClick={() => alert('تم الحفظ تلقائياً')} className="bg-[#6A0DAD] text-white px-4 py-2 rounded-xl text-xs font-bold">حفظ</button>
                                            </div>
                                            <p className="text-[10px] text-zinc-400 italic">هذا القالب هو ما يظهر للزوار عند الضغط على "جرب العرض" في الصفحة الرئيسية.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
