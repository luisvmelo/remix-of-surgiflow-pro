import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@opme/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill border px-3 py-1 text-copy font-semibold transition-smooth",
  {
    variants: {
      variant: {
        default: "bg-brand-100 text-brand-500 border-brand-200",
        secondary: "bg-secondary-100 text-secondary-500 border-secondary-200",
        destructive: "bg-danger-100 text-danger-500 border-danger-200",
        warning: "bg-warning-100 text-warning-600 border-warning-200",
        info: "bg-info-100 text-info-500 border-info-200",
        outline: "border-neutral-200 text-neutral-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
