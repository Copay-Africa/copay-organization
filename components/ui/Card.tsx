"use client";
import React from "react";
import clsx from "clsx";

export function Card({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={clsx(
      "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={clsx("text-2xl font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={clsx("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("p-6 pt-0", className)}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-center p-6 pt-0", className)}>
      {children}
    </div>
  );
}

export default Card;
