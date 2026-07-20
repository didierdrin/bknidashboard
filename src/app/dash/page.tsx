'use client';
import { useState, useEffect } from 'react';
import { auth } from '../../../firebaseApp';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { FaHome, FaShoppingCart, FaBoxes, FaHistory, FaAd, FaQuestionCircle, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

// Import components
import Overview from '@/components/Overview';
import Inventory from '@/components/Inventory';
import CurrentOrders from '@/components/CurrentOrders';
import RecentOrders from '@/components/RecentOrders';
import Advertise from '@/components/Advertise';
import Help from '@/components/Help';
import Settings from '@/components/Settings';
import ThemeToggle from '@/components/ThemeToggle';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => {
      if (!mq.matches) {
        setSidebarOpen(false);
        setMobileMenuOpen(false);
      } else {
        setSidebarOpen(true);
        setMobileMenuOpen(false);
      }
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const menuItems = [
    { name: 'overview', icon: FaHome, component: Overview },
    { name: 'inventory', icon: FaBoxes, component: Inventory },
    { name: 'Current orders', icon: FaShoppingCart, component: CurrentOrders },
    { name: 'recent orders', icon: FaHistory, component: RecentOrders },
    { name: 'banners', icon: FaAd, component: Advertise },
    { name: 'help', icon: FaQuestionCircle, component: Help },
    { name: 'settings', icon: FaCog, component: Settings },
  ];

  const ActiveComponent = menuItems.find(item => item.name === activeTab)?.component || (() => <div>Not found</div>);

  const selectTab = (name: string) => {
    setActiveTab(name);
    setMobileMenuOpen(false);
  };

  const sidebarExpanded = sidebarOpen || mobileMenuOpen;

  return (
    <div className="flex h-screen min-h-0 bg-gray-100 dark:bg-gray-950">
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col bg-gray-800 text-white transition-transform duration-300 ease-in-out
          md:static md:z-auto md:translate-x-0 md:shrink-0
          ${sidebarExpanded ? 'w-64 p-5' : 'w-20 p-3 md:p-5'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col flex-grow min-h-0">
          <div className="mb-5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden text-left hover:text-slate-300 md:block"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? '«' : '»'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="ml-auto hover:text-slate-300 md:hidden"
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => selectTab(item.name)}
                className={`flex w-full items-center mb-4 hover:text-blue-400 ${activeTab === item.name ? 'text-blue-400' : ''} ${sidebarExpanded ? '' : 'justify-center'}`}
              >
                <item.icon className={sidebarExpanded ? 'mr-2 shrink-0' : 'shrink-0'} />
                {sidebarExpanded && (
                  <span className="truncate text-left">
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <hr className="my-6 border-gray-600" />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={`flex items-center text-red-400 hover:text-red-600 ${sidebarExpanded ? '' : 'justify-center'}`}
        >
          <FaSignOutAlt className={sidebarExpanded ? 'mr-2 shrink-0' : 'shrink-0'} />
          {sidebarExpanded && <span>Log out</span>}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 md:hidden"
              aria-label="Open menu"
            >
              <FaBars className="text-xl" />
            </button>
            <h1 className="truncate text-lg font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-10">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 md:mb-5">
            Welcome, {user?.displayName}!
          </p>

          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}
