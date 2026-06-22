import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Gradient background */}
      <div className="fixed inset-0 z-0" style={{ background: 'linear-gradient(135deg, #0057b8 0%, #1e88e5 25%, #fef3e8 50%, #ff7a00 75%, #ff9a40 100%)' }} />
      <div className="fixed inset-0 z-0 opacity-60" style={{ background: 'radial-gradient(ellipse at top left, rgba(0,87,184,0.4) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(255,122,0,0.4) 0%, transparent 50%)' }} />

      <div className="relative z-10">
        <Navbar />
        {/* Blue side panels */}
        <div className="fixed top-14 left-0 bottom-0 w-4 z-10" style={{ background: 'linear-gradient(180deg, #0057b8, #ff7a00)', boxShadow: '4px 0 20px rgba(0,87,184,0.3)' }} />
        <div className="fixed top-14 right-0 bottom-0 w-4 z-10" style={{ background: 'linear-gradient(180deg, #0057b8, #ff7a00)', boxShadow: '-4px 0 20px rgba(255,122,0,0.3)' }} />
        <main className="pt-16 min-h-screen px-5">
          <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
