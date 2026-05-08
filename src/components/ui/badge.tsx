import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-red-950 text-red-400 border-red-900",
    secondary: "bg-zinc-800 text-zinc-400 border-zinc-700",
    destructive: "bg-red-950 text-red-400 border-red-900",
    outline: "bg-transparent text-zinc-400 border-zinc-700",
    success: "bg-emerald-950 text-emerald-400 border-emerald-900",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
