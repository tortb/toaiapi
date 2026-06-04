import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const MODELS = [
  { name: 'GPT-4.1', provider: 'OpenAI' },
  { name: 'Claude Sonnet 4', provider: 'Anthropic' },
  { name: 'Gemini 2.5 Pro', provider: 'Google' },
  { name: 'DeepSeek V3', provider: 'DeepSeek' },
  { name: 'Qwen 3', provider: 'Alibaba' },
  { name: 'Grok-3', provider: 'xAI' },
] as const;

/** Hero 区域 — 渐变标题 + 发光模型卡片 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#030712]">
      {/* 网格背景 */}
      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* 微弱渐变光晕 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/[0.05] rounded-full blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-36">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* 左侧：标题 + 按钮 */}
          <div className="animate-fade-in-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              所有系统正常运行
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              统一接入
              <br />
              <span className="text-gradient">
                全球领先 AI 模型
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-white/40 md:text-xl">
              一次接入，多模型调用。
              <br />
              统一计费、统一鉴权、统一管理。
            </p>

            <div className="mt-10 flex gap-4">
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
          <div className="animate-fade-in-up delay-200">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {MODELS.map((model) => (
                <div
                  key={model.name}
                  className="group relative rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.2] hover:bg-white/[0.06]"
                >
                  {/* hover 微光 */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/[0.05] to-indigo-500/[0.05] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative">
                    <p className="text-sm font-semibold text-white/90">{model.name}</p>
                    <p className="mt-1.5 text-xs text-white/30">{model.provider}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
