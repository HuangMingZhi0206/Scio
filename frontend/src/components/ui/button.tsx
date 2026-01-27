import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20",
                accent:
                    "bg-accent-500 text-white hover:bg-accent-600 shadow-lg shadow-accent-500/20",
                destructive:
                    "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20",
                outline:
                    "border border-dark-600 bg-transparent hover:bg-dark-800 hover:border-dark-500",
                secondary:
                    "bg-dark-700 text-dark-100 hover:bg-dark-600",
                ghost:
                    "hover:bg-dark-800 hover:text-dark-100",
                link:
                    "text-primary-400 underline-offset-4 hover:underline",
                glass:
                    "glass hover:bg-dark-700/70 border-dark-600/50",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-12 rounded-lg px-6 text-base",
                icon: "h-10 w-10",
                "icon-sm": "h-8 w-8",
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
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
