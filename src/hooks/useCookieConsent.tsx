import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export interface CookieConsent {
  strictlyNecessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_NAME = 'scConsent';
const BANNER_VERSION = '1.0';

export const useCookieConsent = () => {
  const { language } = useLanguage();
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  // Generate or retrieve session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('sc_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('sc_session_id', sessionId);
    }
    return sessionId;
  };

  // Load consent from cookie
  useEffect(() => {
    const loadConsent = () => {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${COOKIE_NAME}=`));
      
      if (cookieValue) {
        try {
          const consentData = JSON.parse(decodeURIComponent(cookieValue.split('=')[1]));
          setConsent(consentData);
          applyConsent(consentData);
        } catch (e) {
          console.error('Error parsing consent cookie:', e);
          setShowBanner(true);
        }
      } else {
        setShowBanner(true);
      }
    };

    loadConsent();
  }, []);

  // Apply consent to third-party scripts
  const applyConsent = (consentData: CookieConsent) => {
    // Google Consent Mode v2
    if (typeof window.gtag !== 'undefined') {
      window.gtag('consent', 'update', {
        'analytics_storage': consentData.analytics ? 'granted' : 'denied',
        'ad_storage': consentData.marketing ? 'granted' : 'denied',
        'ad_user_data': consentData.marketing ? 'granted' : 'denied',
        'ad_personalization': consentData.marketing ? 'granted' : 'denied',
        'functionality_storage': consentData.functional ? 'granted' : 'denied',
      });
    }

    // Meta Pixel
    if (consentData.marketing && typeof window.fbq !== 'undefined') {
      window.fbq('consent', 'grant');
    } else if (typeof window.fbq !== 'undefined') {
      window.fbq('consent', 'revoke');
    }

    // TikTok Pixel
    if (typeof window.ttq !== 'undefined') {
      if (consentData.marketing) {
        window.ttq('enableCookie');
      } else {
        window.ttq('disableCookie');
      }
    }

    // Twitter Pixel (no consent API, controlled by loading)
    if (consentData.marketing && typeof window.twq !== 'undefined') {
      window.twq('track', 'PageView');
    }
  };

  // Save consent
  const saveConsent = async (consentData: CookieConsent, method: string) => {
    // Save to cookie (365 days)
    const expires = new Date();
    expires.setDate(expires.getDate() + 365);
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consentData))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    
    // Save to localStorage
    localStorage.setItem(COOKIE_NAME, JSON.stringify(consentData));
    
    setConsent(consentData);
    setShowBanner(false);
    applyConsent(consentData);

    // Log to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('consent_logs').insert({
        user_id: user?.id || null,
        session_id: getSessionId(),
        language: language,
        banner_version: BANNER_VERSION,
        strictly_necessary: consentData.strictlyNecessary,
        functional: consentData.functional,
        analytics: consentData.analytics,
        marketing: consentData.marketing,
        user_agent: navigator.userAgent,
        consent_method: method,
      });
    } catch (error) {
      console.error('Error logging consent:', error);
    }
  };

  const acceptAll = () => {
    saveConsent({
      strictlyNecessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    }, 'accept_all');
  };

  const rejectAll = () => {
    saveConsent({
      strictlyNecessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    }, 'reject_all');
  };

  const saveCustom = (customConsent: CookieConsent) => {
    saveConsent(customConsent, 'custom');
  };

  const openPreferences = () => {
    setShowBanner(true);
  };

  // Expose to window for "Manage Cookies" button
  useEffect(() => {
    window.SC_openCookiePreferences = openPreferences;
    return () => {
      delete window.SC_openCookiePreferences;
    };
  }, []);

  return {
    consent,
    showBanner,
    acceptAll,
    rejectAll,
    saveCustom,
    openPreferences,
  };
};

// Extend window type
declare global {
  interface Window {
    SC_openCookiePreferences?: () => void;
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    ttq?: (...args: any[]) => void;
    twq?: (...args: any[]) => void;
  }
}
