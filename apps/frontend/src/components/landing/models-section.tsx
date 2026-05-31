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
    <section id="models" className="border-y border-border bg-card/50 py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            支持模型
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            覆盖主流 AI 模型，统一接口调用
          </p>
        </div>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Provider
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  模型
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  上下文
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MODEL_DATA.map((row) => (
                <tr key={`${row.provider}-${row.model}`} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm text-foreground">{row.provider}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{row.model}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{row.context}</td>
                  <td className="px-4 py-3">
                    <Badge variant="success">{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
