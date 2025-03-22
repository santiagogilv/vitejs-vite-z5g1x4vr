
// This is an update for Navbar.tsx to add authentication-related links
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { PlusCircle, Receipt, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  isMobile: boolean;
  isExpanded: boolean;
  toggleNav: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isMobile, isExpanded, toggleNav }) => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const NavLink = ({
    to,
    children,
    icon,
  }: {
    to: string;
    children: React.ReactNode;
    icon: React.ReactNode;
  }) => {
    const isActive = pathname === to;
    return (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-3 py-2 px-3 rounded-md transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        )}
        onClick={() => isMobile && isExpanded && toggleNav()}
      >
        {icon}
        <span className={cn(isMobile ? "block" : isExpanded ? "block" : "hidden")}>
          {children}
        </span>
      </Link>
    );
  };

  return (
    <div className="h-full flex flex-col justify-between p-3">
      <div className="space-y-2">
        <NavLink to="/" icon={<Receipt className="w-5 h-5" />}>
          Home
        </NavLink>
        
        <NavLink to="/new-bill" icon={<PlusCircle className="w-5 h-5" />}>
          New Bill
        </NavLink>
        
        {user && (
          <NavLink to="/bills" icon={<Receipt className="w-5 h-5" />}>
            My Bills
          </NavLink>
        )}
      </div>

      <div className="space-y-2">
        {user ? (
          <NavLink to="/profile" icon={<User className="w-5 h-5" />}>
            Profile
          </NavLink>
        ) : (
          <Link 
            to="/auth" 
            className="w-full" 
            onClick={() => isMobile && isExpanded && toggleNav()}
          >
            <Button className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              <span className={cn(isMobile ? "block" : isExpanded ? "block" : "hidden")}>
                Sign In
              </span>
            </Button>
          </Link>
        )}
        
        <div className="flex items-center justify-center py-2">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
