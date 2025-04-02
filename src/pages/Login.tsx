import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle, Info, Home } from "lucide-react";
import { setupAdmin } from "@/utils/setupAdmin";
import { toast } from "@/hooks/use-toast";

const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.redirectTo || "/";
  console.log("Login page loaded, redirect path:", redirectTo);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      console.log("Logging in with:", email);
      const { error: loginError } = await login(email, password);

      if (loginError) {
        console.error("Login error:", loginError);
        if (loginError.message === "Invalid login credentials") {
          setError(
            "Invalid email or password. Ensure test users are set up and email confirmation is disabled in Supabase dashboard.",
          );
        } else if (loginError.message.includes("Email not confirmed")) {
          setError(
            "Email not confirmed. Please check your email for a confirmation link or disable email confirmation in Supabase dashboard.",
          );
        } else {
          setError(loginError.message || "Invalid email or password");
        }
        return;
      }

      // Add a small delay to ensure profile is loaded
      setTimeout(() => {
        console.log("Login successful, redirecting to:", redirectTo);
        navigate(redirectTo);
      }, 500);
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleSetupTestUsers = async () => {
    setSetupLoading(true);
    setError(null);

    try {
      console.log("Setting up test users...");
      const success = await setupAdmin();
      if (success) {
        setSetupSuccess(true);
        // Set the admin credentials for quick login
        setEmail("admin@mondocartonking.com");
        setPassword("password123");

        toast({
          title: "Test users created",
          description:
            "Admin and staff test users have been set up. Admin credentials are now filled in the form.",
          duration: 5000,
        });
      } else {
        toast({
          title: "Warning",
          description:
            "There was an issue creating test users. They might already exist, or there might be an error.",
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Welcome Back</h1>
          <p className="text-gray-600 mt-2">
            Log in to your Mondo Carton King account
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
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
                "Log in"
              )}
            </Button>
          </form>

          <div className="mt-6 p-3 bg-yellow-50 rounded-md">
            <p className="text-sm text-gray-700 mb-2 font-medium">
              First-time Setup
            </p>
            <p className="text-xs text-gray-600 mb-2">
              Before using test logins, create test users. Note: Disable email
              confirmation in Supabase dashboard.
            </p>
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
                "Create Test Users"
              )}
            </Button>
            {setupSuccess && (
              <div className="text-xs p-2 bg-blue-50 text-blue-700 rounded flex items-start mt-2">
                <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>
                  Users created! Go to Supabase dashboard and disable email
                  confirmation in Authentication &gt; Email settings to login
                  immediately.
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700 mb-2 font-medium">
              Quick Login (For Testing)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail("admin@mondocartonking.com");
                  setPassword("password123");
                }}
              >
                Admin Login
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail("staff@mondocartonking.com");
                  setPassword("password123");
                }}
              >
                Staff Login
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center space-y-4">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Create one
              </Link>
            </p>
            <p>
              <Link
                to="/"
                className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center"
              >
                <Home className="h-3 w-3 mr-1" />
                Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
