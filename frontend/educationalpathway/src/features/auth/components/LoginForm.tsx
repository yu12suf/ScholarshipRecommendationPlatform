'use client';

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/providers/auth-context";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/api";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, googleLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to login. Please check your credentials."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">

      {/* Background decorations */}

      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-10 -left-10 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-10 -right-10 w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card border border-border shadow-sm rounded-sm">

          <CardHeader className="text-center pt-10 pb-4">

            <h1 className="text-3xl font-semibold text-foreground">
              Welcome
            </h1>

            <p className="text-sm text-muted-foreground mt-2">
              Sign in to continue
            </p>

          </CardHeader>

          <CardBody className="px-8 pb-8 space-y-6">

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}

              <div className="space-y-2">

                <Label htmlFor="email" className="text-label">
                  Email
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

              {/* Password */}

              <div className="space-y-2">

                <Label htmlFor="password" className="text-label">
                  Password
                </Label>

                <div className="relative">

                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-muted border-border pr-12"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>

                </div>

              </div>

              {error && (
                <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-sm border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              {/* Submit */}

              <Button
                type="submit"
                size="lg"
                className="w-full h-12"
                isLoading={isLoading}
              >
                Sign In
              </Button>

              {/* Forgot password */}

              <div className="text-center">

                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot your password?
                </Link>

              </div>

            </form>

            {/* Divider */}

            <div className="relative flex items-center">

              <div className="grow border-t border-border"></div>

              <span className="mx-3 text-xs text-muted-foreground">
                OR
              </span>

              <div className="grow border-t border-border"></div>

            </div>

            {/* Google Login */}

            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (

              <div className="w-full flex justify-center [&>div]:w-full">

                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      googleLogin(credentialResponse.credential);
                    }
                  }}
                  onError={() => setError("Google Login Failed")}
                  use_fedcm_for_prompt={false}
                  theme="outline"
                  shape="pill"
                  width="100%"
                  text="signin_with"
                />

              </div>

            ) : (

              <p className="text-xs text-center text-muted-foreground">
                Google login unavailable
              </p>

            )}

            {/* Register */}

            <div className="text-center pt-4">

              <p className="text-sm text-muted-foreground">

                Don’t have an account?{" "}

                <Link
                  href="/role-selection"
                  className="text-primary font-medium hover:underline"
                >
                  Create Account
                </Link>

              </p>

            </div>

          </CardBody>

        </Card>

      </motion.div>

    </div>
  );
}
