import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md fixed top-0 w-full z-50 tonal-shift bg-zinc-50 dark:bg-zinc-900 shadow-sm dark:shadow-none">
      <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
        
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-white/90 dark:bg-white p-1.5 rounded-xl shadow-sm transition-transform group-hover:scale-105">
              <img 
                src="/logo/dawati-logo.png" 
                alt="دعواتي" 
                className="h-8 md:h-10 w-auto object-contain" 
              />
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex gap-8">
          <Link to="/design" className="text-zinc-600 dark:text-zinc-400 font-bold font-headline hover:text-primary transition-colors px-2 py-1 rounded">
            المصمّم
          </Link>
          <Link to="/my-events" className="text-zinc-600 dark:text-zinc-400 font-bold font-headline hover:text-primary transition-colors px-2 py-1 rounded">
            دعواتي
          </Link>
        </nav>

        <Link to="/login" className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold overflow-hidden ring-2 ring-primary/20 cursor-pointer active:scale-95 duration-200">
          <img alt="User profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3uzsoLewEmEO6AIwSc_yVd4wV8crXmSD9OYgwQIJMYEbSmjPMEndffJHwTOzS2S5Kj0eIYPx-t7kh-BbQJDRIV6mlRvlCxZyu-LqT2KTMfdiPzREeKute2WyR0L07DAlBWj68I5jHDWCy7_VxHv-yX71Wf2-OMjtUfUsfxoQHtNcEZN9t9qaeoAbMdJLSRCz7xtz7p2r_vauNi1_P4jgpX7a5RM6DJlIHLd93KDJFdAUYjHlZWjVRpTTdIH0jTsQNNWytodl3Wqs"/>
        </Link>
      </div>
    </header>
  );
}
