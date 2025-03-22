
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CreditCard, Trash2, Copy, Bank, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PaymentMethod {
  id: string;
  type: string;
  account_number?: string;
  bank_name?: string;
  rut?: string;
  email?: string;
  is_default: boolean;
}

const PaymentMethodsList = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });

        if (error) throw error;
        setPaymentMethods(data || []);
      } catch (error: any) {
        console.error("Error fetching payment methods:", error.message);
        toast.error("Failed to load payment methods");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
      toast.success("Payment method deleted");
    } catch (error: any) {
      console.error("Error deleting payment method:", error.message);
      toast.error("Failed to delete payment method");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // First, set all to not default
      const { error: updateError } = await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user!.id);

      if (updateError) throw updateError;

      // Then set the selected one as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setPaymentMethods(paymentMethods.map(method => ({
        ...method,
        is_default: method.id === id
      })));

      toast.success("Default payment method updated");
    } catch (error: any) {
      console.error("Error updating default payment method:", error.message);
      toast.error("Failed to update default payment method");
    }
  };

  const handleCopyToClipboard = (method: PaymentMethod) => {
    let textToCopy = "";
    
    if (method.type === "bank") {
      textToCopy = `Bank: ${method.bank_name}\nAccount: ${method.account_number}`;
      if (method.rut) textToCopy += `\nRUT: ${method.rut}`;
    } else if (method.type === "paypal" || method.type === "venmo") {
      textToCopy = `${method.type.charAt(0).toUpperCase() + method.type.slice(1)}: ${method.email}`;
    } else if (method.type === "cash") {
      textToCopy = "Cash payment";
    }
    
    navigator.clipboard.writeText(textToCopy);
    toast.success("Payment details copied to clipboard");
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Bank className="h-5 w-5" />;
      case "paypal":
      case "venmo":
        return <DollarSign className="h-5 w-5" />;
      case "cash":
        return <CreditCard className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading payment methods...</div>;
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>You haven't added any payment methods yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paymentMethods.map((method) => (
        <div 
          key={method.id}
          className={`p-4 rounded-lg border flex items-center justify-between ${
            method.is_default ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          <div className="flex items-center space-x-3">
            {getMethodIcon(method.type)}
            <div>
              <div className="font-medium flex items-center">
                {method.type.charAt(0).toUpperCase() + method.type.slice(1)}
                {method.is_default && (
                  <Badge variant="outline" className="ml-2 bg-primary/10">Default</Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {method.type === "bank" && `${method.bank_name} • ${method.account_number?.slice(-4)}`}
                {(method.type === "paypal" || method.type === "venmo") && method.email}
                {method.type === "cash" && "In-person payment"}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleCopyToClipboard(method)}
              title="Copy details"
            >
              <Copy className="h-4 w-4" />
            </Button>
            {!method.is_default && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleSetDefault(method.id)}
                title="Make default"
              >
                Set Default
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleDelete(method.id)}
              className="text-destructive hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentMethodsList;
