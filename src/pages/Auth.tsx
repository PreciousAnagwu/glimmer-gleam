import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, Mail, Lock, User, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { z } from 'zod';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; confirmPassword?: string }>({});

  const { login, signup, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/account';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    if (mode !== 'forgot-password') {
      try {
        passwordSchema.parse(password);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.password = e.errors[0].message;
        }
      }
    }

    if (mode === 'signup') {
      try {
        nameSchema.parse(name);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.name = e.errors[0].message;
        }
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let result;

      switch (mode) {
        case 'login':
          result = await login(email, password);
          if (result.success) {
            toast({
              title: 'Welcome back!',
              description: 'You have successfully logged in.',
            });
            navigate(from, { replace: true });
          } else {
            toast({
              title: 'Login failed',
              description: result.error,
              variant: 'destructive',
            });
          }
          break;

        case 'signup':
          result = await signup(email, password, name);
          if (result.success) {
            toast({
              title: 'Account created!',
              description: 'Please check your email to verify your account.',
            });
            navigate(from, { replace: true });
          } else {
            toast({
              title: 'Signup failed',
              description: result.error,
              variant: 'destructive',
            });
          }
          break;

        case 'forgot-password':
          result = await resetPassword(email);
          if (result.success) {
            toast({
              title: 'Reset email sent',
              description: 'Check your email for password reset instructions.',
            });
            setMode('login');
          } else {
            toast({
              title: 'Failed to send reset email',
              description: result.error,
              variant: 'destructive',
            });
          }
          break;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setErrors({});
  };

  const switchMode = (newMode: AuthMode) => {
    clearForm();
    setMode(newMode);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNEQkE1NkYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="font-display text-3xl font-bold text-foreground">LUMIÈRE</span>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl xl:text-5xl font-bold text-foreground mb-6 leading-tight">
              Discover Timeless
              <br />
              <span className="text-primary">Elegance</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md">
              Join our exclusive community and unlock access to curated collections, 
              member-only offers, and personalized jewelry recommendations.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-3 gap-6">
            {['Premium Quality', 'Secure Shopping', 'Exclusive Access'].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{feature}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-2xl font-bold text-foreground">LUMIÈRE</span>
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                {mode === 'forgot-password' && (
                  <button
                    onClick={() => switchMode('login')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 mx-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </button>
                )}
                
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {mode === 'login' && 'Welcome Back'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot-password' && 'Reset Password'}
                </h2>
                <p className="text-muted-foreground">
                  {mode === 'login' && 'Enter your credentials to access your account'}
                  {mode === 'signup' && 'Join us and start your luxury journey'}
                  {mode === 'forgot-password' && "We'll send you a reset link"}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {mode !== 'forgot-password' && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot-password')}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    <>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'forgot-password' && 'Send Reset Link'}
                    </>
                  )}
                </Button>
              </form>

              {/* Switch Mode */}
              {mode !== 'forgot-password' && (
                <p className="text-center mt-6 text-muted-foreground">
                  {mode === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        onClick={() => switchMode('signup')}
                        className="text-primary font-medium hover:underline"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        onClick={() => switchMode('login')}
                        className="text-primary font-medium hover:underline"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              )}

              {/* Terms */}
              {mode === 'signup' && (
                <p className="text-center text-xs text-muted-foreground mt-6">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;
