import { Accordion } from '@/components/ui/accordion';

const FAQ_ITEMS = [
  {
    question: 'ToAIAPI 支持哪些 AI 模型？',
    answer: '我们支持 OpenAI（GPT-4.1、o3）、Anthropic（Claude Sonnet 4、Haiku 4）、Google（Gemini 2.5 Pro/Flash）、DeepSeek（V3、R1）、Qwen 3、Grok-3 等主流模型，并持续增加新模型。',
  },
  {
    question: '如何开始使用？',
    answer: '注册账号后，在控制台创建 API Key，即可通过 OpenAI 兼容格式调用所有模型。整个过程不超过 5 分钟。',
  },
  {
    question: '计费方式是什么？',
    answer: '按实际 Token 使用量计费，精确到每次请求。支持预充值和套餐两种模式，余额不足时自动停止服务，不会产生意外费用。',
  },
  {
    question: '数据安全如何保障？',
    answer: '我们不存储任何请求和响应的内容数据。API Key 使用 Argon2id 加密存储，所有通信通过 HTTPS 加密传输。',
  },
  {
    question: '支持流式输出吗？',
    answer: '支持。所有模型均支持 SSE 流式输出，与 OpenAI 的 stream 模式完全兼容。',
  },
  {
    question: '企业版有什么额外能力？',
    answer: '企业版提供专属渠道部署、团队管理、统一账单、发票支持、SLA 保障和专属客户经理等增值服务。',
  },
  {
    question: '如何迁移到 ToAIAPI？',
    answer: '由于我们完全兼容 OpenAI API 格式，您只需将 API 基础地址和 API Key 替换为 ToAIAPI 的即可，无需修改任何代码。',
  },
] as const;

/** FAQ 区域 */
export function FaqSection() {
  return (
    <section id="faq" className="bg-[#030712] py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            常见问题
          </h2>
        </div>
        <div className="mt-16">
          <Accordion items={FAQ_ITEMS.map((item) => ({ question: item.question, answer: item.answer }))} />
        </div>
      </div>
    </section>
  );
}
