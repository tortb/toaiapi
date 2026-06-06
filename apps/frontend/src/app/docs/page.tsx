import React from "react";
import SiteShell from "@/components/SiteShell";

export default function DocsPage() {
  return (
    <SiteShell>
      <section className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="text-[28px] font-bold mb-4">接入文档</h1>
        <p className="text-[13px] text-gray-500 mb-6">查看 API 接入指南、SDK 使用说明与示例代码。</p>

        <div className="bg-white border border-gray-100 rounded-lg p-6">
          <h2 className="text-[16px] font-semibold mb-3">快速开始</h2>
          <p className="text-[13px] text-gray-600 mb-4">
            我们兼容 OpenAI API 格式，您可以使用标准 Bearer Token 调用我们的 endpoints。更多示例请查看完整文档或下载 SDK。
          </p>
          <a href="/docs/04-api/openai-compatible.md" className="text-primary">查看 OpenAI 兼容 API 说明</a>
        </div>
      </section>
    </SiteShell>
  );
}
