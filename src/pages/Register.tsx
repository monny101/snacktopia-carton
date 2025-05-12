
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2, Mail, Phone, Lock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorCard } from '@/components/ui/error-card';
import { toast } from '@/hooks/use-toast';

const Register: React.FC = () => {
  const { signup, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!fullName || !email || !password) {
      setError('Please fill all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      // Updated to use the correct number of arguments
      const { error: signupError } = await signup(email, password, fullName, phone);
      
      if (signupError) {
        console.error("Registration error:", signupError);
        setError(signupError.message || 'Error creating account');
        
        // Display more user-friendly messages for common errors
        if (signupError.message?.includes('already registered')) {
          setError('This email is already registered. Please log in instead.');
        } else if (signupError.message?.includes('User registration is disabled')) {
          setError('Registration is currently disabled. Please try again later or contact support.');
        }
        return;
      }
      
      console.log("Registration successful, redirecting...");
      toast({
        title: "Registration successful",
        description: "Your account has been created with admin privileges",
        duration: 3000,
      });
      navigate('/admin');
    } catch (err: any) {
      console.error("Unexpected registration error:", err);
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
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
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="relative overflow-hidden rounded-lg">
        {/* Background elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-200 rounded-full opacity-20 blur-3xl"></div>
        
        <Card className="shadow-lg border-blue-100 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-mondoBlue to-blue-700 bg-clip-text text-transparent">
              Create an Account
            </CardTitle>
            <CardDescription className="text-center">
              Join Mondo Carton King today
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <ErrorCard
                title="Registration Error"
                description={error}
                onDismiss={() => setError(null)}
                action={{
                  label: "Try Again",
                  onClick: () => setError(null)
                }}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="Your phone number (optional)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="Create a password (min 6 characters)"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-mondoBlue to-blue-700 hover:from-mondoBlue/90 hover:to-blue-800 h-11 font-medium transition-all shadow hover:shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
