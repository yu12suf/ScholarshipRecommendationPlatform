"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/providers/auth-context";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardBody, CardHeader, CardFooter } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

export function SignupForm({
  initialRole,
}: {
  initialRole?: "student" | "counselor";
}) {
  const searchParams = useSearchParams();
  const queryRole = searchParams.get("role") as "student" | "counselor" | null;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: initialRole || queryRole || "student",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register, googleLogin } = useAuth();

  useEffect(() => {
    if (queryRole && (queryRole === "student" || queryRole === "counselor")) {
      setFormData((prev) => ({ ...prev, role: queryRole }));
    }
  }, [queryRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(formData);
      toast.success("Account created!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to sign up"));
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
            Sign Up
          </h1>
          <p className="text-muted-foreground mt-3 font-medium">
            Create your account to get started.
          </p>
        </CardHeader>

        <CardBody className="space-y-6 pt-10 px-8 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-xs font-black uppercase tracking-widest text-gray-500 "
              >
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="Name"
                icon={<User className="h-5 w-5" />}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="h-14 bg-white/50 border-gray-300 rounded-xl"
              />
            </div>

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
                required
                placeholder="Email"
                icon={<Mail className="h-5 w-5" />}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="h-14 bg-white/50 border-gray-300 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-black uppercase tracking-widest text-gray-500"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="Password"
                icon={<Lock className="h-5 w-5" />}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="h-14 bg-white/50 border-gray-300 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              variant="scholarship"
              size="xl"
              className="w-full h-14 text-lg shadow-2xl shadow-primary/20 rounded-xl cursor-pointer"
              isLoading={isLoading}
            >
              Sign Up
            </Button>
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
                text="signup_with"
              />
            </div>
          </div>

          <div className="pt-8 text-center">
            <p className="text-sm text-gray-600 font-medium">
              Have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-black hover:underline decoration-2 underline-offset-4"
              >
                Login
              </Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
