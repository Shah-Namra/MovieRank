import React from "react";
import { cn } from "@/lib/utils";

export const Heading = ({
  children,
  className,
  as = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) => {
  const Tag = as;
  return (
    <Tag
      className={cn(
        "text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight font-display"
      )}
    >
      {children}
    </Tag>
  );
};
