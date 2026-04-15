import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Smartphone, User, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

const loginSchema = z.object({
  fullName: z.string().min(3, 'الاسم يجب أن يكون ٣ أحرف على الأقل'),
  phone: z.string().regex(/^05\d{8}$/, 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من ١٠ أرقام'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });


  const onSendOtp = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Direct login bypass for now
      console.log('Bypassing OTP for phone:', data.phone);

      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', data.phone)
        .single();

      let user = existingUser;

      if (!user) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{ full_name: data.fullName, phone: data.phone, role: 'user', otp_verified: true }])
          .select()
          .single();
        
        if (createError) throw createError;
        user = newUser;
      }

      localStorage.setItem('dawati_user', JSON.stringify(user));
      const audio = new Audio('/success.mp3');
      audio.play().catch(() => {});
      navigate(user?.role === 'admin' ? '/admin' : '/design');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ ما');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface paper-noise">
      <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-xl border border-outline-variant/10">
        <div className="text-center mb-10">
          <img 
            src="/logo/dawati-logo.png" 
            alt="دعواتي" 
            className="h-16 w-auto object-contain mx-auto mb-6" 
          />
          <h1 className="text-3xl font-bold text-primary font-headline mb-2">مرحباً بك في دعواتي</h1>
          <p className="text-on-surface-variant font-body">بساطة التصميم وهيبة الحضور</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-error rounded-xl text-center text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitLogin(onSendOtp)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface-variant px-1 font-headline">الاسم الكامل</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                {...registerLogin('fullName')}
                type="text"
                placeholder="محمد العتيبي"
                className={cn(
                  "w-full bg-surface-container-low border-none rounded-2xl pr-12 pl-4 py-4 focus:ring-2 focus:ring-primary/20 font-body",
                  loginErrors.fullName && "ring-2 ring-error"
                )}
              />
            </div>
            {loginErrors.fullName && (
              <p className="text-xs text-error font-bold px-1">{loginErrors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface-variant px-1 font-headline">رقم الجوال</label>
            <div className="relative">
              <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                {...registerLogin('phone')}
                type="tel"
                placeholder="05xxxxxxxx"
                className={cn(
                  "w-full bg-surface-container-low border-none rounded-2xl pr-12 pl-4 py-4 focus:ring-2 focus:ring-primary/20 font-body text-left dir-ltr",
                  loginErrors.phone && "ring-2 ring-error"
                )}
              />
            </div>
            {loginErrors.phone && (
              <p className="text-xs text-error font-bold px-1">{loginErrors.phone.message}</p>
            )}
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="w-full py-5 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'دخول مباشر'}
          </button>
        </form>
      </div>
    </div>
  );
}
