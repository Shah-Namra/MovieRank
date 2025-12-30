import React from "react";
import { cn } from "@/lib/utils";

export const Subheading = ({
  children,
  className,
  as = "p",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "p";
}) => {
  const Tag = as;
  return (
    <Tag
      className={cn(
        "text-base md:text-lg text-neutral-400 dark:text-neutral-600 font-inter max-w-xl pr-4 py-8"
      )}
    >
      {children}
    </Tag>
  );
};
