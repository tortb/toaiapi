"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { RefreshCw, Search } from "lucide-react";
import type { PaginatedResponse } from "@/lib/admin-api";
import { useErrorToast } from "@/lib/feedback/use-error-toast";

type RowId = { id: string };

export interface AdminResourceColumn<T extends RowId> {
  header: string;
  width?: string;
  className?: string;
  render: (item: T) => ReactNode;
}

interface AdminResourceListProps<T extends RowId> {
  title: string;
  description?: string;
  searchPlaceholder?: string;
  enableSearch?: boolean;
  pageSize?: number;
  loadData: (params: { page: number; pageSize: number; search?: string }) => Promise<PaginatedResponse<T>>;
  columns: AdminResourceColumn<T>[];
  /** 每行操作按钮（渲染在右侧「操作」列） */
  actions?: (item: T) => ReactNode;
  /** 工具栏额外按钮（出现在刷新按钮右侧） */
  toolbarExtra?: ReactNode;
}

function safeError(error: unknown): string {
  const raw = error instanceof Error ? error.message : "加载失败";
  return raw
    .replace(/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, "[token]")
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, "sk-****")
    .slice(0, 240);
}

export function AdminResourceList<T extends RowId>({
  title,
  description,
  searchPlaceholder = "搜索",
  enableSearch = true,
  pageSize = 20,
  loadData,
  columns,
  actions,
  toolbarExtra,
}: AdminResourceListProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [, setError] = useErrorToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await loadData({ page, pageSize, search: submittedSearch || undefined });
      setItems(result.items ?? []);
      setTotal(result.total ?? 0);
      setTotalPages(Math.max(1, result.totalPages ?? 1));
    } catch (err) {
      setError(safeError(err));
      setItems([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [loadData, page, pageSize, submittedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pageLabel = useMemo(() => `第 ${page} / ${totalPages} 页`, [page, totalPages]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSubmittedSearch(search.trim());
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{title}</h1>
          {description && <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {enableSearch && (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-9 w-64 rounded-md border border-[var(--line)] bg-white pl-9 pr-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>
              <button type="submit" className="h-9 rounded-md bg-[var(--accent)] px-3 text-sm font-medium text-white hover:bg-[var(--accent)]/90">搜索</button>
            </form>
          )}
          <button onClick={fetchData} className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </button>
          {toolbarExtra}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
        <div className="min-w-[860px]">
          <div className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3">
            {columns.map((column) => (
              <div key={column.header} className={`text-xs font-semibold text-[var(--text-muted)] ${column.className ?? ""}`} style={column.width ? { width: column.width, flex: "none" } : { flex: 1 }}>
                {column.header}
              </div>
            ))}
            {actions && <div className="w-[100px] flex-none text-xs font-semibold text-[var(--text-muted)] text-right">操作</div>}
          </div>
          {loading ? (
            <div className="px-4 py-12 text-center text-sm text-[var(--text-secondary)]">加载中...</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-[var(--text-secondary)]">暂无数据</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3 last:border-b-0">
                {columns.map((column) => (
                  <div key={`${item.id}-${column.header}`} className={`min-w-0 text-sm text-[var(--foreground)] ${column.className ?? ""}`} style={column.width ? { width: column.width, flex: "none" } : { flex: 1 }}>
                    {column.render(item)}
                  </div>
                ))}
                {actions && <div className="w-[100px] flex-none text-right text-sm" onClick={(e) => e.stopPropagation()}>{actions(item)}</div>}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
        <span>共 {total.toLocaleString("zh-CN")} 条</span>
        <div className="flex items-center gap-3">
          <button disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-md border border-[var(--line)] bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50">上一页</button>
          <span>{pageLabel}</span>
          <button disabled={page >= totalPages || loading} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-md border border-[var(--line)] bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50">下一页</button>
        </div>
      </div>
    </section>
  );
}
