"use client";
/**
 * Admin 登录页面
 *
 * 管理员专用登录入口，验证角色权限后跳转到 Dashboard。
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
export default function AdminLoginPage() {
    const router = useRouter();
    const { login, isAuthenticated, isAdmin, isLoading, error, clearError } = useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // 已登录则跳转
    useEffect(() => {
        if (!isLoading && isAuthenticated && isAdmin) {
            router.replace("/admin");
        }
    }, [isLoading, isAuthenticated, isAdmin, router]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        if (!email.trim() || !password.trim()) {
            return;
        }
        setIsSubmitting(true);
        try {
            await login({ email: email.trim(), password });
            router.replace("/admin");
        }
        catch {
            // 错误已在 store 中设置
        }
        finally {
            setIsSubmitting(false);
        }
    };
    // 加载中显示空白（避免闪烁）
    if (isLoading) {
        return (<div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
      </div>);
    }
    // 已登录不显示登录表单
    if (isAuthenticated && isAdmin) {
        return null;
    }
    return (<div className="min-h-screen bg-[#FAFBFC] flex">
      {/* 左侧品牌区 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
        {/* 网格背景 */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
        }}/>

        <div className="relative z-10 flex flex-col justify-center px-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">
              ToAi<span className="text-primary">API</span>
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            AI API Gateway
            <br />
            管理控制台
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-md">
            统一管理 AI 模型、渠道、用户和计费。
            <br />
            企业级 API 中转平台后台管理系统。
          </p>

          {/* 特性列表 */}
          <div className="mt-12 space-y-4">
            {[
            "多模型统一接入与管理",
            "实时监控与智能告警",
            "精细化权限控制",
            "完整的财务与订单系统",
        ].map((feature) => (<div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2962FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>))}
          </div>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[400px]">
          {/* 移动端 Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">
              ToAi<span className="text-primary">API</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            管理员登录
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            请输入管理员账号登录后台系统
          </p>

          {/* 错误提示 */}
          {error && (<div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>)}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 邮箱 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                邮箱地址
              </label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" autoComplete="email" required className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"/>
            </div>

            {/* 密码 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                密码
              </label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition pr-10"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>) : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>)}
                </button>
              </div>
            </div>

            {/* 登录按钮 */}
            <button type="submit" disabled={isSubmitting || !email.trim() || !password.trim()} className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
              {isSubmitting ? (<>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  登录中...
                </>) : ("登录")}
            </button>
          </form>

          {/* 底部链接 */}
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-500 hover:text-primary transition">
              ← 返回首页
            </a>
          </div>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map