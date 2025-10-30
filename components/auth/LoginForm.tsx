"use client";
import React, { useState, useEffect } from "react";
import { useAuthLogin } from "../../hooks/useAuthLogin";
import { useRouter } from "next/navigation";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export default function LoginForm() {
  const [phone, setPhone] = useState("+250788111223");
  const [pin, setPin] = useState("2345");

  const mutation = useAuthLogin();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ phone, pin });
  };

  const router = useRouter();

  useEffect(() => {
    if (mutation.status === "success") {
      // Redirect to dashboard after successful login
      router.push("/dashboard");
    }
  }, [mutation.status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <Card className="w-full max-w-md">
        <form onSubmit={onSubmit} className="space-y-4">
          <h2 className="text-2xl font-semibold">Organization Login</h2>

          <div>
            <label className="mb-2 block text-sm font-medium">Phone</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+250788111223"
              className="mb-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">PIN</label>
            <Input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="1234"
              type="password"
              className="mb-2"
            />
          </div>

          <Button type="submit" className="w-full" disabled={mutation.status === "pending"}>
            {mutation.status === "pending" ? "Signing in…" : "Sign in"}
          </Button>

          {mutation.status === "error" && (
            <p className="mt-2 text-sm text-red-600">{(mutation.error as Error).message}</p>
          )}

          {mutation.status === "success" && (
            <p className="mt-2 text-sm text-green-600">Login successful</p>
          )}
        </form>
      </Card>
    </div>
  );
}
