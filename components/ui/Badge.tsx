"use client";
import React from "react";
import clsx from "clsx";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground shadow",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    success: "border-transparent bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    warning: "border-transparent bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
    destructive: "border-transparent bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    outline: "border border-border text-foreground",
  };

  return (
    <div
      className={clsx(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export default Badge;