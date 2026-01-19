import React from "react";
import { cn } from "@/lib/utils";

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

const styles = {
  h1: "text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground text-balance leading-[1.1]",
  h2: "text-2xl sm:text-3xl font-semibold tracking-tight text-foreground text-balance leading-tight",
  h3: "text-xl sm:text-2xl font-semibold tracking-tight text-foreground text-balance leading-tight",
};

export const Heading = ({ children, className, as = "h2" }: HeadingProps) => {
  const Tag = as;
  return <Tag className={cn(styles[as], className)}>{children}</Tag>;
};
