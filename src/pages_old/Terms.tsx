import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 font-body">
      <div className="text-center space-y-4 mb-16">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-black text-primary font-headline">الشروط والأحكام</h1>
        <p className="text-on-surface-variant text-lg">باستخدامك لمنصة "دعواتي"، فإنك توافق على الشروط التالية.</p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10 space-y-8 leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface font-headline">١. قبول الخدمة</h2>
          <p className="text-on-surface-variant">تُقدم الخدمة لأغراض المناسبات الشخصية والاجتماعية. يمنع استخدامها في أي نشاط يخالف قوانين المملكة العربية السعودية.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface font-headline">٢. سياسة الدفع والاسترجاع</h2>
          <p className="text-on-surface-variant">يتم الدفع مسبقاً لكل مناسبة. نظراً لطبيعة الخدمة الرقمية، لا يمكن استرجاع المبالغ بعد بدء عملية إرسال الدعوات.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface font-headline">٣. مسؤولية المحتوى</h2>
          <p className="text-on-surface-variant">العميل مسؤول مسؤولية كاملة عن صحة أرقام الجوال والأسماء المدخلة، وعن أي محتوى يتم كتابته في بطاقة الدعوة.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface font-headline">٤. التعديلات</h2>
          <p className="text-on-surface-variant">نحتفظ بالحق في تعديل هذه الشروط في أي وقت لتحسين مستوى الخدمة.</p>
        </section>
      </div>
    </div>
  );
}
