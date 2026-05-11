import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '@/services/api';

interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  taxId: string;
  registrationNumber: string;
  taxRate: number;
  currency: string;
  invoicePrefix: string;
  invoiceStartNumber: number;
  paymentTerms: number;
  description?: string;
}

interface CompanySettingsContextType {
  settings: CompanySettings | null;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const CompanySettingsContext = createContext<CompanySettingsContextType | undefined>(undefined);

export const useCompanySettings = () => {
  const context = useContext(CompanySettingsContext);
  if (context === undefined) {
    throw new Error('useCompanySettings must be used within a CompanySettingsProvider');
  }
  return context;
};

export const CompanySettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getCompanySettings();
      const data = (response.data as { settings?: CompanySettings })?.settings || response.data as CompanySettings;
      setSettings(data);
      
      // Mettre à jour le favicon dynamiquement
      if (data.logo) {
        updateFavicon(data.logo);
      }
    } catch (error) {
      console.error('Error loading company settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFavicon = (logoUrl: string) => {
    // Mettre à jour le favicon
    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = logoUrl;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/png';
      newFavicon.href = logoUrl;
      document.head.appendChild(newFavicon);
    }

    // Mettre à jour les meta tags Open Graph
    let ogImage = document.querySelector("meta[property='og:image']") as HTMLMetaElement;
    if (ogImage) {
      ogImage.content = logoUrl;
    } else {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      ogImage.content = logoUrl;
      document.head.appendChild(ogImage);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const value: CompanySettingsContextType = {
    settings,
    isLoading,
    refreshSettings: loadSettings,
  };

  return (
    <CompanySettingsContext.Provider value={value}>
      {children}
    </CompanySettingsContext.Provider>
  );
};
