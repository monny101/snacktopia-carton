
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InventoryAlert {
  id: string;
  product_id: string;
  threshold: number;
  alert_message: string | null;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  product_name?: string;
  current_quantity?: number;
}

interface InventoryAlertsProps {
  onlyShowActive?: boolean;
}

const InventoryAlerts: React.FC<InventoryAlertsProps> = ({ onlyShowActive = false }) => {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [products, setProducts] = useState<{ id: string, name: string, quantity: number }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(10);
  const [alertMessage, setAlertMessage] = useState<string>('');
  
  useEffect(() => {
    fetchAlerts();
    fetchProducts();
  }, [onlyShowActive]);
  
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('inventory_alerts')
        .select(`
          id,
          product_id,
          threshold,
          alert_message,
          is_active,
          created_at,
          created_by
        `)
        .eq(onlyShowActive ? 'is_active' : 'id', onlyShowActive ? true : 'id')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Fetch product details for each alert
      const alertsWithProducts = await Promise.all(
        (data || []).map(async (alert) => {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('name, quantity')
            .eq('id', alert.product_id)
            .single();
          
          if (productError || !productData) {
            return {
              ...alert,
              product_name: 'Unknown Product',
              current_quantity: 0,
            };
          }
          
          return {
            ...alert,
            product_name: productData.name,
            current_quantity: productData.quantity,
          };
        })
      );
      
      setAlerts(alertsWithProducts);
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory alerts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, quantity')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  
  const handleAddAlert = async () => {
    if (!selectedProductId || threshold <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select a product and set a valid threshold',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { data, error } = await supabase.rpc(
        'create_inventory_alert',
        {
          product_id: selectedProductId,
          threshold,
          alert_message: alertMessage || null,
        }
      );
      
      if (error) {
        throw error;
      }
      
      // Refetch alerts
      await fetchAlerts();
      
      setIsAddDialogOpen(false);
      setSelectedProductId('');
      setThreshold(10);
      setAlertMessage('');
      
      toast({
        title: 'Success',
        description: 'Inventory alert created successfully',
      });
    } catch (error) {
      console.error('Error creating inventory alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to create inventory alert',
        variant: 'destructive',
      });
    }
  };
  
  const toggleAlertStatus = async (alertId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('inventory_alerts')
        .update({ is_active: !currentStatus })
        .eq('id', alertId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setAlerts(alerts.map(alert => {
        if (alert.id === alertId) {
          return { ...alert, is_active: !currentStatus };
        }
        return alert;
      }));
      
      toast({
        title: 'Success',
        description: `Alert ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling alert status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update alert status',
        variant: 'destructive',
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  const lowStockProducts = alerts.filter(alert => 
    alert.current_quantity !== undefined && 
    alert.threshold !== undefined && 
    alert.current_quantity <= alert.threshold
  );
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Inventory Alerts</h2>
          {lowStockProducts.length > 0 && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {lowStockProducts.length} products are below threshold
            </p>
          )}
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>New Alert</Button>
      </div>
      
      {alerts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No inventory alerts found</p>
            {!onlyShowActive && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Create your first alert
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map(alert => {
            const isLowStock = alert.current_quantity !== undefined && 
                              alert.threshold !== undefined && 
                              alert.current_quantity <= alert.threshold;
            
            return (
              <Card 
                key={alert.id} 
                className={`${
                  isLowStock ? 'border-red-200 bg-red-50' : 
                  !alert.is_active ? 'border-gray-200 bg-gray-50 opacity-70' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="text-base">{alert.product_name}</CardTitle>
                      <CardDescription>
                        Threshold: {alert.threshold} units
                      </CardDescription>
                    </div>
                    {isLowStock && (
                      <div className="text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`text-sm font-medium ${isLowStock ? 'text-red-600' : ''}`}>
                        Current stock: {alert.current_quantity} units
                      </p>
                      {alert.alert_message && (
                        <p className="text-sm text-gray-600 mt-1">{alert.alert_message}</p>
                      )}
                    </div>
                    <Button
                      variant={alert.is_active ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={() => toggleAlertStatus(alert.id, alert.is_active)}
                    >
                      {alert.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Inventory Alert</DialogTitle>
            <DialogDescription>
              Set up alerts for when product inventory falls below a threshold.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product">Product</Label>
              <select
                id="product"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Current: {product.quantity})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="threshold">Threshold</Label>
              <Input
                id="threshold"
                type="number"
                min="1"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Alert Message (Optional)</Label>
              <Input
                id="message"
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="e.g. Order from supplier X"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddAlert}>Create Alert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryAlerts;
