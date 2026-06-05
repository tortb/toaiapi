import { AuthProvider } from "@/providers/auth-provider";
import "./globals.css";
export const metadata = {
    title: "ToAiAPI - 全球领先的 AI API 中转平台",
    description: "统一接入多家顶级 AI 模型,稳定、安全、快速,为开发者和企业提供高性价比的 AI API 服务。",
};
export default function RootLayout({ children, }) {
    return (<html lang="zh-CN">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>);
}
//# sourceMappingURL=layout.js.map