"use client";
/**
 * 403 权限不足页面
 */
import { useRouter } from "next/navigation";
export default function ForbiddenPage() {
    const router = useRouter();
    return (<div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* 图标 */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
        </div>

        {/* 错误码 */}
        <h1 className="text-6xl font-bold text-gray-900 mb-2">403</h1>

        {/* 标题 */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          权限不足
        </h2>

        {/* 描述 */}
        <p className="text-gray-500 mb-8">
          抱歉，您没有访问此页面的权限。
          <br />
          请联系管理员获取授权。
        </p>

        {/* 操作按钮 */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => router.back()} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition">
            返回上页
          </button>
          <button onClick={() => router.push("/")} className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 transition">
            返回首页
          </button>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map