
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlusCircle, Receipt, ArrowRight } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const Index = () => {
  return (
    <AppLayout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.div
            whileHover={{ rotate: 5 }}
            className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6"
          >
            <Receipt className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            DineShare
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Split restaurant bills with friends, effortlessly and fairly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass-card p-6 mb-8 max-w-md w-full"
        >
          <div className="space-y-5">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 mt-0.5">
                <span className="text-sm font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Create a bill</h3>
                <p className="text-sm text-muted-foreground">
                  Enter items from your receipt, with prices and quantities
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 mt-0.5">
                <span className="text-sm font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Add people</h3>
                <p className="text-sm text-muted-foreground">
                  Create profiles for everyone in your group
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 mt-0.5">
                <span className="text-sm font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Assign items</h3>
                <p className="text-sm text-muted-foreground">
                  Choose who ordered what, and split shared items
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 mt-0.5">
                <span className="text-sm font-semibold">4</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Calculate</h3>
                <p className="text-sm text-muted-foreground">
                  Get a fair split with minimal transactions between friends
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button size="lg" asChild>
            <Link to="/new-bill" className="group">
              <PlusCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Create New Bill
              <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Index;
