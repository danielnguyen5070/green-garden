"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

/**
 * Global toast container. Mount once in each document root layout.
 */
function Toaster({ ...props }: ToasterProps) {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "border border-border bg-popover text-popover-foreground shadow-md",
          title: "text-sm font-medium",
          description: "text-sm text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
          closeButton: "border-border bg-background text-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
