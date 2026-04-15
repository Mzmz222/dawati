import { MessageCircle, Mail, LifeBuoy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Support() {
  const [waNumber, setWaNumber] = useState('');

  useEffect(() => {
    const fetchWa = async () => {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'whatsapp_number').single();
      if (data) setWaNumber(data.value);
    };
    fetchWa();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 font-body text-center">
      <div className="space-y-4 mb-16">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <LifeBuoy className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-black text-primary font-headline">الدعم الفني</h1>
        <p className="text-on-surface-variant text-lg">نحن هنا لمساعدتك في أي وقت على مدار الساعة.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <a 
          href={`https://wa.me/${waNumber}`}
          className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10 space-y-4 hover:shadow-xl transition-all group"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
            <MessageCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface font-headline">تواصل عبر واتساب</h2>
          <p className="text-on-surface-variant text-sm">أسرع وسيلة للحصول على دعم فني مباشر واستفسارات عامة.</p>
        </a>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10 space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface font-headline">البريد الإلكتروني</h2>
          <p className="text-on-surface-variant text-sm">للاقتراحات التجارية والتعاون الرسمي.</p>
          <p className="font-bold text-primary">support@dawati.sa</p>
        </div>
      </div>

      <div className="mt-20 p-8 bg-surface-container-low rounded-3xl border border-outline-variant/10 flex flex-col items-center gap-4">
         <div className="flex -space-x-4">
            {[1,2,3,4].map(i => (
              <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-12 h-12 rounded-full border-4 border-surface-container-low" alt="Support agent" />
            ))}
         </div>
         <p className="text-sm font-bold text-on-surface-variant">فريقنا جاهز للرد عليك خلال دقائق معدودة</p>
      </div>
    </div>
  );
}
