'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, GraduationCap } from 'lucide-react';
import { useAuth } from '@/providers/auth-context';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { getErrorMessage } from '@/lib/api';
import { motion } from 'framer-motion';

export function ForgotPasswordForm() {

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await forgotPassword({ email });
      setIsSent(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to send reset link. Please try again.'));
    } finally {
      setIsLoading(false);
    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center relative bg-background px-4 overflow-hidden">

      {/* Background decoration */}

      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>
      {/* Card */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >

        <Card className="bg-card border border-border rounded-lg relative overflow-hidden">

          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-50" />

          {isSent ? (

            <>
              <CardHeader className="text-center pt-10 pb-4">

                <h1 className="text-3xl font-semibold text-foreground">
                  Email Sent
                </h1>

                <p className="text-sm text-muted-foreground mt-2">
                  Please check your email for the reset link.
                </p>

              </CardHeader>

              <CardBody className="px-8 pb-10 text-center">

                <Link href="/login">

                  <Button
                    variant="scholarship"
                    size="lg"
                    className="w-full"
                  >
                    Back to Login
                  </Button>

                </Link>

              </CardBody>
            </>

          ) : (

            <>
              <CardHeader className="text-center pt-10 pb-4">

                <h1 className="text-3xl font-semibold text-foreground">
                  Forgot Password
                </h1>

                <p className="text-sm text-muted-foreground mt-2">
                  No worries! We'll send you a reset link.
                </p>

              </CardHeader>

              <CardBody className="space-y-6 px-8 pb-10">

                <form onSubmit={handleSubmit} className="space-y-6">

                  <div className="space-y-2">

                    <Label htmlFor="email" className="text-label">
                      Email Address
                    </Label>

                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-muted border-border"
                    />

                  </div>

                  {error && (
                    <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="scholarship"
                    size="lg"
                    className="w-full h-12"
                    isLoading={isLoading}
                  >
                    Send Reset Link
                  </Button>

                </form>

                <div className="text-center pt-4">

                  <p className="text-sm text-muted-foreground">

                    Remember your password?{" "}

                    <Link
                      href="/login"
                      className="text-primary font-medium hover:underline"
                    >
                      Login
                    </Link>

                  </p>

                </div>

              </CardBody>
            </>
          )}

        </Card>

      </motion.div>

    </div>
  );

}
