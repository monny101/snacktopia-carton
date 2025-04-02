import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  fluid = false,
}) => {
  return (
    <div
      className={cn(
        "w-full px-4 mx-auto",
        fluid ? "container-fluid" : "container max-w-screen-xl",
        className,
      )}
    >
      {children}
    </div>
  );
};

export { ResponsiveContainer };
