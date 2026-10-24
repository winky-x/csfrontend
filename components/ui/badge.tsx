import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
  {
    variants: {
      variant: {
        default:
          "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-sm",
        secondary:
          "border border-zinc-800 bg-zinc-900/80 text-zinc-300",
        destructive:
          "border border-rose-500/30 bg-rose-500/10 text-rose-400",
        outline:
          "border border-zinc-700 text-zinc-300",
        warning:
          "border border-amber-500/30 bg-amber-500/10 text-amber-400",
        cyber:
          "border border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
        purple:
          "border border-purple-500/30 bg-purple-500/10 text-purple-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
