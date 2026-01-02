import React from "react";
import { cn } from "@/lib/utils";

export const Container = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className={`max-w-7xl mx-auto px-6 ${className}`}>{children}</div>
  );
};
