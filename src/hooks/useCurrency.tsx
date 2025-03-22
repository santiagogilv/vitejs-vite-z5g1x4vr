
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
}

// Default currencies to use as fallback if API fails
const DEFAULT_CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", decimal_places: 2 },
  { code: "EUR", name: "Euro", symbol: "€", decimal_places: 2 },
  { code: "GBP", name: "British Pound", symbol: "£", decimal_places: 2 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", decimal_places: 0 },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", decimal_places: 2 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", decimal_places: 2 },
];

export const useCurrency = (initialCurrency = "USD") => {
  const { profile } = useAuth();
  const [currencies, setCurrencies] = useState<Currency[]>(DEFAULT_CURRENCIES);
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);
  const [loading, setLoading] = useState(true);

  // Load currencies from Supabase and set user's preferred currency
  useEffect(() => {
    // Use the user's preferred currency from their profile if available
    if (profile?.preferred_currency) {
      setSelectedCurrency(profile.preferred_currency);
    }

    const fetchCurrencies = async () => {
      try {
        const { data, error } = await supabase.rpc('get_currencies');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setCurrencies(data);
          console.log("Currencies loaded:", data.length);
        } else {
          console.log("No currencies returned from API, using defaults");
        }
      } catch (error) {
        console.error("Error fetching currencies:", error);
        // If there's an error, we already have DEFAULT_CURRENCIES as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, [profile]);

  // Save the selected currency to localStorage for persistence
  useEffect(() => {
    try {
      localStorage.setItem('preferred_currency', selectedCurrency);
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  }, [selectedCurrency]);

  // Initialize from localStorage when component mounts
  useEffect(() => {
    try {
      const saved = localStorage.getItem('preferred_currency');
      if (saved) {
        setSelectedCurrency(saved);
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e);
    }
  }, []);

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
