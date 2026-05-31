import { Badge } from '@/components/ui/badge';

const MODEL_DATA = [
  { provider: 'OpenAI', model: 'GPT-4.1', context: '1M', status: '可用' },
  { provider: 'OpenAI', model: 'GPT-4.1 Mini', context: '1M', status: '可用' },
  { provider: 'OpenAI', model: 'o3', context: '200K', status: '可用' },
  { provider: 'Anthropic', model: 'Claude Sonnet 4', context: '200K', status: '可用' },
  { provider: 'Anthropic', model: 'Claude Haiku 4', context: '200K', status: '可用' },
  { provider: 'Google', model: 'Gemini 2.5 Pro', context: '1M', status: '可用' },
  { provider: 'Google', model: 'Gemini 2.5 Flash', context: '1M', status: '可用' },
  { provider: 'DeepSeek', model: 'DeepSeek V3', context: '128K', status: '可用' },
  { provider: 'DeepSeek', model: 'DeepSeek R1', context: '128K', status: '可用' },
  { provider: 'Alibaba', model: 'Qwen 3', context: '128K', status: '可用' },
  { provider: 'xAI', model: 'Grok-3', context: '128K', status: '可用' },
] as const;

/** 支持模型区域 */
export function ModelsSection() {
  return (
    <section id="models" className="bg-[#030712] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            支持模型
          </h2>
          <p className="mt-4 text-lg text-white/40">
            覆盖主流 AI 模型，统一接口调用
          </p>
        </div>

        <div className="mt-16 overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">Provider</th>
                <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">模型</th>
                <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">上下文</th>
                <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">状态</th>
              </tr>
            </thead>
            <tbody>
              {MODEL_DATA.map((row, index) => (
                <tr
                  key={`${row.provider}-${row.model}`}
                  className={`transition-colors hover:bg-white/[0.03] ${
                    index < MODEL_DATA.length - 1 ? 'border-b border-white/[0.04]' : ''
                  }`}
                >
                  <td className="px-5 py-3.5 text-sm text-white/60">{row.provider}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-white/80">{row.model}</td>
                  <td className="px-5 py-3.5 text-sm text-white/40">{row.context}</td>
                  <td className="px-5 py-3.5"><Badge variant="success">{row.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
