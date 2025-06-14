import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import Navbar from '../components/Navbar';

// Helper to extract params from the URL hash produced by Supabase
// Works for both:
//   #access_token=...&refresh_token=...  (when using BrowserRouter)
//   #/reset-password#access_token=...&refresh_token=... (when using HashRouter)
function getHashParams() {
  const hash = window.location.hash;
  // If there are multiple '#' characters (HashRouter case) take the part AFTER the last one.
  const cleanFragment = hash.includes('#') ? hash.substring(hash.lastIndexOf('#') + 1) : hash.substring(1);
  return Object.fromEntries(new URLSearchParams(cleanFragment));
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'verifying' | 'set-password'>('verifying');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. When arriving via reset link we need to set the session first
  useEffect(() => {
    const params = getHashParams() as Record<string, string | undefined>;
    if (params.access_token && params.refresh_token) {
      supabase.auth
        .setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        })
        .then(({ error }) => {
          if (error) {
            toast({
              title: 'Invalid or expired link',
              description: 'Please request a new password reset link.',
              variant: 'destructive',
            });
            navigate('/');
          } else {
            setStage('set-password');
            // Clean the hash so it cannot be reused while keeping the route (#/reset-password)
            const baseHash = '#/reset-password';
            if (window.location.hash !== baseHash) {
              window.history.replaceState(null, '', baseHash);
            }
          }
        });
    } else {
      // Direct visit – nothing to do
      setStage('set-password');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are identical.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Could not update password',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Password updated',
        description: 'You can now log in with your new password.',
      });
      navigate('/');
    }
  };

  if (stage === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <p className="text-lg text-gray-700">Verifying reset link…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card className="shadow-lg border-orange-100">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Set a New Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {isLoading ? 'Updating…' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
