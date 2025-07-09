import React from "react";

// Define the prop types using TypeScript interfaces
interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "body"
    | "small"
    | "extraSmall"
    | "tiny";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "muted";
  align?: "left" | "center" | "right";
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";
  className?: string;
  as?: React.ElementType;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = "body",
  color = "default",
  align = "left",
  weight = "normal",
  className = "",
  as,
  ...props
}) => {
  const variantStyles: Record<string, string> = {
    h1: "text-4xl font-bold",
    h2: "text-3xl font-bold",
    h3: "text-2xl font-semibold",
    h4: "text-xl font-normal",
    h5: "text-lg font-medium",
    h6: "text-base font-medium",
    body: "text-base",
    small: "text-sm",
    extraSmall: "text-xs",
    tiny: "text-xs",
  };

  const colorStyles: Record<string, string> = {
    default: "text-gray-900 dark:text-gray-100",
    primary: "text-blue-600 dark:text-blue-400",
    secondary: "text-gray-600 dark:text-gray-300",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    error: "text-red-400 dark:text-red-400",
    muted: "text-gray-500 dark:text-gray-500",
  };

  const alignStyles: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const weightStyles: Record<string, string> = {
    light: "font-light",
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  // Determine which HTML element to render
  const Component =
    as ||
    (variant === "h1"
      ? "h1"
      : variant === "h2"
      ? "h2"
      : variant === "h3"
      ? "h3"
      : variant === "h4"
      ? "h4"
      : variant === "h5"
      ? "h5"
      : variant === "h6"
      ? "h6"
      : "p");

  const classes = `
    ${variantStyles[variant] || variantStyles.body}
    ${colorStyles[color] || colorStyles.default}
    ${alignStyles[align] || alignStyles.left}
    ${weightStyles[weight] || weightStyles.normal}
    ${className}
  `;

  return (
    <Component className={classes.trim()} {...props}>
      {children}
    </Component>
  );
};
