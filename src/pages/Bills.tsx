
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/hooks/useCurrency";
import { CalendarDays, Plus, Receipt, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";

const Bills = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchBills = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('bills')
          .select(`
            *,
            bill_participants(count)
          `)
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBills(data || []);
      } catch (error: any) {
        console.error("Error fetching bills:", error.message);
        toast.error("Failed to load bills");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBills();
  }, [user, navigate]);

  const handleCreateNewBill = () => {
    navigate("/new-bill");
  };

  const handleViewBill = (id: string) => {
    navigate(`/bills/${id}`);
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="page-header">Your Bills</h1>
          <p className="text-muted-foreground">Manage and track your shared expenses</p>
        </div>
        <Button onClick={handleCreateNewBill}>
          <Plus className="w-4 h-4 mr-2" /> New Bill
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your bills...</p>
          </div>
        </div>
      ) : bills.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h2 className="text-xl font-semibold mb-2">No bills yet</h2>
          <p className="text-muted-foreground mb-6">You haven't created any bills yet.</p>
          <Button onClick={handleCreateNewBill}>Create your first bill</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bills.map((bill) => (
            <motion.div
              key={bill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-5 hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => handleViewBill(bill.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">{bill.title}</h3>
                <div className="font-bold">
                  {formatAmount(bill.total_amount)}
                </div>
              </div>
              <div className="flex items-center text-muted-foreground text-sm mb-4">
                <CalendarDays className="w-4 h-4 mr-1" />
                {format(new Date(bill.created_at), "MMM d, yyyy")}
                <Users className="w-4 h-4 ml-4 mr-1" />
                {bill.bill_participants[0].count} people
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Bills;
