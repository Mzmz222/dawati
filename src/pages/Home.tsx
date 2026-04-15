import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  QrCode as QrIcon, 
  Zap, 
  Eye, 
  BookOpen, 
  Users, 
  MessageCircle,
  ArrowRight,
  ChevronDown,
  Loader2,
  Phone
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getWhatsAppNumber, triggerN8N } from '../lib/n8n';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [waNumber, setWaNumber] = useState('966500000000');
  const [demoPhone, setDemoPhone] = useState('');
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleSendDemo = async () => {
    if (!/^05\d{8}$/.test(demoPhone)) {
      alert('يرجى إدخال رقم جوال صحيح (05xxxxxxxx)');
      return;
    }
    setIsDemoLoading(true);
    try {
      const result = await triggerN8N({
        action: 'send_preview',
        is_preview: true,
        customer: {
          name: 'زائر تجريبي',
          phone: demoPhone
        },
        images: {
          watermarked: 'https://vohlymyegztabzgikbqv.supabase.co/storage/v1/object/public/templates-images/demo-preview.jpg',
          original: 'https://vohlymyegztabzgikbqv.supabase.co/storage/v1/object/public/templates-images/demo-preview.jpg'
        }
      });
      if (result.success) {
        alert('تم إرسال الرسالة التجريبية لهاتفك بنجاح!');
        setDemoPhone('');
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      alert('حدث خطأ أثناء الإرسال: ' + err.message);
    } finally {
      setIsDemoLoading(false);
    }
  };

  useEffect(() => {
    getWhatsAppNumber().then(setWaNumber);
  }, []);

  const faqs = [
    { q: "هل يمكنني تعديل البيانات بعد الشراء؟", a: "نعم، يمكنك تعديل كافة البيانات (التاريخ، الموقع، الوقت) في أي وقت وبشكل مجاني تماماً حتى بعد إرسال الدعوة." },
    { q: "كيف يتم تأكيد حضور الضيوف؟", a: "يحتوي كل رابط دعوة على نموذج \"تأكيد الحضور\". بمجرد ضغط الضيف على الزر، ستصلك رسالة تنبيه وسيتم تحديث قائمتك تلقائياً." },
    { q: "هل تعمل الدعوات على جميع الهواتف؟", a: "بالتأكيد، تم تحسين جميع القوالب لتعمل بسلاسة فائقة على هواتف الآيفون والأندرويد وبأحجام شاشات مختلفة." }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center px-6 md:px-20 overflow-hidden text-center justify-center">
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-12 relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container text-sm font-bold mb-6 animate-fade-in">
            فخامة رقمية فريدة
          </span>
          <h2 className="text-5xl md:text-7xl font-extrabold text-primary mb-8 leading-[1.2] font-headline">
            صمّم <br/>
            <span className="text-secondary">دعوتك الرقمية</span>
          </h2>
          <p className="text-xl text-on-surface-variant mb-10 max-w-2xl leading-relaxed mx-auto font-body">
            دعوات زفاف ومناسبات بأناقة تتجاوز التوقعات. نجمع بين عراقة الخط العربي وحداثة التصميم الرقمي.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/design" 
              className="px-8 py-4 bg-gradient-to-r from-primary to-deeppurple-700 text-on-primary rounded-xl font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              ابدأ التصميم الآن
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href={`https://wa.me/${waNumber}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-primary border border-primary/10 rounded-xl font-bold text-lg flex items-center gap-2 shadow-sm hover:bg-surface-container-low transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              تواصل عبر واتساب
            </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </section>

      {/* Demo Section */}
      <section className="bg-white py-16 border-y border-outline-variant/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-12 rounded-[2.5rem] border border-primary/10 space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-primary font-headline">جرب الرسالة التجريبية (مجاناً)</h3>
              <p className="text-on-surface-variant font-body">أدخل رقم جوالك لتصلك عينة من الدعوة الإلكترونية عبر واتساب الآن.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40" />
                <input 
                  type="text" 
                  value={demoPhone}
                  onChange={(e) => setDemoPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="w-full bg-white border-2 border-primary/10 rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 transition-all font-body text-right dir-ltr"
                />
              </div>
              <button 
                onClick={handleSendDemo}
                disabled={isDemoLoading}
                className="px-8 py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-900 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isDemoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                أرسل لي التجربة
              </button>
            </div>
            <p className="text-[10px] text-on-surface-variant/60 font-body">سيتم إرسال رسالة واحدة فقط لغرض التجربة. خصوصيتك محفوظة.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface-container-low text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-primary mb-4 font-headline">لماذا تختار دعواتي؟</h3>
            <p className="text-on-surface-variant max-w-xl mx-auto font-body">نقدم لك تجربة متكاملة لإدارة ضيوفك ودعواتك بكل يسر وفخامة.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Feature 1: QR Code */}
            <div className="md:col-span-8 bg-surface-container-lowest p-10 rounded-3xl flex flex-col items-center group hover:shadow-xl transition-shadow duration-500 border border-outline-variant/10 text-center">
              <QrIcon className="w-12 h-12 text-primary mb-6" />
              <h4 className="text-2xl font-bold mb-4 text-primary font-headline">رمز الاستجابة السريع (QR Code)</h4>
              <p className="text-on-surface-variant max-w-md leading-relaxed mx-auto font-body">دخول منظم وسريع لضيوفك عبر مسح الكود عند البوابة، مما يضفي لمسة من الاحترافية على حفلكم.</p>
            </div>

            {/* Feature 2: Speed */}
            <div className="md:col-span-4 bg-primary text-on-primary p-10 rounded-3xl flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform">
              <Zap className="w-12 h-12 mb-6 text-secondary-container" />
              <h4 className="text-2xl font-bold mb-4 font-headline">سرعة فائقة</h4>
              <p className="text-primary-container/90 leading-relaxed mx-auto font-body">صمم دعوتك واحصل عليها في دقائق معدودة لتشاركها فوراً مع أحبائك.</p>
            </div>

            {/* Feature 3: Try Before Pay */}
            <Link to="/design?demo=true" className="md:col-span-4 bg-tertiary-container text-on-tertiary-container p-10 rounded-3xl border border-tertiary/10 text-center flex flex-col items-center justify-center group hover:scale-[1.02] transition-transform">
              <Eye className="w-12 h-12 mb-6" />
              <h4 className="text-2xl font-bold mb-4 font-headline">جرب العرض (Demo)</h4>
              <p className="leading-relaxed mx-auto font-body opacity-90">شاهد تجربة حية للدعوة الإلكترونية وطريقة عرضها للضيوف قبل البدء.</p>
            </Link>

            {/* Feature 4: Ready Templates */}
            <div className="md:col-span-4 bg-white p-10 rounded-3xl shadow-sm border border-outline-variant/10 text-center flex flex-col items-center justify-center group hover:scale-[1.02] transition-transform">
              <BookOpen className="w-12 h-12 text-secondary mb-6" />
              <h4 className="text-2xl font-bold mb-4 text-primary font-headline">قوالب جاهزة</h4>
              <p className="text-on-surface-variant leading-relaxed mx-auto font-body">مجموعة مختارة من القوالب التي صممها كبار المصممين لتناسب كافة الأذواق.</p>
            </div>

            {/* Feature 5: Guest Management */}
            <div className="md:col-span-4 bg-secondary-container text-on-secondary-container p-10 rounded-3xl text-center flex flex-col items-center justify-center group hover:scale-[1.02] transition-transform">
              <Users className="w-12 h-12 mb-6" />
              <h4 className="text-2xl font-bold mb-4 font-headline">إدارة الضيوف</h4>
              <p className="leading-relaxed mx-auto font-body opacity-90">تابع تأكيدات الحضور وقوائم المدعوين لحظة بلحظة عبر لوحة تحكم ذكية.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white text-center pb-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-tertiary font-bold tracking-widest text-xs uppercase mb-2 block font-headline">تحتاج للمساعدة؟</span>
            <h3 className="text-4xl font-bold text-primary font-headline">الأسئلة الشائعة</h3>
          </div>
          <div className="space-y-4">
            {faqs.map((item, index) => (
              <div 
                key={index} 
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="p-6 rounded-2xl bg-surface-container-low text-right group cursor-pointer hover:bg-surface-container transition-all duration-300"
              >
                <div className="flex justify-between items-center w-full">
                  <h4 className="text-lg font-bold text-primary font-headline">{item.q}</h4>
                  <ChevronDown className={cn("w-5 h-5 text-primary transition-transform duration-300", openFaq === index && "rotate-180")} />
                </div>
                <div className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  openFaq === index ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                )}>
                  <p className="overflow-hidden text-on-surface-variant leading-relaxed font-body">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
