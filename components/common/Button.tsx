import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * ボタンコンポーネントのプロパティ
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** ボタンのバリアント */
  variant?: "primary" | "secondary" | "danger";
  /** ボタンのサイズ */
  size?: "sm" | "md" | "lg";
  /** ボタンの子要素 */
  children: ReactNode;
}

/**
 * 共通ボタンコンポーネント
 * アクセシビリティとユーザビリティを考慮した設計
 */
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm min-h-[32px]",
    md: "px-4 py-2 text-base min-h-[44px]",
    lg: "px-6 py-3 text-lg min-h-[48px]",
  };

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
