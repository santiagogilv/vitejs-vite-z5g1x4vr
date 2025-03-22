
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
}

export const useCurrency = (initialCurrency = "USD") => {
  const { profile } = useAuth();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use the user's preferred currency from their profile if available
    if (profile?.preferred_currency) {
      setSelectedCurrency(profile.preferred_currency);
    }

    const fetchCurrencies = async () => {
      try {
        const { data, error } = await supabase.rpc('get_currencies');
        if (error) throw error;
        setCurrencies(data || []);
      } catch (error) {
        console.error("Error fetching currencies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, [profile]);

  // Get current currency details
  const getCurrentCurrency = (): Currency => {
    const found = currencies.find(c => c.code === selectedCurrency);
    
    // Default fallback if currency not found
    return found || {
      code: selectedCurrency,
      name: selectedCurrency,
      symbol: selectedCurrency === "USD" ? "$" : selectedCurrency,
      decimal_places: 2
    };
  };

  // Format amount according to the selected currency
  const formatAmount = (amount: number): string => {
    const currency = getCurrentCurrency();
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.decimal_places,
      maximumFractionDigits: currency.decimal_places,
    }).format(amount);
  };

  // Format without currency symbol, just the number
  const formatNumber = (amount: number): string => {
    const currency = getCurrentCurrency();
    
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currency.decimal_places,
      maximumFractionDigits: currency.decimal_places,
    }).format(amount);
  };

  return {
    currencies,
    selectedCurrency,
    setSelectedCurrency,
    loading,
    formatAmount,
    formatNumber,
    getCurrentCurrency,
  };
};
