import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Smartphone, User, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

const loginSchema = z.object({
  fullName: z.string().min(3, 'الاسم يجب أن يكون ٣ أحرف على الأقل'),
  phone: z.string().regex(/^05\d{8}$/, 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من ١٠ أرقام'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'كود التحقق يجب أن يتكون من ٦ أرقام'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export default function Login() {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
    getValues: getLoginValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const onSendOtp = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Send OTP via n8n Webhook
      console.log('Sending OTP to:', data.phone, 'via n8n...');
      
      const response = await fetch(import.meta.env.VITE_N8N_OTP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: data.phone,
          fullName: data.fullName,
          action: 'send_otp'
        }),
      });

      if (!response.ok) throw new Error('فشل إرسال كود التحقق. حاول مرة أخرى.');

      setStep('otp');
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ ما');
      // For demo purposes, we allow moving to OTP step even if webhook fails (mocking)
      console.warn('Webhook failed, but proceeding to OTP step for demo purposes');
      setStep('otp');
      setResendTimer(60);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async (data: OtpFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { fullName, phone } = getLoginValues();
      
      console.log('Verifying OTP:', data.otp, 'for phone:', phone);

      // 1. Verify OTP via n8n (Mocking success here)
      // 2. Check/Create User in Supabase
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      let user = existingUser;

      if (!user) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{ full_name: fullName, phone, role: 'user', otp_verified: true }])
          .select()
          .single();
        
        if (createError) throw createError;
        user = newUser;
      } else {
        await supabase
          .from('users')
          .update({ otp_verified: true })
          .eq('phone', phone);
      }

      // Store local session (Mocking for now as we use Custom Auth)
      localStorage.setItem('dawati_user', JSON.stringify(user));
      
      // Play success sound
      const audio = new Audio('/success.mp3');
      audio.play().catch(() => {});

      navigate(user?.role === 'admin' ? '/admin' : '/design');
    } catch (err: any) {
      setError('كود التحقق غير صحيح أو منتهي الصلاحية');
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

        {step === 'details' ? (
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
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'استلام كود التحقق'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitOtp(onVerifyOtp)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <button 
                  type="button" 
                  onClick={() => setStep('details')}
                  className="p-2 hover:bg-surface-container rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-primary rotate-180" />
                </button>
                <p className="text-sm font-bold text-on-surface-variant font-headline">أدخل كود التحقق المرسل إلى {getLoginValues().phone}</p>
              </div>
              
              <div className="relative">
                <input
                  {...registerOtp('otp')}
                  type="text"
                  maxLength={6}
                  placeholder="------"
                  className={cn(
                    "w-full bg-surface-container-low border-none rounded-2xl py-6 focus:ring-2 focus:ring-primary/20 text-center text-3xl font-bold tracking-[1em] font-body",
                    otpErrors.otp && "ring-2 ring-error"
                  )}
                />
              </div>
              {otpErrors.otp && (
                <p className="text-xs text-error font-bold text-center">{otpErrors.otp.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <button
                disabled={isLoading}
                type="submit"
                className="w-full py-5 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'تحقق ودخول'}
              </button>
              
              <button
                type="button"
                disabled={resendTimer > 0 || isLoading}
                onClick={() => onSendOtp(getLoginValues())}
                className="text-primary font-bold text-sm hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {resendTimer > 0 ? `إعادة الإرسال خلال ${resendTimer} ثانية` : 'إعادة إرسال الكود'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
