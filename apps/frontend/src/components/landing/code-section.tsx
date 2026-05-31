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
    <section id="docs" className="bg-background py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            开发者体验
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            OpenAI 兼容格式，5 分钟完成接入
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          {/* Tab 栏 */}
          <div className="flex gap-1 rounded-t-lg border border-b-0 border-border bg-card p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  activeTab === tab
                    ? 'bg-background text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 代码块 */}
          <div className="overflow-x-auto rounded-b-lg border border-border bg-card p-6">
            <pre className="text-sm leading-relaxed">
              <code className="text-muted-foreground">{CODE_SAMPLES[activeTab]}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
