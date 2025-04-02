
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle, Info, Mail, Lock } from 'lucide-react';
import { setupAdmin } from '@/utils/setupAdmin';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.redirectTo || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupSuccess, setSetupSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && !isLoading) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      console.log("Logging in with:", email);
      const { error: loginError } = await login(email, password);
      
      if (loginError) {
        console.error("Login error:", loginError);
        if (loginError.message === 'Invalid login credentials') {
          setError('Invalid email or password. Make sure email confirmation is disabled in Supabase dashboard or the account has been confirmed.');
        } else {
          setError(loginError.message || 'Invalid email or password');
        }
        return;
      }
      
      console.log("Login successful, redirecting to:", redirectTo);
      navigate(redirectTo);
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupTestUsers = async () => {
    setSetupLoading(true);
    setError(null);
    
    try {
      const success = await setupAdmin();
      if (success) {
        setSetupSuccess(true);
        toast({
          title: "Test users created",
          description: "Admin and staff test users have been set up. Please disable email confirmation in Supabase dashboard to login immediately.",
          duration: 5000,
        });
      } else {
        toast({
          title: "Warning",
          description: "There was an issue creating test users. They might already exist, or there might be an error.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error setting up test users:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Check console for details.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setSetupLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-blue-500" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card className="w-full shadow-lg border-blue-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-blue-600">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Log in to your Mondo Carton King account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log in'
              )}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-md border border-yellow-100">
            <h3 className="text-sm text-gray-700 mb-2 font-medium">First-time Setup</h3>
            <p className="text-xs text-gray-600 mb-2">Before using test logins, create test users and disable email confirmation in Supabase.</p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className="w-full mb-2"
              onClick={handleSetupTestUsers}
              disabled={setupLoading}
            >
              {setupLoading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Setting up users...
                </>
              ) : (
                'Create Test Users'
              )}
            </Button>
            {setupSuccess && (
              <Alert variant="info" className="mt-2 py-2 bg-blue-50 border-blue-100">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Users created! Go to Supabase dashboard and disable email confirmation 
                  in Authentication &gt; Email settings to login immediately.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
            <h3 className="text-sm text-gray-700 mb-2 font-medium">Quick Login (For Testing)</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEmail('admin@mondocartonking.com');
                  setPassword('password123');
                }}
              >
                Admin Login
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEmail('staff@mondocartonking.com');
                  setPassword('password123');
                }}
              >
                Staff Login
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
