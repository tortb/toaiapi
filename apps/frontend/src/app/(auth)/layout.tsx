import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ToAIAPI - 认证',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ToAIAPI</h1>
          <p className="mt-2 text-sm text-gray-600">Enterprise AI Gateway Platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
