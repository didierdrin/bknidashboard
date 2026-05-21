'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

type SettingsType = {
  notifications: boolean;
  language: string;
  currency: string;
};

const Settings = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<SettingsType>({
    notifications: true,
    language: 'en',
    currency: 'USD',
  });

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  const handleToggle = (setting: keyof Pick<SettingsType, 'notifications'>) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [setting]: !prevSettings[setting],
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  return (
    <div className="dashboard-card">
      <h3 className="mb-4 text-lg font-semibold sm:text-xl">Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Notifications</span>
          <button
            type="button"
            onClick={() => handleToggle('notifications')}
            className={`h-6 w-12 rounded-full p-1 ${settings.notifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <div
              className={`h-4 w-4 transform rounded-full bg-white duration-300 ease-in-out ${settings.notifications ? 'translate-x-6' : ''}`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span>Dark Mode</span>
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`h-6 w-12 rounded-full p-1 ${isDark ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div
              className={`h-4 w-4 transform rounded-full bg-white duration-300 ease-in-out ${isDark ? 'translate-x-6' : ''}`}
            />
          </button>
        </div>
        <div>
          <label htmlFor="language" className="mb-1 block">
            Language
          </label>
          <select
            id="language"
            name="language"
            value={settings.language}
            onChange={handleChange}
            className="dashboard-input w-full"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>
        <div>
          <label htmlFor="currency" className="mb-1 block">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={settings.currency}
            onChange={handleChange}
            className="dashboard-input w-full"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Settings;
