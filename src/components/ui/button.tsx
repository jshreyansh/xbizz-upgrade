import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)] shadow-sm",
  secondary: "border-[var(--line-strong)] bg-white text-[var(--ink)] hover:bg-[var(--surface-subtle)]",
  ghost: "border-transparent bg-transparent text-[var(--ink-muted)] hover:bg-black/5 hover:text-[var(--ink)]",
  danger: "border-transparent bg-[var(--danger)] text-white hover:bg-[#842e2d]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[12px]",
  md: "h-10 px-4 text-[13px]",
  lg: "h-12 px-5 text-[14px]",
  icon: "size-9 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-full border font-semibold transition-colors disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});
