import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Skeleton";

export interface TableColumn<T> {
  key: string;
  title: ReactNode;
  className?: string;
  headerClassName?: string;
  render: (row: T, index: number) => ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: keyof T | ((row: T, index: number) => string);
  loading?: boolean;
  empty?: ReactNode;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({ columns, data, rowKey, loading = false, empty, className, onRowClick }: TableProps<T>) {
  const resolveKey = (row: T, index: number) =>
    typeof rowKey === "function" ? rowKey(row, index) : String(row[rowKey]);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-neutral-200 bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-neutral-50 text-neutral-500">
              {columns.map((column) => (
                <th key={column.key} className={cn("border-b border-neutral-150 px-4 py-3 font-medium", column.headerClassName)}>
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <Skeleton variant="table" lines={5} className="rounded-none border-0" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>{empty || <EmptyState />}</td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={resolveKey(row, index)}
                  className={cn(
                    "border-b border-neutral-100 transition duration-100 ease-apple last:border-b-0",
                    onRowClick && "cursor-pointer hover:bg-neutral-50",
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={cn("border-b border-neutral-100 px-4 py-3 text-neutral-700 last:border-b-0", column.className)}>
                      {column.render(row, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
