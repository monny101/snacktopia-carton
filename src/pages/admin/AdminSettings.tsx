
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, RefreshCw } from 'lucide-react';

interface StoreSettings {
  store_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
}

const AdminSettings: React.FC = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'Mondo Carton King',
    contact_email: 'mondo@cartonking.com',
    contact_phone: '+234803 580 2867',
    address: 'no 50 okedigo street odotu, near Eki FM ondo city, ondo state'
  });
  
  // For testing purposes we'll just use state, but in a real app
  // this would save to a settings table in the database
  
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Settings Saved',
        description: 'Your store settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Store Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Basic settings for your store</CardDescription>
          </CardHeader>
          <CardContent>
            <form 
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="store_name">Store Name</Label>
                <Input 
                  id="store_name" 
                  value={settings.store_name}
                  onChange={(e) => setSettings({...settings, store_name: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input 
                  id="contact_email" 
                  type="email" 
                  value={settings.contact_email}
                  onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input 
                  id="contact_phone" 
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({...settings, contact_phone: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address">Store Address</Label>
                <textarea 
                  id="address" 
                  className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> Save Settings</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Database Management</CardTitle>
            <CardDescription>Advanced database operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">
                Run a full database refresh to update cached data and indexes.
                This operation may take a few moments.
              </p>
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Database
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
