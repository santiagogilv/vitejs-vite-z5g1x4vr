import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Wallet, CreditCard, DollarSign, MoreVertical, Trash2, Star } from "lucide-react";

interface PaymentMethod {
  id: string;
  type: string;
  bank_name: string | null;
  account_number: string | null;
  rut: string | null;
  email: string | null;
  is_default: boolean;
  created_at: string;
}

const PaymentMethodsList = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchPaymentMethods = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false });
          
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

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    
    try {
      // First, set all payment methods to not be default
      const { error: updateError } = await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);
        
      if (updateError) throw updateError;
      
      // Then set the selected one as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          is_default: method.id === id
        }))
      );
      
      toast.success("Default payment method updated");
    } catch (error: any) {
      console.error("Error updating default payment method:", error.message);
      toast.error("Failed to update default payment method");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
      toast.success("Payment method deleted");
    } catch (error: any) {
      console.error("Error deleting payment method:", error.message);
      toast.error("Failed to delete payment method");
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Wallet className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full" />;
      case 'paypal':
        return <DollarSign className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full" />;
      case 'venmo':
        return <CreditCard className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full" />;
      case 'cash':
        return <DollarSign className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full" />;
      default:
        return <CreditCard className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full" />;
    }
  };

  const getPaymentMethodDetails = (method: PaymentMethod) => {
    switch (method.type) {
      case 'bank':
        return (
          <div>
            <p className="font-medium">{method.bank_name}</p>
            <p className="text-sm text-muted-foreground">
              {method.account_number ? `Account: ${method.account_number}` : "No account number"}
            </p>
          </div>
        );
      case 'paypal':
      case 'venmo':
        return (
          <div>
            <p className="font-medium">{method.type.charAt(0).toUpperCase() + method.type.slice(1)}</p>
            <p className="text-sm text-muted-foreground">{method.email}</p>
          </div>
        );
      case 'cash':
        return (
          <div>
            <p className="font-medium">Cash</p>
            <p className="text-sm text-muted-foreground">In-person payment</p>
          </div>
        );
      default:
        return (
          <div>
            <p className="font-medium">Unknown payment type</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading payment methods...</div>;
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>You don't have any payment methods yet.</p>
        <p className="text-sm">Add one below to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paymentMethods.map((method) => (
        <Card key={method.id} className={method.is_default ? "border-primary" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getPaymentMethodIcon(method.type)}
                {getPaymentMethodDetails(method)}
              </div>
              
              <div className="flex items-center">
                {method.is_default && (
                  <div className="mr-2 flex items-center text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 mr-1" /> Default
                  </div>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {!method.is_default && (
                      <DropdownMenuItem onClick={() => handleSetDefault(method.id)}>
                        <Star className="h-4 w-4 mr-2" /> Set as Default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleDelete(method.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PaymentMethodsList;
