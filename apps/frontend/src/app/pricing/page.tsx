import React from "react";
import SiteShell from "@/components/SiteShell";
import { getPublicModels, type Model } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  let models: Model[] = [];
  try {
    models = await getPublicModels();
  } catch (err) {
    console.error("Failed to load models for pricing:", err);
  }

  return (
    <SiteShell>
      <section className="max-w-[1100px] mx-auto px-6 py-12">
        <h1 className="text-[28px] font-bold mb-4">定价对比</h1>
        <p className="text-[13px] text-gray-500 mb-6">基于公开模型数据展示输入/输出价格对比。</p>

        <div className="overflow-x-auto bg-white border border-gray-100 rounded-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-[13px]">模型</th>
                <th className="px-4 py-3 text-[13px]">供应商</th>
                <th className="px-4 py-3 text-[13px]">输入价格 (/1K)</th>
                <th className="px-4 py-3 text-[13px]">输出价格 (/1K)</th>
                <th className="px-4 py-3 text-[13px]">说明</th>
              </tr>
            </thead>
            <tbody>
              {models.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-gray-500">暂无定价数据</td>
                </tr>
              ) : (
                models.map((m: any) => (
                  <tr key={m.id ?? m.name} className="border-t">
                    <td className="px-4 py-4">{m.name}</td>
                    <td className="px-4 py-4">{m.vendor ?? '-'}</td>
                    <td className="px-4 py-4">{typeof m.input_price === 'number' ? `¥${m.input_price}` : '-'}</td>
                    <td className="px-4 py-4">{typeof m.output_price === 'number' ? `¥${m.output_price}` : '-'}</td>
                    <td className="px-4 py-4 text-[13px] text-gray-600">{m.description ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </SiteShell>
  );
}
