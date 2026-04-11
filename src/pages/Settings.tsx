import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  LogOut,
  MessageSquare,
  Send,
  Shield,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const supportSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  phone: z.string().regex(/^05\d{8}$/, 'رقم غير صحيح'),
  message: z.string().min(10, 'الرسالة يجب أن تكون ١٠ أحرف على الأقل'),
});

type SupportFormData = z.infer<typeof supportSchema>;

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema)
  });

  useEffect(() => {
    const userStr = localStorage.getItem('dawati_user');
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  const onLogout = () => {
    localStorage.removeItem('dawati_user');
    navigate('/login');
  };

  const onSubmitTicket = async (data: SupportFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: user?.id,
          name: data.name,
          phone: data.phone,
          message: data.message
        }]);

      if (error) throw error;

      // Notify n8n
      await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'support_ticket', data }),
      });

      alert('تم إرسال طلبك بنجاح، سيتواصل معك فريق الدعم قريباً.');
      reset();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <div className="p-20 text-center font-body">يرجى تسجيل الدخول لعرض الإعدادات</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12 font-body">
      <h2 className="text-4xl font-extrabold text-primary font-headline">الإعدادات</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/10 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center text-primary text-3xl font-bold">
              {user.full_name?.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface">{user.full_name}</h3>
              <p className="text-on-surface-variant text-sm dir-ltr font-mono">{user.phone}</p>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-3 text-error font-bold hover:bg-error/5 rounded-2xl transition-colors border border-error/10"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>

          <div className="bg-surface-container-low p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Shield className="w-5 h-5" />
              <h4 className="font-bold">الأمان والخصوصية</h4>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              جميع بياناتك مشفرة ومحمية وفق أعلى معايير الأمان. نحن لا نشارك بياناتك مع أي طرف ثالث.
            </p>
          </div>
        </div>

        {/* Support Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-outline-variant/10 space-y-8">
            <div className="flex items-center gap-3 text-primary">
              <MessageSquare className="w-6 h-6" />
              <h3 className="text-2xl font-bold font-headline">الدعم الفني والخدمات</h3>
            </div>

            <p className="text-on-surface-variant">هل واجهت مشكلة أو لديك استفسار؟ فريقنا متاح لخدمتكم 24/7.</p>

            <form onSubmit={handleSubmit(onSubmitTicket)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant px-1">الاسم</label>
                  <input
                    {...register('name')}
                    defaultValue={user.full_name}
                    placeholder="الاسم"
                    className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.name && <p className="text-xs text-error font-bold">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant px-1">رقم الجوال</label>
                  <input
                    {...register('phone')}
                    defaultValue={user.phone}
                    placeholder="05xxxxxxxx"
                    className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 text-left dir-ltr"
                  />
                  {errors.phone && <p className="text-xs text-error font-bold">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant px-1">نص الرسالة</label>
                <textarea
                  {...register('message')}
                  rows={5}
                  placeholder="كيف يمكننا مساعدتك؟"
                  className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20"
                ></textarea>
                {errors.message && <p className="text-xs text-error font-bold">{errors.message.message}</p>}
              </div>

              <button
                disabled={isLoading}
                type="submit"
                className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    إرسال الطلب
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
