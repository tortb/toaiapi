import { PublicLayout } from '@/components/layout/public-layout'

export default function DocsPage() {
  return (
    <PublicLayout>
      <div className="max-w-[1440px] mx-auto px-10 py-16">
        <div className="mb-8"><h1 className="text-4xl font-bold text-[var(--foreground)]">API 文档</h1><p className="mt-2 text-base text-[var(--text-secondary)]">快速接入 ToAIAPI，为您的应用提供强大的 AI 能力</p></div>
        <div className="flex gap-10">
          <div className="w-[260px] bg-white border border-[var(--line)] rounded-xl p-2 space-y-1">
            {['快速开始', '认证方式', '端点说明', '代码示例', '参数说明', '错误码'].map((s, i) => (
              <div key={s} className={`px-3 py-2.5 text-sm rounded-md ${i === 0 ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] cursor-pointer'}`}>{s}</div>
            ))}
          </div>
          <div className="flex-1 space-y-6">
            <div className="bg-white border border-[var(--line)] rounded-xl p-6">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">快速开始</h2>
              <div className="text-sm text-[var(--text-secondary)] space-y-2">
                <p>1. 注册账号 → 获取 API Key</p><p>2. 选择模型 → 查看定价</p><p>3. 调用 API → 开始使用</p>
              </div>
            </div>
            <div className="bg-white border border-[var(--line)] rounded-xl p-6">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">认证方式</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">所有 API 请求都需要包含 API Key 进行身份验证。API Key 前缀为 sk-toai-。</p>
              <div className="flex gap-3">
                {[['Bearer Token', 'Authorization: Bearer <你的 API Key>', '推荐'], ['X-API-Key Header', 'X-API-Key: <你的 API Key>', '备选']].map(([title, val]) => (
                  <div key={title} className="flex-1 bg-[var(--surface-soft)] rounded-lg p-4">
                    <div className="text-sm font-semibold text-[var(--foreground)] mb-2">{title}</div>
                    <code className="text-xs font-mono text-[var(--text-secondary)]">{val}</code>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-[var(--line)] rounded-xl p-6">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">代码示例</h2>
              <div className="flex gap-1 mb-4">{['cURL', 'Python', 'JavaScript'].map((l, i) => (
                <button key={l} className={`px-3 py-1.5 text-sm rounded-md ${i === 0 ? 'bg-[var(--accent)] text-white font-medium' : 'text-[var(--text-secondary)]'}`}>{l}</button>
              ))}</div>
              <pre className="bg-[#1E293B] text-[#E2E8F0] rounded-lg p-5 text-sm font-mono leading-relaxed overflow-x-auto">{`curl /api/v1/chat/completions \\\n  -H "Authorization: Bearer <你的 API Key>" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"<模型名称>","messages":[{"role":"user","content":"Hello"}]}'`}</pre>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
