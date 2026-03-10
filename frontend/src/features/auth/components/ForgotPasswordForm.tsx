'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/providers/auth-context';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/Card';
import { getErrorMessage } from '@/lib/api';
import { motion } from 'framer-motion';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPassword({ email });
      setIsSent(true);
      toast.success('Reset link sent to your email!');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to send reset link'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full border-gray-200 relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl">
          <CardHeader className="text-center pt-10 pb-2 relative z-10">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Email Sent</h1>
            <p className="text-muted-foreground mt-3 font-medium">Please check your email for the reset link.</p>
          </CardHeader>
          <CardBody className="pt-10 px-8 pb-10 text-center relative z-10">
            <Link href="/login">
              <Button variant="scholarship" size="xl" className="w-full rounded-xl cursor-pointer">
                Back to Login
              </Button>
            </Link>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

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
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Forgot?</h1>
          <p className="text-muted-foreground mt-3 font-medium">No worries! We will send you a reset link.</p>
        </CardHeader>
        
        <CardBody className="space-y-6 pt-10 px-8 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-gray-500">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                icon={<Mail className="h-5 w-5" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            >
              Send Reset Link
            </Button>
          </form>

          <div className="pt-8 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="text-primary font-black hover:underline decoration-2 underline-offset-4">
                Login
              </Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
