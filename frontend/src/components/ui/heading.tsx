import React from "react";

// Proper heading with optical sizing
export const Heading = ({
  children,
  className = "",
  as = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) => {
  const Tag = as;

  // Scale that actually makes sense
  const sizeClasses = {
    h1: "text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.1]",
    h2: "text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.15]",
    h3: "text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.2]",
  };

  return <Tag className={`${sizeClasses[as]} ${className}`}>{children}</Tag>;
};
