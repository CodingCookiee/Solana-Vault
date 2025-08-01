"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        ...props.toastOptions,
        style: {
          ...(props.toastOptions?.style || {}),
          background:
            theme === "dark"
              ? "rgba(33, 33, 43, 0.8)"
              : "rgba(255, 255, 255, 0.8)",
          color:
            theme === "dark"
              ? "rgba(255, 255, 255, 0.9)"
              : "rgba(33, 33, 43, 0.9)",
          border:
            theme === "dark"
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.05)",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
