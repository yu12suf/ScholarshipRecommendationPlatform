'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lock, GraduationCap, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/providers/auth-context'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { getErrorMessage } from '@/lib/api'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

export function ResetPasswordForm() {

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { resetPassword } = useAuth()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    if (!token) {
      toast.error('Invalid or missing reset token')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {

      await resetPassword({ token, password })

      toast.success('Password reset successfully!')

    } catch (error: unknown) {

      toast.error(getErrorMessage(error, 'Failed to reset password'))

    } finally {

      setIsLoading(false)

    }

  }

  return (

    <div className="min-h-screen flex items-center justify-center relative bg-background px-4 overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >

        <Card className="bg-card border border-border rounded-xl relative overflow-hidden">

          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-50" />

          <CardHeader className="text-center pt-10 pb-4">

            <h1 className="text-3xl font-semibold text-foreground">
              Reset Password
            </h1>

            <p className="text-sm text-muted-foreground mt-2">
              Enter your new password below.
            </p>

          </CardHeader>

          <CardBody className="space-y-6 px-8 pb-10">

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Password */}
              <div className="space-y-2">

                <Label htmlFor="password" className="text-label">
                  New Password
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

              {/* Confirm Password */}
              <div className="space-y-2">

                <Label htmlFor="confirmPassword" className="text-label">
                  Confirm Password
                </Label>

                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12 bg-muted border-border pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

              </div>

              <Button
                type="submit"
                variant="scholarship"
                size="lg"
                className="w-full h-12"
                isLoading={isLoading}
                disabled={!token}
              >
                Update Password
              </Button>

            </form>

            {!token && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-md">
                Invalid reset link. Please request a new one.
              </div>
            )}

            <div className="text-center pt-4">

              <Link
                href="/login"
                className="text-sm text-primary hover:underline"
              >
                Back to Login
              </Link>

            </div>

          </CardBody>

        </Card>

      </motion.div>

    </div>
  )
}