"use client";
import React from "react";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={"rounded-lg border border-muted card-bg p-6 shadow " + (className || "")}>{children}</div>
  );
}

export default Card;
