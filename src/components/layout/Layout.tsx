import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BottomNavBar from './BottomNavBar';

export default function Layout() {
  return (
    <div className="bg-surface text-on-surface font-body paper-noise min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full pt-20">
        <Outlet />
      </main>
      <Footer />
      <BottomNavBar />
    </div>
  );
}
