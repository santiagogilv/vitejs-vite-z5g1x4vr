
import React from "react";
import { User } from "lucide-react";
import { motion } from "framer-motion";

export interface UserProfileProps {
  id: string;
  name: string;
  color?: string;
  amount?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const getRandomColor = (seed: string) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-orange-500",
  ];
  
  // Use the seed to deterministically select a color
  const index = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

const UserProfile: React.FC<UserProfileProps> = ({
  id,
  name,
  color,
  amount,
  isSelected = false,
  onClick,
}) => {
  const avatarColor = color || getRandomColor(id);
  const initials = getInitials(name);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center py-3 px-4 rounded-xl cursor-pointer transition-all
                ${isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/50"}`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${avatarColor}`}
      >
        {initials || <User className="w-6 h-6" />}
      </div>
      <span className="mt-2 text-sm font-medium truncate max-w-[80px]">{name}</span>
      {amount !== undefined && (
        <span className={`mt-1 text-xs font-semibold ${amount > 0 ? "text-success" : amount < 0 ? "text-destructive" : "text-muted-foreground"}`}>
          {amount > 0 ? `+$${amount.toFixed(2)}` : amount < 0 ? `-$${Math.abs(amount).toFixed(2)}` : "$0.00"}
        </span>
      )}
    </motion.div>
  );
};

export default UserProfile;
