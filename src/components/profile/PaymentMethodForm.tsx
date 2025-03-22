
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const PaymentMethodForm = () => {
  const { user } = useAuth();
  const [type, setType] = useState("bank");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // If setting as default, update all other payment methods to not be default
      if (isDefault) {
        const { error: updateError } = await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      // Insert new payment method
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          type,
          account_number: accountNumber,
          bank_name: bankName,
          rut,
          email,
          is_default: isDefault,
        })
        .select();

      if (error) throw error;
      
      // Reset form
      setType("bank");
      setAccountNumber("");
      setBankName("");
      setRut("");
      setEmail("");
      setIsDefault(false);
      
      toast.success("Payment method added successfully");
    } catch (error: any) {
      console.error("Error adding payment method:", error.message);
      toast.error("Failed to add payment method");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="payment-type">Payment Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank">Bank Account</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="venmo">Venmo</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {type === "bank" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="bank-name">Bank Name</Label>
            <Input 
              id="bank-name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Enter bank name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="account-number">Account Number</Label>
            <Input 
              id="account-number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rut">RUT (for Chilean accounts)</Label>
            <Input 
              id="rut"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="Optional: Enter RUT"
            />
          </div>
        </>
      )}
      
      {(type === "paypal" || type === "venmo") && (
        <div className="space-y-2">
          <Label htmlFor="payment-email">Email/Username</Label>
          <Input 
            id="payment-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`Enter your ${type} email or username`}
            required
          />
        </div>
      )}
      
      {/* Added a description for cash payment type */}
      {type === "cash" && (
        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            Cash payment will be recorded as an available payment method. No additional details needed.
          </p>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Switch
          id="is-default"
          checked={isDefault}
          onCheckedChange={setIsDefault}
        />
        <Label htmlFor="is-default">Make this my default payment method</Label>
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Payment Method"}
      </Button>
    </form>
  );
};

export default PaymentMethodForm;
