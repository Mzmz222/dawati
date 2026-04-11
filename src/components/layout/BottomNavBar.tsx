import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  Home,
  Edit3,
  Layout,
  User
} from 'lucide-react';

export default function BottomNavBar() {
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'الرئيسية', icon: Home },
    { to: '/design', label: 'المصمّم', icon: Edit3 },
    { to: '/my-events', label: 'دعواتي', icon: Layout },
    { to: '/settings', label: 'حسابي', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-20 pb-safe bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl rounded-t-[2.5rem] border-t border-zinc-100 dark:border-zinc-800 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 min-w-[70px]",
              isActive
                ? "bg-primary text-on-primary scale-110 -translate-y-2 shadow-lg shadow-primary/20"
                : "text-zinc-400 dark:text-zinc-500 hover:text-primary"
            )}
          >
            <item.icon className={cn("w-6 h-6 mb-1", isActive ? "scale-100" : "scale-90")} />
            <span className="font-['Almarai'] font-bold text-[10px] tracking-tight whitespace-nowrap">
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
