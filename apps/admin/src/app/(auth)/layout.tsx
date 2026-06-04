import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '登录 - ToAIAPI Admin',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">ToAIAPI</h1>
          <p className="mt-1 text-sm text-muted-foreground">管理后台</p>
        </div>
        {children}
      </div>
    </div>
  );
}
