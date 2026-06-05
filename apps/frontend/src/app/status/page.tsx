import React from "react";
import SiteShell from "@/components/SiteShell";
import { getStatus } from "@/lib/api";

export default async function StatusPage() {
  let status: any[] = [];
  try {
    status = await getStatus();
  } catch (err) {
    console.error("Failed to load status:", err);
  }

  return (
    <SiteShell>
      <section className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="text-[28px] font-bold mb-4">服务状态</h1>
        <p className="text-[13px] text-gray-500 mb-6">展示各渠道/供应商的实时健康状态（来自后端 /v1/status）。</p>

        {status.length === 0 ? (
          <div className="text-gray-500">无法获取状态数据，请稍后重试。</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {status.map((s: any) => (
              <div key={s.name} className="bg-white border border-gray-100 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-semibold text-gray-900">{s.name}</div>
                  {s.message && <div className="text-[12px] text-gray-500">{s.message}</div>}
                </div>
                <div className="text-right">
                  <span className={`inline-block w-3 h-3 rounded-full ${s.healthy ? 'bg-success' : 'bg-warning'}`} />
                  <div className="text-[12px] text-gray-500 mt-1">{s.healthy ? '正常' : '有问题'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
