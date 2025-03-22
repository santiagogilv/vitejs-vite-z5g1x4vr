
import React from "react";
import { Divide } from "lucide-react";
import { motion } from "framer-motion";
import UserProfile, { UserProfileProps } from "./UserProfile";
import { Button } from "@/components/ui/button";

interface ItemSplitterProps {
  users: Omit<UserProfileProps, "onClick">[];
  selectedUsers: string[];
  itemPrice: number;
  onUserSelect: (userId: string) => void;
  onSplit: () => void;
  onCancel: () => void;
}

const ItemSplitter: React.FC<ItemSplitterProps> = ({
  users,
  selectedUsers,
  itemPrice,
  onUserSelect,
  onSplit,
  onCancel,
}) => {
  const pricePerPerson = selectedUsers.length > 0
    ? itemPrice / selectedUsers.length
    : itemPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 glass-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Divide className="w-4 h-4 mr-2 text-primary" />
          <h3 className="font-medium">Split Item</h3>
        </div>
        <div className="text-sm">
          <span className="font-semibold">${itemPrice.toFixed(2)}</span>
          {selectedUsers.length > 0 && (
            <span className="text-muted-foreground ml-1">
              (${pricePerPerson.toFixed(2)} each)
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">
          Select who should split this item:
        </p>
        <div className="flex flex-wrap gap-2">
          {users.map((user) => (
            <UserProfile
              key={user.id}
              {...user}
              isSelected={selectedUsers.includes(user.id)}
              onClick={() => onUserSelect(user.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSplit}
          disabled={selectedUsers.length === 0}
        >
          Split
        </Button>
      </div>
    </motion.div>
  );
};

export default ItemSplitter;
