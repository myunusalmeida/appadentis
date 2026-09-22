import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (string | undefined | null | false | {[key: string]: boolean})[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20",
        destructive: "bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/20",
        outline: "border border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-700/80 hover:text-white",
        secondary: "bg-slate-700 text-slate-100 hover:bg-slate-600",
        ghost: "text-slate-300 hover:bg-slate-800 hover:text-white",
        amber: "bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 shadow-md shadow-amber-500/20",
        emerald: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
