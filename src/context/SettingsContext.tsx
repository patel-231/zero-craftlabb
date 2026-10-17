import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteSettings, Category } from '../types/index.ts';
import { api } from '../services/api.ts';

interface SettingsContextType {
  settings: WebsiteSettings | null;
  categories: Category[];
  loading: boolean;
  refreshSettings: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data.settings);
    } catch (err) {
      console.error('Failed to load website settings:', err);
    }
  };

  const refreshCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    Promise.all([refreshSettings(), refreshCategories()]).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        categories,
        loading,
        refreshSettings,
        refreshCategories,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
