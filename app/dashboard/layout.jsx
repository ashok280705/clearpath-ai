'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  const handleLogout = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading' || !session) {
    return <div className="flex items-center justify-center min-h-screen bg-black"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">ClearPath AI</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{session.user.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 min-h-screen bg-gray-900/50 border-r border-gray-800 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => router.push('/dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                pathname === '/dashboard' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              🏠 Home
            </button>
            <button
              onClick={() => router.push('/dashboard/hotspot')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                pathname === '/dashboard/hotspot' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              📍 Report Hotspot
            </button>
            <button
              onClick={() => router.push('/dashboard/garbage-request')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                pathname === '/dashboard/garbage-request' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              🗑️ Request Collection
            </button>
            <button
              onClick={() => router.push('/dashboard/notifications')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                pathname === '/dashboard/notifications' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              🔔 Daily Updates
            </button>
            <button
              onClick={() => router.push('/dashboard/rewards')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                pathname === '/dashboard/rewards' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              🎁 Rewards
            </button>
            <button
              onClick={() => router.push('/dashboard/simulation')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                pathname === '/dashboard/simulation' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              🏙️ City Simulation
            </button>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
