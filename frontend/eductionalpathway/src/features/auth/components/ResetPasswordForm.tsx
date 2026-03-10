'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/providers/auth-context';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { getErrorMessage } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ token, password });
      toast.success('Password reset successfully!');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to reset password'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="w-full border-gray-200 relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-50" />
        
        <CardHeader className="text-center pt-10 pb-2 relative z-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Reset</h1>
          <p className="text-muted-foreground mt-3 font-medium">Enter your new password below.</p>
        </CardHeader>
        
        <CardBody className="space-y-6 pt-10 px-8 relative z-10 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-gray-500">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-5 w-5" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/50 border-gray-300 h-14 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-black uppercase tracking-widest text-gray-500">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-5 w-5" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/50 border-gray-300 h-14 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              variant="scholarship"
              size="xl"
              className="w-full h-14 text-lg shadow-2xl shadow-primary/20 rounded-xl cursor-pointer"
              isLoading={isLoading}
              disabled={!token}
            >
              Update Password
            </Button>
          </form>

          {!token && (
            <div className="bg-red-50 p-4 rounded-xl flex gap-3 text-xs text-red-600 font-medium mt-4">
               <p>Invalid reset link. Please request a new one.</p>
            </div>
          )}

          <div className="pt-4 text-center">
            <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-primary transition-colors">
              Back to Login
            </Link>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
