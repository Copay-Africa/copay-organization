"use client";
import React, { useState, useEffect } from "react";
import { useAuthLogin } from "../../hooks/useAuthLogin";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";

export default function LoginForm() {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [validationErrors, setValidationErrors] = useState<{phone?: string; pin?: string}>({});

  const mutation = useAuthLogin();

  const validateForm = () => {
    const errors: {phone?: string; pin?: string} = {};
    
    // Phone validation
    if (!phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''))) {
      errors.phone = "Please enter a valid phone number";
    }
    
    // PIN validation
    if (!pin) {
      errors.pin = "PIN is required";
    } else if (!/^\d{4,6}$/.test(pin)) {
      errors.pin = "PIN must be 4-6 digits";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Sanitize inputs
    const sanitizedPhone = phone.replace(/\s/g, '');
    mutation.mutate({ phone: sanitizedPhone, pin });
  };

  const router = useRouter();

  useEffect(() => {
    if (mutation.status === "success") {
      // Redirect to dashboard after successful login
      router.push("/dashboard");
    }
  }, [mutation.status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative w-full max-w-md">
        {/* Logo/Brand section */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-4">
            <svg
              className="h-6 w-6 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Co-Pay</h1>
          <p className="text-muted-foreground text-sm">Cooperative Management System</p>
        </div>

        <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription>
              Sign in to your organization account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (validationErrors.phone) {
                      setValidationErrors(prev => ({ ...prev, phone: undefined }));
                    }
                  }}
                  placeholder="+250 788 111 223"
                  type="tel"
                  autoComplete="tel"
                  required
                  className={validationErrors.phone ? "border-destructive" : ""}
                />
                {validationErrors.phone && (
                  <p className="text-sm text-destructive">{validationErrors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin">
                  PIN
                </Label>
                <Input
                  id="pin"
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only digits
                    setPin(value);
                    if (validationErrors.pin) {
                      setValidationErrors(prev => ({ ...prev, pin: undefined }));
                    }
                  }}
                  placeholder="Enter your PIN"
                  type="password"
                  autoComplete="current-password"
                  maxLength={6}
                  required
                  className={validationErrors.pin ? "border-destructive" : ""}
                />
                {validationErrors.pin && (
                  <p className="text-sm text-destructive">{validationErrors.pin}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={mutation.status === "pending"}
                size="lg"
              >
                {mutation.status === "pending" ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              {/* Error message */}
              {mutation.status === "error" && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-destructive font-medium">
                      {(mutation.error as Error).message}
                    </p>
                  </div>
                </div>
              )}

              {/* Success message */}
              {mutation.status === "success" && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Login successful! Redirecting...
                    </p>
                  </div>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>
                Need help?{" "}
                <button className="underline underline-offset-4 hover:text-primary transition-colors">
                  Contact support
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
