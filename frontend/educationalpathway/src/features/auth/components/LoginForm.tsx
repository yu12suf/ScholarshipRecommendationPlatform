'use client';

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center relative bg-white px-4 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute -top-10 -left-10 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-10 -right-10 w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      {/* Centered Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md z-10"
      >
        <Card className="w-full border border-gray-200 rounded-lg bg-white shadow-sm">
          <CardHeader className="text-center pt-10 pb-4">
            <h1 className="text-3xl font-serif text-gray-900">
              Welcome
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Sign in to continue
            </p>
          </CardHeader>

          <CardBody className="px-8 pb-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-serif text-gray-500">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-gray-300 rounded-sm bg-gray-50 focus:border-green-500 shadow-none"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-serif text-gray-500">
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
                    className="h-12 border-gray-300 rounded-sm bg-gray-50 focus:border-green-500 shadow-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-sm cursor-pointer"
                isLoading={isLoading}
              >
                Sign In
              </Button>

              {/* Forgot Password */}
              <div className="text-center">
                <Link href="/forgot-password" className="text-xs text-green-600 hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </form>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="mx-3 text-xs text-gray-400">OR</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            {/* Google Login */}
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      googleLogin(credentialResponse.credential);
                    }
                  }}
                  onError={() => toast.error("Google Login Failed")}
                  use_fedcm_for_prompt={false}
                  theme="outline"
                  shape="pill"
                  width="100%"
                  text="signin_with"
                />
              </div>
            ) : (
              <p className="text-xs text-center text-gray-400">
                Google login unavailable
              </p>
            )}

            {/* Register */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Don’t have an account?{" "}
                <Link href="/role-selection" className="text-green-600 font-medium hover:underline">
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