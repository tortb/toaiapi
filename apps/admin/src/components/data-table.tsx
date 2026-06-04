'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

/** 表格列定义 */
export interface DataTableColumn<T> {
  /** 列标识 */
  key: string;
  /** 列标题 */
  header: string;
  /** 自定义渲染函数 */
  render?: (item: T) => React.ReactNode;
  /** 列样式 */
  className?: string;
}

/** 分页信息 */
interface Pagination {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  /** 列定义 */
  columns: DataTableColumn<T>[];
  /** 数据源 */
  data: T[];
  /** 分页配置 */
  pagination?: Pagination;
  /** 空状态文字 */
  emptyText?: string;
  /** 是否加载中 */
  loading?: boolean;
}

/**
 * 通用数据表格组件
 *
 * 支持列定义、自定义渲染、骨架屏加载、空状态和分页。
 */
export function DataTable<T>({
  columns,
  data,
  pagination,
  emptyText = '暂无数据',
  loading = false,
}: DataTableProps<T>) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // 骨架屏加载状态
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // 空状态
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Inbox className="h-8 w-8 opacity-40" />
                    <p className="text-sm">{emptyText}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // 数据行
              data.map((item, index) => (
                <TableRow
                  key={((item as Record<string, unknown>)['id'] as string) || index}
                  className="transition-colors hover:bg-accent/50"
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-xs text-muted-foreground">
            第 {pagination.page} / {pagination.totalPages} 页
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
