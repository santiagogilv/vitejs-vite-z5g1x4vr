
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Receipt, DollarSign, Calculator, Save, CreditCard } from "lucide-react";
import BillItem, { User } from "./BillItem";
import UserProfile from "./UserProfile";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedUsers: User[];
  paidBy?: User;
}

const BillCreator: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("Dinner");
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<BillItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [newUserName, setNewUserName] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [payments, setPayments] = useState<{from: User, to: User, amount: number}[]>([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  
  // Currency handling
  const { 
    currencies, 
    selectedCurrency, 
    setSelectedCurrency, 
    formatAmount, 
    getCurrentCurrency 
  } = useCurrency();

  // Initialize with the current user if logged in
  useEffect(() => {
    if (user) {
      const currentUser: User = {
        id: user.id,
        name: user.email?.split('@')[0] || "You"
      };
      
      // Only add current user if not already in the list
      if (!users.some(u => u.id === user.id)) {
        setUsers([currentUser]);
      }
    } else {
      // If not logged in, add a default "You" user
      if (users.length === 0) {
        setUsers([{ id: uuidv4(), name: "You" }]);
      }
    }
  }, [user]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItemName || !newItemPrice) {
      toast.error("Please enter a name and price for the item");
      return;
    }

    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const quantity = parseInt(newItemQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const newItem: BillItem = {
      id: uuidv4(),
      name: newItemName,
      price,
      quantity,
      assignedUsers: [],
    };

    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemPrice("");
    setNewItemQuantity("1");
    
    toast.success("Item added to bill");
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserName) {
      toast.error("Please enter a name for the user");
      return;
    }

    if (users.some(user => user.name.toLowerCase() === newUserName.toLowerCase())) {
      toast.error("A user with this name already exists");
      return;
    }

    const newUser: User = {
      id: uuidv4(),
      name: newUserName,
    };

    setUsers([...users, newUser]);
    setNewUserName("");
    setIsAddingUser(false);
    
    toast.success("User added to bill");
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (
    id: string,
    data: { name?: string; price?: number; quantity?: number }
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, ...data } : item
      )
    );
  };

  const handleUserToggle = (itemId: string, userId: string) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const userExists = item.assignedUsers.some((user) => user.id === userId);
          
          if (userExists) {
            // Remove user from item
            return {
              ...item,
              assignedUsers: item.assignedUsers.filter((user) => user.id !== userId),
            };
          } else {
            // Add user to item
            const userToAdd = users.find((user) => user.id === userId);
            if (userToAdd) {
              return {
                ...item,
                assignedUsers: [...item.assignedUsers, userToAdd],
              };
            }
          }
        }
        return item;
      })
    );
  };

  const handleSetPaidBy = (itemId: string, userId: string | null) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          if (!userId) {
            // Remove paidBy
            const { paidBy, ...rest } = item;
            return rest;
          } else {
            // Set paidBy
            const userToSet = users.find((user) => user.id === userId);
            if (userToSet) {
              return {
                ...item,
                paidBy: userToSet,
              };
            }
          }
        }
        return item;
      })
    );
  };

  const calculateBill = () => {
    setIsCalculating(true);
    
    // Calculate what each person owes
    const userBalances: Record<string, number> = {};
    
    // Initialize balances
    users.forEach(user => {
      userBalances[user.id] = 0;
    });
    
    // Calculate what each person owes and who paid
    items.forEach(item => {
      const totalItemCost = item.price * item.quantity;
      
      // If someone paid for this item, credit them
      if (item.paidBy) {
        userBalances[item.paidBy.id] += totalItemCost;
      }
      
      // Debit the assigned users or everyone if none assigned
      if (item.assignedUsers.length === 0) {
        // If no users assigned, split among all users
        const costPerPerson = totalItemCost / users.length;
        users.forEach(user => {
          userBalances[user.id] -= costPerPerson;
        });
      } else {
        // Split among assigned users
        const costPerPerson = totalItemCost / item.assignedUsers.length;
        item.assignedUsers.forEach(user => {
          userBalances[user.id] -= costPerPerson;
        });
      }
    });
    
    // Calculate payments
    const sortedBalances = Object.entries(userBalances)
      .map(([userId, balance]) => ({
        user: users.find(u => u.id === userId)!,
        balance
      }))
      .sort((a, b) => a.balance - b.balance);
    
    const payments: {from: User, to: User, amount: number}[] = [];
    
    let i = 0; // users who owe money (negative balance)
    let j = sortedBalances.length - 1; // users who are owed money (positive balance)
    
    while (i < j) {
      const debtor = sortedBalances[i];
      const creditor = sortedBalances[j];
      
      // Handle tiny floating point errors
      if (Math.abs(debtor.balance) < 0.01 || Math.abs(creditor.balance) < 0.01) {
        if (Math.abs(debtor.balance) < 0.01) i++;
        if (Math.abs(creditor.balance) < 0.01) j--;
        continue;
      }
      
      const paymentAmount = Math.min(Math.abs(debtor.balance), Math.abs(creditor.balance));
      
      payments.push({
        from: debtor.user,
        to: creditor.user,
        amount: parseFloat(paymentAmount.toFixed(2))
      });
      
      // Update balances
      debtor.balance += paymentAmount;
      creditor.balance -= paymentAmount;
      
      // Move indices if balances are close to zero
      if (Math.abs(debtor.balance) < 0.01) i++;
      if (Math.abs(creditor.balance) < 0.01) j--;
    }
    
    setPayments(payments);
  };

  const handleSaveBill = async () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item to the bill");
      return;
    }

    setIsSaving(true);

    try {
      // Create the bill
      const { data: billData, error: billError } = await supabase
        .from('bills')
        .insert({
          title,
          created_by: user.id,
          total_amount: totalAmount,
          currency: selectedCurrency
        })
        .select()
        .single();

      if (billError) throw billError;

      const billId = billData.id;

      // Add participants
      const participantsPromises = users.map(async (u) => {
        const { data, error } = await supabase
          .from('bill_participants')
          .insert({
            bill_id: billId,
            user_id: u.id === user.id ? user.id : user.id, // Only the current user is a registered user
            name: u.name,
            is_registered: u.id === user.id
          })
          .select()
          .single();

        if (error) throw error;
        return { ...u, participant_id: data.id };
      });

      const participants = await Promise.all(participantsPromises);

      // Add items and their assignments
      for (const item of items) {
        // Insert bill item
        const { data: itemData, error: itemError } = await supabase
          .from('bill_items')
          .insert({
            bill_id: billId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            paid_by: item.paidBy ? participants.find(p => p.id === item.paidBy!.id)?.participant_id : null
          })
          .select()
          .single();

        if (itemError) throw itemError;

        // Insert item assignments
        if (item.assignedUsers.length > 0) {
          const assignments = item.assignedUsers.map(assignedUser => {
            const participant = participants.find(p => p.id === assignedUser.id);
            return {
              bill_item_id: itemData.id,
              participant_id: participant!.participant_id
            };
          });

          const { error: assignError } = await supabase
            .from('item_assignments')
            .insert(assignments);

          if (assignError) throw assignError;
        }
      }

      // Add payments if they exist
      if (payments.length > 0) {
        const paymentsToInsert = payments.map(payment => {
          const fromParticipant = participants.find(p => p.id === payment.from.id);
          const toParticipant = participants.find(p => p.id === payment.to.id);
          
          return {
            bill_id: billId,
            from_user_id: fromParticipant!.participant_id,
            to_user_id: toParticipant!.participant_id,
            amount: payment.amount,
            currency: selectedCurrency,
            status: 'pending'
          };
        });

        const { error: paymentsError } = await supabase
          .from('payments')
          .insert(paymentsToInsert);

        if (paymentsError) throw paymentsError;
      }

      toast.success("Bill saved successfully!");
      
      // Reset the form after successful save
      setItems([]);
      setPayments([]);
      setIsCalculating(false);
      
    } catch (error: any) {
      console.error("Error saving bill:", error);
      toast.error("Failed to save bill: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="glass-card p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Bill Details</h2>
            </div>
            <div className="text-xl font-bold">{formatAmount(totalAmount)}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bill-title" className="text-sm text-muted-foreground">
                Bill Name
              </label>
              <input
                id="bill-title"
                type="text"
                className="input-field w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a name for this bill"
              />
            </div>
            <div>
              <label htmlFor="currency" className="text-sm text-muted-foreground">
                Currency
              </label>
              <Select 
                value={selectedCurrency} 
                onValueChange={setSelectedCurrency}
              >
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">People</h2>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingUser(!isAddingUser)}
            >
              <PlusCircle className="w-4 h-4 mr-1" /> Add Person
            </Button>
          </div>

          <AnimatePresence>
            {isAddingUser && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleAddUser}
                className="mb-4 overflow-hidden"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="input-field flex-1"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Enter person's name"
                    autoFocus
                  />
                  <Button type="submit">Add</Button>
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={() => setIsAddingUser(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto -mx-6 px-6">
            <div className="flex space-x-3 pb-2">
              {users.map((user) => (
                <UserProfile
                  key={user.id}
                  id={user.id}
                  name={user.name}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Items</h2>
            </div>
          </div>

          <form onSubmit={handleAddItem} className="mb-4">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <input
                  type="text"
                  className="input-field w-full"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Item name"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field w-full"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="Price"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="1"
                  className="input-field w-full"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  placeholder="Qty"
                />
              </div>
              <div className="col-span-2">
                <Button type="submit" className="w-full">
                  Add
                </Button>
              </div>
            </div>
          </form>

          <AnimatePresence>
            {items.map((item) => (
              <BillItem
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                quantity={item.quantity}
                assignedUsers={item.assignedUsers}
                paidBy={item.paidBy}
                allUsers={users}
                onUserToggle={handleUserToggle}
                onDelete={handleDeleteItem}
                onUpdate={handleUpdateItem}
                onSetPaidBy={handleSetPaidBy}
                currencySymbol={getCurrentCurrency().symbol}
              />
            ))}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No items yet. Add your first item above.</p>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-6 flex justify-center space-x-3">
        <Button 
          size="lg" 
          className="shadow-lg"
          disabled={items.length === 0}
          onClick={calculateBill}
        >
          <Calculator className="w-5 h-5 mr-2" />
          Calculate Split
        </Button>

        <Button 
          size="lg" 
          variant="outline"
          className="shadow-lg"
          disabled={items.length === 0}
          onClick={handleSaveBill}
        >
          <Save className="w-5 h-5 mr-2" />
          Save Bill
        </Button>
      </div>

      <AnimatePresence>
        {isCalculating && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsCalculating(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <p className="text-muted-foreground">
                  Total: {formatAmount(totalAmount)}
                </p>
              </div>

              {payments.length > 0 ? (
                <div className="space-y-3 mb-6">
                  <h3 className="font-semibold text-center">Payment Summary</h3>
                  {payments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                          {payment.from.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{payment.from.name}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="mr-2">pays</span>
                        <span className="font-semibold">{formatAmount(payment.amount)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">to</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-1">
                          {payment.to.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{payment.to.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center mb-6 text-muted-foreground">
                  <p>Everyone owes the same amount!</p>
                </div>
              )}

              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCalculating(false)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth prompt dialog */}
      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to save your bill</DialogTitle>
            <DialogDescription>
              You need to be signed in to save bills and access them later.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowAuthPrompt(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowAuthPrompt(false);
              navigate("/auth");
            }}>
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillCreator;
