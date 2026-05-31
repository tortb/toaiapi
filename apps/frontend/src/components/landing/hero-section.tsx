import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const MODELS = [
  { name: 'GPT-4.1', provider: 'OpenAI' },
  { name: 'Claude Sonnet', provider: 'Anthropic' },
  { name: 'Gemini 2.5 Pro', provider: 'Google' },
  { name: 'DeepSeek', provider: 'DeepSeek' },
  { name: 'Qwen 3', provider: 'Alibaba' },
  { name: 'Grok-3', provider: 'xAI' },
] as const;

/** Hero 区域 */
export function HeroSection() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* 左侧：标题 + 按钮 */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              统一接入全球领先
              <br />
              AI 模型
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              一次接入，多模型调用。
              <br />
              统一计费、统一鉴权、统一管理。
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/register">
                <Button size="lg">
                  立即开始
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/#docs">
                <Button variant="outline" size="lg">
                  查看文档
                </Button>
              </Link>
            </div>
          </div>

          {/* 右侧：模型卡片网格 */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MODELS.map((model) => (
              <div
                key={model.name}
                className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <p className="text-sm font-medium text-foreground">{model.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{model.provider}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
