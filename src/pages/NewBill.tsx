
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import BillCreator from "@/components/bills/BillCreator";
import { useCurrency } from "@/hooks/useCurrency";
import { useBillStorage } from "@/hooks/useBillStorage";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Undo2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const NewBill = () => {
  const [searchParams] = useSearchParams();
  const billId = searchParams.get("id");
  const [selectedTab, setSelectedTab] = useState("new");
  const isMobile = useIsMobile();
  
  // Pre-load currencies when the page loads
  const { currencies } = useCurrency();
  const { getAllBills, deleteBill } = useBillStorage();
  const savedBills = getAllBills();
  
  useEffect(() => {
    if (billId) {
      setSelectedTab("new");
    }
  }, [billId]);

  const handleDeleteBill = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this bill?")) {
      deleteBill(id);
    }
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="page-header">Create New Bill</h1>
        <p className="text-muted-foreground mb-5">
          Add items, assign people, and calculate a fair split
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new" className="h-full">
            <span className={isMobile ? "" : "mr-2"}>New Bill</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="h-full">
            <Clock className={`w-4 h-4 ${isMobile ? "" : "mr-2"}`} />
            <span className={isMobile ? "" : "mr-2"}>Saved Bills</span>
            {savedBills.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                {savedBills.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-4">
          <BillCreator initialBillId={billId || undefined} />
        </TabsContent>
        <TabsContent value="saved" className="mt-4">
          {savedBills.length > 0 ? (
            <div className="space-y-3">
              {savedBills.map(bill => (
                <div 
                  key={bill.id} 
                  className="glass-card p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => {
                    setSelectedTab("new");
                    window.history.pushState(null, "", `/new-bill?id=${bill.id}`);
                    window.dispatchEvent(new Event('popstate'));
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{bill.title}</h3>
                      <div className="flex text-sm text-muted-foreground">
                        <span className="mr-3">{bill.items.length} items</span>
                        <span className="mr-3">{bill.users.length} people</span>
                        <span>
                          {bill.currency} {bill.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground mr-3">
                        {formatDistanceToNow(new Date(bill.updatedAt), { addSuffix: true })}
                      </span>
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => handleDeleteBill(bill.id, e)}
                      >
                        <Undo2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No saved bills yet. Create your first bill to see it here.</p>
              <Button 
                variant="outline" 
                onClick={() => setSelectedTab("new")} 
                className="mt-4"
              >
                Create New Bill
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default NewBill;
