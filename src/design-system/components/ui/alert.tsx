import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const alertVariants = cva("flex items-start gap-3 rounded-[var(--radius)] border p-4 text-sm", {
  variants: {
    tone: {
      info: "border-border bg-surface-2 text-text",
      warning: "border-warning/30 bg-warning/10 text-warning",
      danger: "border-danger/30 bg-danger/10 text-danger",
    },
  },
  defaultVariants: { tone: "info" },
});

export interface AlertProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  icon?: ReactNode;
}

export function Alert({ className, tone, icon, children, ...props }: AlertProps) {
  return (
    <div role="status" className={cn(alertVariants({ tone }), className)} {...props}>
      {icon ? <span className="mt-0.5 shrink-0 [&_svg]:size-4">{icon}</span> : null}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
