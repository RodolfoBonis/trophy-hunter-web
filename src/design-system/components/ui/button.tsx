import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "chamfer-sm inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-bold uppercase tracking-[0.12em]",
    "transition-[transform,box-shadow,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
    "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-[linear-gradient(180deg,#8ffaff,var(--color-neon-cyan))] text-text-on-accent hover:shadow-glow-cyan",
        secondary: "bg-surface-2 text-neon-cyan hover:bg-surface-3 hover:shadow-glow-cyan",
        ghost: "bg-transparent text-text-2 hover:bg-white/[0.06] hover:text-text-1",
        danger: "bg-danger text-[#1a0509] hover:shadow-[0_0_18px_color-mix(in_oklab,var(--color-danger)_var(--glow-mix),transparent)]",
        psn: "bg-psn text-white hover:shadow-[0_0_18px_color-mix(in_oklab,var(--color-psn)_var(--glow-mix),transparent)]",
      },
      size: {
        sm: "min-h-[34px] px-3.5 text-[11.5px]",
        md: "min-h-11 px-5 text-[13px]",
        lg: "min-h-12 px-6 text-sm",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";

export { buttonVariants };
