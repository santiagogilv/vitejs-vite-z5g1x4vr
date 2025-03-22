
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronRight, ChevronDown, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserProfile from "./UserProfile";

export interface User {
  id: string;
  name: string;
}

export interface BillItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedUsers: User[];
  allUsers: User[];
  onUserToggle: (itemId: string, userId: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { name?: string; price?: number; quantity?: number }) => void;
}

const BillItem: React.FC<BillItemProps> = ({
  id,
  name,
  price,
  quantity,
  assignedUsers,
  allUsers,
  onUserToggle,
  onDelete,
  onUpdate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [itemName, setItemName] = useState(name);
  const [itemPrice, setItemPrice] = useState(price.toString());
  const [itemQuantity, setItemQuantity] = useState(quantity.toString());

  const totalPrice = price * quantity;
  const pricePerPerson = assignedUsers.length > 0 
    ? totalPrice / assignedUsers.length 
    : totalPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(id, {
      name: itemName,
      price: parseFloat(itemPrice),
      quantity: parseInt(itemQuantity),
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      className="glass-card p-4 mb-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`item-name-${id}`} className="text-xs text-muted-foreground">
                Item Name
              </label>
              <input
                id={`item-name-${id}`}
                type="text"
                className="input-field w-full"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label htmlFor={`item-price-${id}`} className="text-xs text-muted-foreground">
                Price
              </label>
              <input
                id={`item-price-${id}`}
                type="number"
                step="0.01"
                min="0"
                className="input-field w-full"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`item-quantity-${id}`} className="text-xs text-muted-foreground">
                Quantity
              </label>
              <input
                id={`item-quantity-${id}`}
                type="number"
                min="1"
                className="input-field w-full"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
              />
            </div>
            <div className="flex items-end space-x-2">
              <Button type="submit" size="sm" className="flex-1">
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="font-medium truncate">{name}</h3>
                <div className="ml-2 px-2 py-0.5 bg-secondary rounded-full text-xs">
                  {quantity > 1 ? `${quantity}x` : ""}
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                ${price.toFixed(2)} {quantity > 1 ? `each` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${totalPrice.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-end">
                <Users className="w-3 h-3 mr-1" />
                {assignedUsers.length || "Not assigned"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-xs h-7 px-2"
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(id)}
                className="text-xs text-destructive h-7 px-2"
              >
                <Trash2 className="w-3 h-3 mr-1" /> Remove
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7"
            >
              {isExpanded ? (
                <>
                  Less <ChevronDown className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Assign <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 pt-3 border-t border-border"
              >
                {assignedUsers.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground mb-1">
                      ${pricePerPerson.toFixed(2)} per person
                    </p>
                  </div>
                )}
                <div className="overflow-x-auto -mx-4 px-4">
                  <div className="flex space-x-2 pb-2">
                    {allUsers.map((user) => {
                      const isAssigned = assignedUsers.some(
                        (assignedUser) => assignedUser.id === user.id
                      );
                      return (
                        <UserProfile
                          key={user.id}
                          id={user.id}
                          name={user.name}
                          isSelected={isAssigned}
                          onClick={() => onUserToggle(id, user.id)}
                        />
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

export default BillItem;
