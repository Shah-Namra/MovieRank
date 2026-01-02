import React from "react";
import { cn } from "@/lib/utils";

export const Subheading = ({
  children,
  className = "",
  as = "p",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "h2" | "h3";
}) => {
  const Tag = as;

  return (
    <Tag
      className={`text-base md:text-lg text-neutral-400 leading-relaxed max-w-2xl ${className}`}
    >
      {children}
    </Tag>
  );
};
