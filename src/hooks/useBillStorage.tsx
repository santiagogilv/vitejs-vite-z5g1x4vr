
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export interface User {
  id: string;
  name: string;
}

export interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedUsers: User[];
  paidBy?: User;
}

export interface BillData {
  id: string;
  title: string;
  items: BillItem[];
  users: User[];
  currency: string;
  totalAmount: number;
  payments: {from: User, to: User, amount: number}[];
  updatedAt: string;
}

export const useBillStorage = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Record<string, BillData>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load bills from localStorage on component mount
  useEffect(() => {
    try {
      const savedBills = localStorage.getItem('dine-share-bills');
      if (savedBills) {
        setBills(JSON.parse(savedBills));
      }
    } catch (e) {
      console.error("Error loading bills from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save bills to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('dine-share-bills', JSON.stringify(bills));
      } catch (e) {
        console.error("Error saving bills to localStorage:", e);
      }
    }
  }, [bills, isLoaded]);

  const saveBill = (billData: Omit<BillData, 'id' | 'updatedAt'>) => {
    const billId = uuidv4();
    const updatedAt = new Date().toISOString();
    
    setBills(prev => ({
      ...prev,
      [billId]: {
        ...billData,
        id: billId,
        updatedAt
      }
    }));
    
    return billId;
  };

  const updateBill = (billId: string, billData: Partial<Omit<BillData, 'id' | 'updatedAt'>>) => {
    const updatedAt = new Date().toISOString();
    
    setBills(prev => {
      if (!prev[billId]) {
        return prev;
      }

      return {
        ...prev,
        [billId]: {
          ...prev[billId],
          ...billData,
          updatedAt
        }
      };
    });
  };

  const getBill = (billId: string): BillData | undefined => {
    return bills[billId];
  };

  const deleteBill = (billId: string) => {
    setBills(prev => {
      const newBills = { ...prev };
      delete newBills[billId];
      return newBills;
    });
  };

  const getAllBills = (): BillData[] => {
    return Object.values(bills).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  return {
    saveBill,
    updateBill,
    getBill,
    deleteBill,
    getAllBills,
    isLoaded
  };
};
