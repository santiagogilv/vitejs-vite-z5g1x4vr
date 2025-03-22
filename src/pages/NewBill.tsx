
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import BillCreator from "@/components/bills/BillCreator";

const NewBill = () => {
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
