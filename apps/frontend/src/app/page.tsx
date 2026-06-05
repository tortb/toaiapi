import {
  ToAiAPILogo,
  IconChevronDown,
  IconArrowRight,
  IconCheck,
  IconShield,
  IconCloud,
  IconBolt,
  IconStar,
  IconQuote,
  IconLogoSmall,
  LogoOpenAI,
  LogoAnthropic,
  LogoGoogle,
  LogoMeta,
  LogoMixtral,
  LogoCohere,
  Isometric3DChart,
  QRCode,
} from "@/components/PixelIcons";
import SiteShell from "@/components/SiteShell";

export default function HomePage() {
  return (
    <SiteShell>
      {/* ============== 英雄区域 ============== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 isometric-bg opacity-30" />
        <div className="relative max-w-[1280px] mx-auto px-6 pt-12 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* 左侧文字 */}
            <div>
              <h1 className="text-[42px] leading-[1.2] font-bold text-gray-900 mb-5">
                全球领先的
                <br />
                <span className="text-primary">AI API</span> 中转平台
              </h1>
              <p className="text-[15px] leading-[1.7] text-gray-500 mb-7 max-w-[480px]">
                统一接入多家顶级 AI 模型,稳定、安全、快速,
                <br />
                为开发者和企业提供高性价比的 AI API 服务。
              </p>
              <div className="flex items-center gap-3 mb-10">
                <button className="bg-primary text-white px-5 py-2.5 rounded text-[14px] font-medium hover:bg-primary-600 transition flex items-center gap-2">
                  快速开始 <IconArrowRight size={12} />
                </button>
                <button className="bg-primary-50 text-primary px-5 py-2.5 rounded text-[14px] font-medium hover:bg-primary-100 transition">
                  查看文档
                </button>
              </div>

              {/* 四个特性标签 */}
              <div className="flex items-center gap-6 text-[12px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>稳定可靠</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple" />
                  <span>安全保障</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                  <span>高速响应</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span>成本优化</span>
                </div>
              </div>
            </div>

            {/* 右侧 3D 图表 */}
            <div className="relative flex justify-center">
              <Isometric3DChart />
            </div>
          </div>
        </div>
      </section>

      {/* ============== 数据统计条 ============== */}
      <section className="border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <StatItem icon={<IconShield size={20} className="text-primary" />} value="99.9%" label="稳定可靠" />
            <StatItem icon={<IconCloud size={20} className="text-purple" />} value="10,000+" label="注册用户" />
            <StatItem icon={<IconBolt size={20} className="text-warning" />} value="50,000,000+" label="API 调用次数" />
            <StatItem icon={<IconLogoSmall size={18} className="text-success" />} value="20+" label="支持模型" />
            <StatItem icon={<IconLogoSmall size={18} className="text-info" />} value="7x24h" label="技术支持" />
          </div>
        </div>
      </section>

      {/* ============== 服务价值柱 ============== */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-bold text-gray-900 mb-3">为什么选择 ToAiAPI</h2>
          <p className="text-[14px] text-gray-500">
            我们致力于为开发者提供全球最优质的 AI API 服务
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <ValueCard
            icon={<IconShield size={24} className="text-primary" />}
            title="统一接入"
            desc="一次接入,多模型可用。支持 OpenAI、Anthropic、Google 等顶级模型"
          />
          <ValueCard
            icon={<IconBolt size={24} className="text-purple" />}
            title="稳定可靠"
            desc="全球多节点部署,智能路由切换,99.9% 服务可用性保障"
          />
          <ValueCard
            icon={<IconCheck size={24} className="text-success" />}
            title="安全保障"
            desc="企业级安全防护,数据加密传输,安全合规账户管理"
          />
          <ValueCard
            icon={<IconCloud size={24} className="text-info" />}
            title="成本优化"
            desc="灵活的定价策略,相比官方价格最高可节省 70% 成本"
          />
        </div>
      </section>

      {/* ============== 模型网格 ============== */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-[32px] font-bold text-gray-900 mb-3">支持多种顶级模型</h2>
          <p className="text-[14px] text-gray-500">轻松接入全球最顶尖 AI 模型</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <ModelCard logo={<LogoOpenAI />} name="GPT-4o" vendor="OpenAI" />
          <ModelCard logo={<LogoOpenAI />} name="GPT-4o-mini" vendor="OpenAI" />
          <ModelCard logo={<LogoAnthropic />} name="Claude 3.5 Sonnet" vendor="Anthropic" />
          <ModelCard logo={<LogoAnthropic />} name="Claude 3 Haiku" vendor="Anthropic" />
          <ModelCard logo={<LogoGoogle />} name="Gemini 1.5 Pro" vendor="Google" />
          <ModelCard logo={<LogoGoogle />} name="Gemini 1.5 Flash" vendor="Google" />
        </div>
        <div className="text-center">
          <button className="bg-primary text-white px-6 py-2.5 rounded text-[14px] font-medium hover:bg-primary-600 transition">
            查看所有模型
          </button>
        </div>
      </section>

      {/* ============== 代码块 + 简单易用的 API ============== */}
      <section className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* 代码块 */}
          <div className="bg-gray-900 rounded-lg overflow-hidden shadow-soft">
            <div className="flex items-center border-b border-gray-800">
              {["cURL", "Python", "JavaScript", "Go", "PHP"].map((t, i) => (
                <button
                  key={t}
                  className={`px-4 py-2.5 text-[12px] font-medium ${
                    i === 0
                      ? "text-white border-b-2 border-primary"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <pre className="p-5 text-[12.5px] leading-[1.7] text-gray-300 font-mono overflow-x-auto">
              <code>{`curl https://api.toaiapi.com/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "stream": false
  }'`}</code>
            </pre>
          </div>

          {/* 右侧文字 */}
          <div className="flex flex-col justify-center">
            <h3 className="text-[24px] font-bold text-gray-900 mb-4">简单易用的 API</h3>
            <p className="text-[14px] text-gray-500 leading-[1.7] mb-6">
              兼容 OpenAI API 格式,几行代码即可接入,
              <br />
              支持多种编程语言,助力快速集成。
            </p>
            <ul className="space-y-2.5 mb-6">
              {[
                "完全兼容 OpenAI API",
                "详细的文档和示例",
                "多种语言 SDK 支持",
                "实时日志和监控",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2 text-[13.5px] text-gray-700">
                  <span className="text-primary">
                    <IconCheck size={14} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <button className="self-start bg-primary-50 text-primary px-5 py-2 rounded text-[13px] font-medium hover:bg-primary-100 transition w-fit">
              查看文档
            </button>
          </div>
        </div>
      </section>

      {/* ============== 定价卡片 ============== */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-[32px] font-bold text-gray-900 mb-3">简单透明的定价</h2>
          <p className="text-[14px] text-gray-500">无隐藏费用,按量计费</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <PricingCard
            title="免费试用"
            price="¥0"
            unit="新用户专享"
            features={["免费额度", "体验所有功能", "技术支持"]}
            buttonText="立即试用"
            buttonStyle="outline"
          />
          <PricingCard
            title="按量付费"
            price="¥0.02"
            unit="/ 1K tokens"
            features={["无月租费用", "按量计费", "开发者友好"]}
            buttonText="查看价格"
            buttonStyle="outline"
          />
          <PricingCard
            title="充值套餐"
            price="¥100"
            unit="充值得越多,送得越多"
            features={["多种套餐可选", "最高赠送 30%", "优先技术支持"]}
            buttonText="立即充值"
            buttonStyle="primary"
            badge="NEW"
          />
          <PricingCard
            title="企业定制"
            price="定制报价"
            unit="满足企业个性化需求"
            features={["专属价格方案", "私有化部署", "专属技术支持"]}
            buttonText="联系我们"
            buttonStyle="outline"
          />
        </div>
      </section>

      {/* ============== 客户评价 ============== */}
      <section className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-[28px] font-bold text-gray-900 mb-3">他们都在使用 ToAiAPI</h2>
          <p className="text-[13px] text-gray-500">来自开发者和企业的信赖</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <TestimonialCard
            stars={5}
            text='"ToAiAPI 的稳定性和速度超出了我们的预期,极大提升了我们的产品体验。"'
            name="陈伟"
            role="某 AI Startup 创始人"
          />
          <TestimonialCard
            stars={5}
            text='"价格合理,服务稳定,技术支持的响应速度也是我们长期合作的原因。"'
            name="李娜"
            role="科技公司 CTO"
          />
          <TestimonialCard
            stars={5}
            text='"接入简单,文档详细,让我们能够快速将 AI 功能集成到产品中。"'
            name="王芳"
            role="产品经理"
          />
          <TestimonialCard
            stars={5}
            text='"多种模型让我们可以灵活选择,统一接口让开发效率大幅提升。"'
            name="陈晨"
            role="某科技公司技术负责人"
          />
        </div>
      </section>

      {/* ============== 合作伙伴 ============== */}
      <section className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6 opacity-70">
          <PartnerLogo name="OpenAI" />
          <PartnerLogo name="ANTHROP\C" />
          <PartnerLogo name="Google" />
          <PartnerLogo name="∞ Meta" />
          <PartnerLogo name="MISTRAL AI" />
          <PartnerLogo name="cohere" />
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-primary-50 to-white border border-primary-100 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-[26px] font-bold text-gray-900 mb-2">开始您的 AI 开发之旅</h2>
            <p className="text-[14px] text-gray-600">
              接入 ToAiAPI,体验简单、稳定、强大的 AI API 服务
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-primary text-white px-6 py-2.5 rounded text-[14px] font-medium hover:bg-primary-600 transition">
              立即注册
            </button>
            <button className="bg-white text-primary border border-primary px-6 py-2.5 rounded text-[14px] font-medium hover:bg-primary-50 transition">
              查看文档
            </button>
          </div>
        </div>
      </section>

      {/* ============== 页脚 占位由 SiteShell 提供 ============== */}
    </SiteShell>
  );
}

/* ============== 小组件 ============== */

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-card">
        {icon}
      </div>
      <div>
        <div className="text-[18px] font-bold text-gray-900">{value}</div>
        <div className="text-[12px] text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-5 card-hover">
      <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-[16px] font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-[13px] text-gray-500 leading-[1.7]">{desc}</p>
    </div>
  );
}

function ModelCard({ logo, name, vendor }: { logo: React.ReactNode; name: string; vendor: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4 text-center card-hover">
      <div className="flex justify-center mb-3">{logo}</div>
      <h3 className="text-[13.5px] font-bold text-gray-900 mb-1">{name}</h3>
      <p className="text-[11.5px] text-gray-500">{vendor}</p>
    </div>
  );
}

function PricingCard({
  title,
  price,
  unit,
  features,
  buttonText,
  buttonStyle,
  badge,
}: {
  title: string;
  price: string;
  unit: string;
  features: string[];
  buttonText: string;
  buttonStyle: "primary" | "outline";
  badge?: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-6 relative card-hover">
      {badge && (
        <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded">
          {badge}
        </span>
      )}
      <h3 className="text-[15px] font-medium text-gray-700 mb-3">{title}</h3>
      <div className="mb-1">
        <span className="text-[28px] font-bold text-gray-900">{price}</span>
      </div>
      <p className="text-[12px] text-gray-500 mb-4">{unit}</p>
      <ul className="space-y-2 mb-5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-[12.5px] text-gray-700">
            <span className="text-primary">
              <IconCheck size={12} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <button
        className={`w-full py-2 rounded text-[13px] font-medium transition ${
          buttonStyle === "primary"
            ? "bg-primary text-white hover:bg-primary-600"
            : "border border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}

function TestimonialCard({ stars, text, name, role }: { stars: number; text: string; name: string; role: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-5">
      <div className="flex items-center gap-0.5 mb-3 text-warning">
        {Array.from({ length: stars }).map((_, i) => (
          <IconStar key={i} size={12} className="text-warning" />
        ))}
      </div>
      <div className="relative mb-4">
        <div className="absolute -top-1 -left-1 text-primary-100 opacity-50">
          <IconQuote size={18} />
        </div>
        <p className="text-[12.5px] text-gray-700 leading-[1.7] pl-4">{text}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple flex items-center justify-center text-white text-[10px] font-bold">
          {name[0]}
        </div>
        <div>
          <div className="text-[12.5px] font-bold text-gray-900">{name}</div>
          <div className="text-[11px] text-gray-500">{role}</div>
        </div>
      </div>
    </div>
  );
}

function PartnerLogo({ name }: { name: string }) {
  return (
    <div className="text-[16px] font-bold text-gray-500 tracking-wide">
      {name}
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-[13px] font-bold text-gray-900 mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-[12.5px] text-gray-500 hover:text-primary">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ type }: { type: "wechat" | "github" | "twitter" }) {
  const colors = {
    wechat: "#1AAD19",
    github: "#1A1D21",
    twitter: "#1DA1F2",
  };
  return (
    <a
      href="#"
      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
      style={{ background: colors[type] }}
    >
      {type === "wechat" ? "W" : type === "github" ? "G" : "T"}
    </a>
  );
}
