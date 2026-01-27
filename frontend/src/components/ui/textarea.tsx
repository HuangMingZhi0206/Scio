import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[60px] w-full rounded-xl bg-dark-800/80 px-4 py-3 text-sm text-dark-50 placeholder:text-dark-400 border border-dark-700 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-200",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";

export { Textarea };
