import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

/** 营销页面布局（Header + Footer 包裹） */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
