'use client';

/**
 * 请求日志
 *
 * /dashboard/logs — API 请求历史记录、筛选、详情抽屉
 */

import React from 'react';
import UserConsoleLayout from '@/components/dashboard/layout/UserConsoleLayout';
import Badge, { getBadgeVariant } from '@/components/dashboard/ui/Badge';
import Drawer from '@/components/dashboard/ui/Drawer';
import EmptyState from '@/components/dashboard/ui/EmptyState';
import { IconSearch, IconRefresh, IconClose } from '@/components/dashboard/ui/Icons';

/* ============== 类型定义 ============== */

interface LogEntry {
  id: string;
  time: string;
  method: string;
  path: string;
  status: number;
  tokens: number;
  latency: number;
  requestBody?: string;
  responseBody?: string;
}

/* ============== 模拟数据（待接入 API） ============== */

const MOCK_LOGS: LogEntry[] = [
  { id: '1', time: '2026-06-06 14:32:01', method: 'POST', path: '/v1/chat/completions', status: 200, tokens: 1234, latency: 856, requestBody: '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}],"stream":false}', responseBody: '{"id":"chatcmpl-xxx","object":"chat.completion","created":1717660321,"model":"gpt-4o","usage":{"prompt_tokens":10,"completion_tokens":1224,"total_tokens":1234}}' },
  { id: '2', time: '2026-06-06 14:31:55', method: 'POST', path: '/v1/chat/completions', status: 200, tokens: 892, latency: 623, requestBody: '{"model":"claude-sonnet-4","messages":[{"role":"user","content":"Tell me a joke"}],"max_tokens":1024}', responseBody: '{"id":"msg_xxx","type":"message","role":"assistant","content":[{"type":"text","text":"Why did the AI cross the road?"}],"usage":{"input_tokens":12,"output_tokens":880}}' },
  { id: '3', time: '2026-06-06 14:31:02', method: 'POST', path: '/v1/embeddings', status: 422, tokens: 0, latency: 145, requestBody: '{"model":"text-embedding-3-small","input":""}', responseBody: '{"error":{"type":"invalid_request_error","message":"input must be non-empty string"}}' },
  { id: '4', time: '2026-06-06 14:30:45', method: 'POST', path: '/v1/chat/completions', status: 200, tokens: 2105, latency: 1204, requestBody: '{"model":"gpt-4o","messages":[{"role":"system","content":"You are a helpful assistant"},{"role":"user","content":"Write a poem about AI"}],"stream":false}', responseBody: '{"id":"chatcmpl-yyy","object":"chat.completion","created":1717660245,"model":"gpt-4o","usage":{"prompt_tokens":25,"completion_tokens":2080,"total_tokens":2105}}' },
  { id: '5', time: '2026-06-06 14:29:30', method: 'POST', path: '/v1/chat/completions', status: 401, tokens: 0, latency: 12, requestBody: '{"model":"gpt-4o","messages":[{"role":"user","content":"test"}]}', responseBody: '{"error":{"type":"authentication_error","message":"Invalid API key"}}' },
];

/* ============== 子组件：日志详情抽屉 ============== */

function LogDetailDrawer({ log, open, onClose }: { log: LogEntry | null; open: boolean; onClose: () => void }) {
  if (!log) return null;

  return (
    <Drawer open={open} onClose={onClose} title="请求详情">
      <div className="space-y-5">
        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">请求时间</p>
            <p className="text-sm text-gray-800">{log.time}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">延迟</p>
            <p className="text-sm text-gray-800 font-mono">{log.latency}ms</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">状态</p>
            <Badge variant={getBadgeVariant(log.status < 400 ? 'success' : log.status < 500 ? 'warning' : 'error')}>
              {log.status}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Token</p>
            <p className="text-sm text-gray-800 font-mono">{log.tokens.toLocaleString()}</p>
          </div>
        </div>

        {/* 请求 JSON */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">请求 Body</p>
          <pre className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-700 overflow-x-auto max-h-[200px] overflow-y-auto">
            {log.requestBody ? JSON.stringify(JSON.parse(log.requestBody), null, 2) : '-'}
          </pre>
        </div>

        {/* 响应 JSON */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">响应 Body</p>
          <pre className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-700 overflow-x-auto max-h-[300px] overflow-y-auto">
            {log.responseBody ? JSON.stringify(JSON.parse(log.responseBody), null, 2) : '-'}
          </pre>
        </div>
      </div>
    </Drawer>
  );
}

/* ============== 主页面 ============== */

export default function LogsPage() {
  const [logs] = React.useState<LogEntry[]>(MOCK_LOGS);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [selectedLog, setSelectedLog] = React.useState<LogEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const filtered = logs.filter((log) => {
    if (search && !log.path.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === 'success' && log.status >= 400) return false;
    if (statusFilter === 'error' && log.status < 400) return false;
    return true;
  });

  const openDetail = (log: LogEntry) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  return (
    <UserConsoleLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">请求日志</h1>
            <p className="text-sm text-gray-500 mt-0.5">查看 API 请求历史记录和详情</p>
          </div>
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <IconRefresh size={15} />
            刷新
          </button>
        </div>

        {/* 筛选栏 */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* 搜索 */}
          <div className="flex items-center gap-2 px-3 h-9 bg-white border border-gray-200 rounded-lg flex-1 min-w-[200px] max-w-[320px]">
            <IconSearch size={15} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="搜索接口路径..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                <IconClose size={14} />
              </button>
            )}
          </div>

          {/* 状态筛选 */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            {[
              { key: 'all', label: '全部' },
              { key: 'success', label: '成功' },
              { key: 'error', label: '失败' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  statusFilter === opt.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 提示：数据源说明 */}
        <p className="text-xs text-gray-400 mb-3">
          ⚡ 当前显示为示例数据，接入后端后将展示真实请求日志
        </p>

        {/* 日志表格 */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <EmptyState
              title="暂无匹配的日志"
              description="尝试调整筛选条件"
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="font-normal text-left px-5 py-3.5 text-xs text-gray-500">时间</th>
                  <th className="font-normal text-left px-5 py-3.5 text-xs text-gray-500">接口</th>
                  <th className="font-normal text-left px-5 py-3.5 text-xs text-gray-500">状态</th>
                  <th className="font-normal text-right px-5 py-3.5 text-xs text-gray-500">Token</th>
                  <th className="font-normal text-right px-5 py-3.5 text-xs text-gray-500">延迟</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => openDetail(log)}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 text-sm text-gray-600 font-mono text-xs">{log.time}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{log.method}</span>
                        <span className="text-sm text-gray-800 font-mono text-xs">{log.path}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={getBadgeVariant(log.status < 400 ? 'success' : log.status < 500 ? 'warning' : 'error')}>
                        {log.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right text-gray-700 font-mono text-xs">
                      {log.tokens > 0 ? log.tokens.toLocaleString() : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right text-gray-500 font-mono text-xs">
                      {log.latency}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 详情抽屉 */}
      <LogDetailDrawer log={selectedLog} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </UserConsoleLayout>
  );
}
