
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { User, History, Settings } from "lucide-react";
import { motion } from "framer-motion";

const Profile = () => {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="page-header">Profile</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <motion.div 
          className="glass-card p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">You</h2>
              <p className="text-muted-foreground">Your profile</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="flex items-center mb-4">
            <History className="w-5 h-5 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          
          <div className="py-8 text-center text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>You don't have any recent activity</p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/new-bill">Create your first bill</a>
            </Button>
          </div>
        </motion.div>

        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="flex items-center mb-4">
            <Settings className="w-5 h-5 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
              <div>
                <h3 className="font-medium">Appearance</h3>
                <p className="text-sm text-muted-foreground">Change theme preferences</p>
              </div>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
              <div>
                <h3 className="font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">Configure notification settings</p>
              </div>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
              <div>
                <h3 className="font-medium">Privacy</h3>
                <p className="text-sm text-muted-foreground">Manage your privacy settings</p>
              </div>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Profile;
