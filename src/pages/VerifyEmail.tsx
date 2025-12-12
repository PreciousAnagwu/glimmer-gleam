import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail, Sparkles } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const { verifyEmail, user, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (token) {
        const result = await verifyEmail(token);
        setStatus(result.success ? 'success' : 'error');
      } else {
        setStatus('error');
      }
    };

    verify();
  }, [token, verifyEmail]);

  const handleResend = async () => {
    setIsResending(true);
    await resendVerification();
    setIsResending(false);
  };

  if (!token && user && !user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="mb-6">
            <Link to="/" className="flex items-center gap-2 justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-display text-2xl font-bold text-foreground">LUMIÈRE</span>
            </Link>
          </div>

          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
            <Mail className="h-10 w-10 text-amber-600" />
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Verify Your Email
          </h1>
          <p className="text-muted-foreground mb-6">
            We've sent a verification link to <strong>{user.email}</strong>. 
            Please check your inbox and click the link to verify your account.
          </p>

          <div className="space-y-3">
            <Button
              variant="gold"
              onClick={handleResend}
              disabled={isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>
            <Button variant="outline" onClick={() => navigate('/account')} className="w-full">
              Continue to Account
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-6">
          <Link to="/" className="flex items-center gap-2 justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-2xl font-bold text-foreground">LUMIÈRE</span>
          </Link>
        </div>

        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 mx-auto mb-6 text-primary animate-spin" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              Verifying Your Email
            </h1>
            <p className="text-muted-foreground">Please wait while we verify your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              Email Verified!
            </h1>
            <p className="text-muted-foreground mb-6">
              Your email has been verified successfully. You now have full access to your account.
            </p>
            <Button variant="gold" onClick={() => navigate('/account')} className="w-full">
              Go to My Account
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              Verification Failed
            </h1>
            <p className="text-muted-foreground mb-6">
              The verification link is invalid or has expired. Please request a new verification email.
            </p>
            <div className="space-y-3">
              <Button variant="gold" onClick={() => navigate('/auth')} className="w-full">
                Back to Login
              </Button>
              <Link to="/" className="block text-primary hover:underline">
                Return to Home
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
