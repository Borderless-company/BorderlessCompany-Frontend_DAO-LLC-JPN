import clsx from "clsx";
import { ComponentProps, forwardRef } from "react";

export type StackProps = {
  children?: React.ReactNode;
  h?: boolean;
} & ComponentProps<"div">;

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ children, h = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "flex items-start justify-start w-full",
          h ? "flex-row" : "flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Stack.displayName = "Stack";
