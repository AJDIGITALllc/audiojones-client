import { cn } from "@/lib/cn";
import { type ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full", className)}>{children}</table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn("border-b border-gray-200", className)}>
      {children}
    </thead>
  );
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

export function TableRow({ children, className }: TableRowProps) {
  return (
    <tr className={cn("border-b border-gray-100", className)}>{children}</tr>
  );
}

interface TableHeadProps {
  children?: ReactNode;
  className?: string;
}

export function TableHead({ children, className }: TableHeadProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-sm font-semibold text-gray-700",
        className
      )}
    >
      {children}
    </th>
  );
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
  return <tbody className={cn(className)}>{children}</tbody>;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className }: TableCellProps) {
  return (
    <td className={cn("px-4 py-3 text-sm text-gray-600", className)}>
      {children}
    </td>
  );
}

