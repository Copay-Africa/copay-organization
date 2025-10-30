"use client";
import React from "react";
import clsx from "clsx";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "destructive";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none px-4 py-2";
  const variants: Record<string, string> = {
    default: "bg-foreground text-background hover:opacity-90",
    ghost: "bg-transparent border border-muted hover:opacity-90",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  };

  return <button className={clsx(base, variants[variant], className)} {...props} />;
}

export default Button;
