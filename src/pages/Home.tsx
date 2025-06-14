
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Heart, Calendar, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Home: React.FC = () => {
  const { user, login, signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [signupError, setSignupError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/entries');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let success = false;
    
    if (isLoginMode) {
      success = await login(formData.email, formData.password);
      if (success) {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive"
        });
      }
    } else {
      if (!formData.name.trim()) {
        toast({
          title: "Name required",
          description: "Please enter your name to create an account.",
          variant: "destructive"
        });
        return;
      }
      
      setSignupError(''); // Clear previous errors
      const res = await signup(formData.email, formData.password, formData.name);
      
      if (res.error) {
        // Show specific error message from the signup function
        setSignupError(res.error);
        toast({
          title: "Signup failed",
          description: res.error,
          variant: "destructive",
        });
      } else if (res.ok && res.needsEmailConfirm) {
        toast({
          title: "Almost there!",
          description: "We sent you a link – confirm your email, then sign in.",
        });
        navigate('/confirm-email');
      } else if (res.ok) {
        toast({
          title: "Account created!",
          description: "Welcome to your personal journal.",
        });
      } else {
        // Fallback error
        setSignupError('There was an error creating your account.');
        toast({
          title: "Signup failed",
          description: "There was an error creating your account.",
          variant: "destructive",
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-orange-100 rounded-full">
              <Book className="h-12 w-12 text-orange-500" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Your Personal Journal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Capture your thoughts, memories, and experiences in a beautiful, secure digital journal.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Features Section */}
          <div className="space-y-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">
              Why keep a journal?
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Heart className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Express Yourself</h3>
                  <p className="text-gray-600">Write freely about your thoughts, feelings, and daily experiences.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Track Your Journey</h3>
                  <p className="text-gray-600">Look back on your growth and see how far you've come.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Edit className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Improve Writing</h3>
                  <p className="text-gray-600">Develop your writing skills through regular practice.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <div className="max-w-md mx-auto w-full">
            <Card className="shadow-lg border-orange-100">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {isLoginMode ? 'Welcome Back' : 'Start Your Journey'}
                </CardTitle>
                <CardDescription>
                  {isLoginMode 
                    ? 'Sign in to access your journal' 
                    : 'Create your account to begin writing'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-4">
                    {!isLoginMode && (
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
                      />
                      {!isLoginMode && signupError && (
                        <p className="text-sm text-red-500 mt-1">{signupError}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                      />
                      {isLoginMode && (
                        <div className="text-right text-sm">
                          <button
                            type="button"
                            onClick={() => navigate('/forgot-password')}
                            className="text-orange-600 hover:underline"
                            disabled={isLoading}
                          >
                            Forgot password?
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={isLoading}
                  >
                    {isLoading 
                      ? (isLoginMode ? 'Signing in...' : 'Creating account...') 
                      : (isLoginMode ? 'Sign In' : 'Create Account')
                    }
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    className="text-orange-500 hover:text-orange-600 text-sm underline"
                  >
                    {isLoginMode 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
