
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Receipt, DollarSign, Calculator } from "lucide-react";
import BillItem, { User } from "./BillItem";
import UserProfile from "./UserProfile";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedUsers: User[];
}

const BillCreator: React.FC = () => {
  const [title, setTitle] = useState("Dinner");
  const [users, setUsers] = useState<User[]>([
    { id: uuidv4(), name: "You" }
  ]);
  const [items, setItems] = useState<BillItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [newUserName, setNewUserName] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [payments, setPayments] = useState<{from: User, to: User, amount: number}[]>([]);

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

  const calculateBill = () => {
    setIsCalculating(true);
    
    // Calculate what each person owes
    const userBalances: Record<string, number> = {};
    
    // Initialize balances
    users.forEach(user => {
      userBalances[user.id] = 0;
    });
    
    // Calculate what each person owes
    items.forEach(item => {
      const totalItemCost = item.price * item.quantity;
      
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
            <div className="text-xl font-bold">${totalAmount.toFixed(2)}</div>
          </div>
          
          <div className="mb-4">
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
                allUsers={users}
                onUserToggle={handleUserToggle}
                onDelete={handleDeleteItem}
                onUpdate={handleUpdateItem}
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

      <div className="sticky bottom-6 flex justify-center">
        <Button 
          size="lg" 
          className="shadow-lg"
          disabled={items.length === 0}
          onClick={calculateBill}
        >
          <Calculator className="w-5 h-5 mr-2" />
          Calculate Split
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
                  Total: ${totalAmount.toFixed(2)}
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
                        <span className="font-semibold">${payment.amount.toFixed(2)}</span>
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
    </div>
  );
};

export default BillCreator;
