import React from "react";
import SiteShell from "@/components/SiteShell";
import { getPublicModels, type Model } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  let models: Model[] = [];
  try {
    models = await getPublicModels();
  } catch (err) {
    console.error("Failed to load public models:", err);
  }

  return (
    <SiteShell>
      <section className="max-w-[1100px] mx-auto px-6 py-12">
        <h1 className="text-[28px] font-bold mb-4">模型列表</h1>
        <p className="text-[13px] text-gray-500 mb-6">展示所有可公开访问的模型与基础定价信息（来自后端 /v1/models/public）。</p>

        {models.length === 0 ? (
          <div className="text-gray-500">当前没有可用模型或加载失败，请稍后重试。</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((m: any) => (
              <div key={m.id ?? m.name} className="bg-white border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[16px] font-semibold text-gray-900">{m.name}</div>
                    <div className="text-[12px] text-gray-500">{m.vendor ?? "未知"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-bold text-gray-900">{typeof m.input_price === 'number' ? `¥${m.input_price}` : "-"}</div>
                    <div className="text-[11px] text-gray-500">输入/1K tokens</div>
                  </div>
                </div>
                {m.description && <p className="text-[13px] text-gray-600 mb-3">{m.description}</p>}
                <div className="flex items-center justify-between">
                  <div className="text-[12px] text-gray-500">输出价格: {typeof m.output_price === 'number' ? `¥${m.output_price}` : "-"}</div>
                  <a href={`/pricing?model=${encodeURIComponent(m.id ?? m.name)}`} className="text-primary text-[13px]">查看定价</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
