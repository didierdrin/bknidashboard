'use client';
import { useState } from 'react';
import { auth } from '../../../firebaseApp';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { FaHome, FaShoppingCart, FaBoxes, FaHistory, FaAd, FaQuestionCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';

// Import components
import Overview from '@/components/Overview';
import Inventory from '@/components/Inventory';
import CurrentOrders from '@/components/CurrentOrders';
import RecentOrders from '@/components/RecentOrders';
import Advertise from '@/components/Advertise';
import Help from '@/components/Help';
import Settings from '@/components/Settings';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

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
    { name: 'advertise', icon: FaAd, component: Advertise },
    { name: 'help', icon: FaQuestionCircle, component: Help },
    { name: 'settings', icon: FaCog, component: Settings },
  ];

  const ActiveComponent = menuItems.find(item => item.name === activeTab)?.component || (() => <div>Not found</div>);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white p-5 transition-all duration-300`}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mb-5 w-full text-left hover:text-slate-300">
          {sidebarOpen ? '« ' : '»'}
        </button>
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`flex hover:text-blue-600 items-center mb-4 ${activeTab === item.name ? 'text-blue-400' : ''} ${sidebarOpen ? 'w-full' : 'w-10'} overflow-hidden`}
          >
            <item.icon className="mr-2" />
            {sidebarOpen && <span>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</span>}
          </button>
        ))}
        <hr className='py-10 mt-10' />
        <button onClick={handleLogout} className="flex items-center mt-5 text-red-400 hover:text-red-600 ">
          <FaSignOutAlt className="mr-2" />
          {sidebarOpen && <span>Log out</span>}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 p-10 overflow-auto">
        <h2 className="text-2xl font-bold mb-5">Dashboard</h2>
        <p className="mb-5">Welcome, {user?.displayName}!</p>

        <ActiveComponent />
      </div>
    </div>
  );
}