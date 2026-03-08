"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/providers/auth-context";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/api";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, googleLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email, password });
      toast.success("Welcome back!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to login"));
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
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl opacity-50" />

        <CardHeader className="text-center pt-10 pb-2 relative z-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Login
          </h1>
          <p className="text-muted-foreground mt-3 font-medium">
            Welcome back! Please enter your details.
          </p>
        </CardHeader>

        <CardBody className="space-y-6 pt-10 px-8 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-black uppercase tracking-widest text-gray-500"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email"
                icon={<Mail className="h-5 w-5" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/50 border-gray-300 h-14 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label
                  htmlFor="password"
                  className="text-xs font-black uppercase tracking-widest text-gray-500"
                >
                  Password
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                icon={<Lock className="h-5 w-5" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              Sign In
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-primary hover:text-primary/70 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-gray-400">
              <span className="bg-white/80 px-4 backdrop-blur-xl">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center flex-col items-center">
            <div className="w-full flex justify-center scale-90 md:scale-100 hover:opacity-90 transition-opacity">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    googleLogin(credentialResponse.credential);
                  }
                }}
                onError={() => {
                  toast.error("Google Login Failed");
                }}
                use_fedcm_for_prompt={false}
                theme="outline"
                shape="pill"
                width="100%"
                text="signin_with"
              />
            </div>
          </div>

          <div className="pt-8 text-center">
            <p className="text-sm text-gray-600">
              New here?{" "}
              <Link
                href="/role-selection"
                className="text-primary font-black hover:underline decoration-2 underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
