export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 subtle-tonal-contrast flat mb-20 md:mb-0">
      <div className="w-full flex flex-col items-center space-y-4 text-center px-8 max-w-7xl mx-auto">
        <div className="mb-4 flex flex-col items-center">
          <img 
            src="/logo/dawati-logo.png" 
            alt="دعواتي" 
            className="h-12 w-auto object-contain mb-4" 
          />
          <p className="font-['Noto_Serif'] italic text-primary dark:text-primary-container text-2xl font-bold">مصمم دعواتي الرقمي</p>
          <p className="text-sm font-['Almarai'] text-zinc-500 mt-2">© ٢٠٢٤ جميع الحقوق محفوظه لـ دعواتي</p>
        </div>
        <div className="flex gap-8">
          <a className="text-sm text-zinc-500 hover:text-primary transition-colors font-bold" href="/privacy">سياسة الخصوصية</a>
          <a className="text-sm text-zinc-500 hover:text-primary transition-colors font-bold" href="/terms">الشروط والأحكام</a>
          <a className="text-sm text-zinc-500 hover:text-primary transition-colors font-bold" href="/support">الدعم الفني</a>
        </div>
      </div>
    </footer>
  );
}
