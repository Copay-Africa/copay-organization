"use client";
import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {};

export function Input(props: InputProps) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-md border border-muted card-bg px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus-ring " +
        (props.className || "")
      }
    />
  );
}

export default Input;
