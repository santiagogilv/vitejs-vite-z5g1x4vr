
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import BillCreator from "@/components/bills/BillCreator";
import { useCurrency } from "@/hooks/useCurrency";

const NewBill = () => {
  // Pre-load currencies when the page loads
  const { currencies } = useCurrency();
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="page-header">Create New Bill</h1>
        <p className="text-muted-foreground mb-8">
          Add items, assign people, and calculate a fair split
        </p>
      </div>
      <BillCreator />
    </AppLayout>
  );
};

export default NewBill;
