'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const TABS = ['curl', 'Node.js', 'Python'] as const;

const CODE_SAMPLES: Record<string, string> = {
  curl: `curl https://api.toaiapi.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-toai-xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4.1",
    "messages": [
      { "role": "user", "content": "Hello" }
    ]
  }'`,
  'Node.js': `import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.toaiapi.com/v1',
  apiKey: 'sk-toai-xxxxx',
});

const response = await client.chat.completions.create({
  model: 'gpt-4.1',
  messages: [
    { role: 'user', content: 'Hello' },
  ],
});

console.log(response.choices[0].message.content);`,
  Python: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.toaiapi.com/v1",
    api_key="sk-toai-xxxxx",
)

response = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {"role": "user", "content": "Hello"},
    ],
)

print(response.choices[0].message.content)`,
};

/** 开发者体验区域 */
export function CodeSection() {
  const [activeTab, setActiveTab] = useState<string>('curl');

  return (
    <section id="docs" className="bg-[#030712] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            开发者体验
          </h2>
          <p className="mt-4 text-lg text-white/40">
            OpenAI 兼容格式，5 分钟完成接入
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          {/* Tab 栏 */}
          <div className="flex gap-1 rounded-t-xl border border-b-0 border-white/[0.06] bg-white/[0.03] p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                  activeTab === tab
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/40 hover:text-white/70',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 代码块 */}
          <div className="overflow-x-auto rounded-b-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <pre className="text-sm leading-relaxed">
              <code className="text-white/50 font-mono">{CODE_SAMPLES[activeTab]}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
