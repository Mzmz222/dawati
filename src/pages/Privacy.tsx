import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 font-body">
      <div className="text-center space-y-4 mb-16">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-black text-primary font-headline">سياسة الخصوصية</h1>
        <p className="text-on-surface-variant text-lg">نحن في "دعواتي" نلتزم بحماية بياناتك وخصوصيتك.</p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10 space-y-8 leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface font-headline">١. البيانات التي نجمعها</h2>
          <p className="text-on-surface-variant">نجمع البيانات الضرورية لتقديم خدمة الدعوات الرقمية، بما في ذلك اسمك، رقم جوالك، وبيانات المناسبة والمدعوين.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface font-headline">٢. كيف نستخدم بياناتك</h2>
          <p className="text-on-surface-variant">تُستخدم البيانات فقط لغرض توليد الدعوات، إرسالها عبر الواتساب، والتحقق من الحضور في بوابة المناسبة.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface font-headline">٣. حماية البيانات</h2>
          <p className="text-on-surface-variant">نستخدم تقنيات تشفير متطورة لحماية قواعد بياناتنا، ولا نشارك بياناتك مع أي طرف ثالث لأغراض تسويقية.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface font-headline">٤. حقوقك</h2>
          <p className="text-on-surface-variant">لديك الحق في طلب حذف بياناتك أو تعديلها في أي وقت عبر التواصل مع الدعم الفني.</p>
        </section>
      </div>
    </div>
  );
}
