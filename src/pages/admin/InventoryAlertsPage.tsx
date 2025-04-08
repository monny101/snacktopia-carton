
import React from 'react';
import InventoryAlerts from '@/components/admin/InventoryAlerts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Navigate } from 'react-router-dom';

const InventoryAlertsPage: React.FC = () => {
  const { isAdmin, isStaff } = useAuth();
  
  if (!isAdmin && !isStaff) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inventory Alerts</h1>
      
      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <InventoryAlerts onlyShowActive={true} />
        </TabsContent>
        <TabsContent value="all">
          <InventoryAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryAlertsPage;
