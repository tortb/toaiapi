"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  ToAiAPILogo,
  IconMenu,
  IconSearch,
  IconBell,
  IconSettings,
  IconChevronDown,
  IconCalendar,
  IconRefresh,
  IconMore,
  IconDashboard,
  IconUserList,
  IconUserGroup,
  IconKey,
  IconOrders,
  IconRecharge,
  IconBill,
  IconInvoice,
  IconModel,
  IconChannel,
  IconPrice,
  IconSystem,
  IconLog,
  IconMonitor,
  IconBack,
  IconUsers,
  IconWallet,
  IconChartBar,
  IconChartLine,
  IconCoin,
} from "@/components/PixelIcons";

/* ============== 侧边栏导航数据 ============== */
interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: "控制台",
    items: [{ icon: <IconDashboard size={18} />, label: "控制台", active: true }],
  },
  {
    title: "用户管理",
    items: [
      { icon: <IconUserList size={18} />, label: "用户列表" },
      { icon: <IconUserGroup size={18} />, label: "用户分组" },
      { icon: <IconKey size={18} />, label: "API Key 管理" },
    ],
  },
  {
    title: "订单与财务",
    items: [
      { icon: <IconOrders size={18} />, label: "订单管理" },
      { icon: <IconRecharge size={18} />, label: "充值记录" },
      { icon: <IconBill size={18} />, label: "账单管理" },
      { icon: <IconInvoice size={18} />, label: "发票管理" },
    ],
  },
  {
    title: "模型与通道",
    items: [
      { icon: <IconModel size={18} />, label: "模型管理" },
      { icon: <IconChannel size={18} />, label: "通道管理" },
      { icon: <IconPrice size={18} />, label: "模型价格" },
    ],
  },
  {
    title: "系统与监控",
    items: [
      { icon: <IconSystem size={18} />, label: "系统设置" },
      { icon: <IconLog size={18} />, label: "操作日志" },
      { icon: <IconLog size={18} />, label: "调用日志" },
      { icon: <IconMonitor size={18} />, label: "系统监控" },
    ],
  },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-gray-900 flex">
      {/* ============== 左侧导航 ============== */}
      <aside className="w-[220px] bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-16 px-5 flex items-center border-b border-gray-100">
          <ToAiAPILogo size={28} />
          <span className="ml-2 text-[16px] font-bold text-gray-900">
            ToAi<span className="text-primary">API</span>
          </span>
        </div>

        {/* 导航 */}
        <nav className="flex-1 overflow-y-auto py-3">
          {sidebarSections.map((section) => (
            <div key={section.title} className="mb-3">
              <div className="px-5 py-1.5 text-[11px] text-gray-400 font-medium">
                {section.title}
              </div>
              <ul>
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href="#"
                      className={`flex items-center gap-2.5 px-5 py-2 text-[13px] transition ${
                        item.active
                          ? "bg-primary-50 text-primary border-r-2 border-primary font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className={item.active ? "text-primary" : "text-gray-500"}>
                        {item.icon}
                      </span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* 返回前台 */}
        <div className="p-3 border-t border-gray-100">
          <a
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 text-[13px] text-gray-600 border border-gray-200 rounded hover:border-primary hover:text-primary transition"
          >
            <IconBack size={14} />
            返回前台
          </a>
        </div>
      </aside>

      {/* ============== 主内容区 ============== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部标题栏 */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 flex-shrink-0">
          <button className="mr-4 text-gray-500 hover:text-primary">
            <IconMenu size={20} />
          </button>
          <h1 className="text-[16px] font-medium text-gray-900 mr-auto">控制台</h1>
          <div className="flex items-center gap-5">
            <button className="text-gray-500 hover:text-primary">
              <IconSearch size={18} />
            </button>
            <button className="relative text-gray-500 hover:text-primary">
              <IconBell size={18} />
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full px-1 min-w-[14px] text-center">
                12
              </span>
            </button>
            <button className="text-gray-500 hover:text-primary">
              <IconSettings size={18} />
            </button>
            {/* 用户菜单 */}
            <div className="relative pl-5 border-l border-gray-100">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple flex items-center justify-center text-white text-[11px] font-bold">
                  {initial}
                </div>
                <div className="text-left">
                  <div className="text-[12.5px] font-medium text-gray-900 leading-tight">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {user?.role === "super_admin" ? "超级管理员" : "管理员"}
                  </div>
                </div>
                <IconChevronDown size={12} className="text-gray-400" />
              </button>

              {/* 下拉菜单 */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* 内容滚动区 */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* 欢迎语 + 日期选择器 */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-[22px] font-bold text-gray-900">
                欢迎回来, Admin 👋
              </h2>
              <p className="text-[12.5px] text-gray-500 mt-1">
                这是您系统的整体运行状况概览
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DateRangePicker />
              <button className="bg-primary text-white px-4 py-2 rounded text-[12.5px] font-medium flex items-center gap-1.5 hover:bg-primary-600">
                <IconRefresh size={12} />
                刷新
              </button>
            </div>
          </div>

          {/* 五个数据卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
            <MetricCard
              icon={<IconUsers size={20} className="text-primary" />}
              iconBg="bg-primary-50"
              label="注册用户"
              value="12,543"
              growth="+12.5%"
              positive
              sub="较上月增长"
            />
            <MetricCard
              icon={<IconWallet size={20} className="text-purple" />}
              iconBg="bg-[#F3E5F5]"
              label="总充值金额"
              value="¥ 1,234,567.89"
              growth="+18.6%"
              positive
              sub="较上月增长"
            />
            <MetricCard
              icon={<IconChartBar size={20} className="text-info" />}
              iconBg="bg-[#E1F5FE]"
              label="总消费金额"
              value="¥ 987,654.32"
              growth="+20.3%"
              positive
              sub="较上月增长"
            />
            <MetricCard
              icon={<IconChartLine size={20} className="text-orange" />}
              iconBg="bg-[#FFF3E0]"
              label="总调用次数"
              value="98,765,432"
              growth="+25.1%"
              positive
              sub="较上月增长"
            />
            <MetricCard
              icon={<IconCoin size={20} className="text-success" />}
              iconBg="bg-[#E8F5E9]"
              label="剩余 Token"
              value="1,234,567,890"
              growth="-10.2%"
              positive={false}
              sub="较上月变化"
            />
          </div>

          {/* 折线图 + 圆环图 + 系统公告 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
            {/* 折线图 */}
            <div className="lg:col-span-6 bg-white rounded-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-gray-900">调用统计</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-gray-500">调用次数</span>
                  <IconChevronDown size={10} className="text-gray-400" />
                  <div className="flex bg-gray-100 rounded text-[11px]">
                    {["小时", "天", "月"].map((t, i) => (
                      <button
                        key={t}
                        className={`px-2.5 py-1 ${
                          i === 1
                            ? "bg-primary text-white rounded"
                            : "text-gray-500"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <LineChart />
            </div>

            {/* 圆环图 */}
            <div className="lg:col-span-3 bg-white rounded-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-gray-900">模型调用分布</h3>
                <a href="#" className="text-[12px] text-primary">
                  更多
                </a>
              </div>
              <DonutChart />
            </div>

            {/* 系统公告 */}
            <div className="lg:col-span-3 bg-white rounded-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-gray-900">系统公告</h3>
                <a href="#" className="text-[12px] text-primary">
                  更多
                </a>
              </div>
              <ul className="space-y-3">
                <AnnouncementItem
                  type="系统"
                  title="系统维护通知"
                  desc="系统将于 2024-06-01 02:00 ~ 04:00 进行维护..."
                  time="2024-05-30 14:30"
                />
                <AnnouncementItem
                  type="新"
                  title="新增 Claude 3.5 模型支持"
                  desc="我们已接入 Claude 3.5 Sonnet 模型,欢迎体验..."
                  time="2024-05-28 10:15"
                />
                <AnnouncementItem
                  type="价格"
                  title="价格调整通知"
                  desc="自 2024-06-01 起,部分模型的费用将进行调..."
                  time="2024-05-25 16:45"
                />
              </ul>
            </div>
          </div>

          {/* 三个表格:订单 / 渠道 / 日志 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
            {/* 最近订单 */}
            <div className="lg:col-span-6 bg-white rounded-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-gray-900">最近订单</h3>
                <a href="#" className="text-[12px] text-primary">
                  更多
                </a>
              </div>
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="text-gray-500 text-left">
                    <th className="font-normal pb-3">订单号</th>
                    <th className="font-normal pb-3">用户</th>
                    <th className="font-normal pb-3 text-right">金额</th>
                    <th className="font-normal pb-3">支付方式</th>
                    <th className="font-normal pb-3">状态</th>
                    <th className="font-normal pb-3 text-right">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: "#202405310001",
                      user: "user_***@gmail.com",
                      amount: "¥ 100.00",
                      method: "支付宝",
                      status: "已支付",
                      time: "2024-05-31 14:22",
                    },
                    {
                      id: "#202405310002",
                      user: "user_***@163.com",
                      amount: "¥ 500.00",
                      method: "微信支付",
                      status: "已支付",
                      time: "2024-05-31 14:18",
                    },
                    {
                      id: "#202405310003",
                      user: "user_***@outlook.com",
                      amount: "¥ 1000.00",
                      method: "支付宝",
                      status: "已支付",
                      time: "2024-05-31 14:15",
                    },
                    {
                      id: "#202405310004",
                      user: "user_***@qq.com",
                      amount: "¥ 200.00",
                      method: "余额支付",
                      status: "已支付",
                      time: "2024-05-31 14:10",
                    },
                    {
                      id: "#202405310005",
                      user: "user_***@gmail.com",
                      amount: "¥ 300.00",
                      method: "微信支付",
                      status: "已支付",
                      time: "2024-05-31 14:08",
                    },
                  ].map((o) => (
                    <tr key={o.id} className="border-t border-gray-50">
                      <td className="py-2.5 text-gray-900 font-mono text-[11.5px]">
                        {o.id}
                      </td>
                      <td className="py-2.5 text-gray-600">{o.user}</td>
                      <td className="py-2.5 text-right font-medium text-gray-900">
                        {o.amount}
                      </td>
                      <td className="py-2.5 text-gray-600">{o.method}</td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 text-success">
                          <span className="w-1.5 h-1.5 rounded-full bg-success" />
                          {o.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-gray-500 text-[11.5px]">
                        {o.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 渠道状态 */}
            <div className="lg:col-span-3 bg-white rounded-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-gray-900">渠道状态</h3>
                <a href="#" className="text-[12px] text-primary">
                  更多
                </a>
              </div>
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="text-gray-500 text-left">
                    <th className="font-normal pb-3">渠道名称</th>
                    <th className="font-normal pb-3">状态</th>
                    <th className="font-normal pb-3 text-right">响应时间</th>
                    <th className="font-normal pb-3 text-right">今日调用</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "OpenAI 官方", status: "正常", rt: "295ms", count: "2,345,678" },
                    { name: "Anthropic", status: "正常", rt: "312ms", count: "1,234,567" },
                    { name: "Google Gemini", status: "正常", rt: "198ms", count: "1,987,654" },
                    { name: "Azure OpenAI", status: "正常", rt: "285ms", count: "1,456,789" },
                    { name: "智谱 AI", status: "正常", rt: "345ms", count: "876,543" },
                  ].map((c) => (
                    <tr key={c.name} className="border-t border-gray-50">
                      <td className="py-2.5 text-gray-900">{c.name}</td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 text-success">
                          <span className="w-1.5 h-1.5 rounded-full bg-success" />
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-gray-600 font-mono text-[11.5px]">
                        {c.rt}
                      </td>
                      <td className="py-2.5 text-right text-gray-900 font-mono text-[11.5px]">
                        {c.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 操作日志 */}
            <div className="lg:col-span-3 bg-white rounded-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-gray-900">操作日志</h3>
                <a href="#" className="text-[12px] text-primary">
                  更多
                </a>
              </div>
              <ul className="space-y-3">
                {[
                  { icon: "🛡", title: "Admin 登录了系统", time: "2024-05-31 14:30:22", ip: "127.0.0.1" },
                  { icon: "💰", title: "更新了模型价格", time: "2024-05-31 14:25:18", ip: "127.0.0.1" },
                  { icon: "🔑", title: "创建了新的 API Key", time: "2024-05-31 14:20:45", ip: "127.0.0.1" },
                  { icon: "👤", title: "删除了用户 user_123", time: "2024-05-31 14:15:33", ip: "127.0.0.1" },
                  { icon: "⚙️", title: "更新了系统设置", time: "2024-05-31 14:10:27", ip: "127.0.0.1" },
                ].map((l, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 bg-primary-50 rounded flex items-center justify-center text-[14px] flex-shrink-0">
                      {l.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] text-gray-900 truncate">
                        {l.title}
                      </div>
                      <div className="text-[10.5px] text-gray-400 font-mono">
                        {l.time}
                      </div>
                    </div>
                    <div className="text-[10.5px] text-gray-400 font-mono mt-1">
                      {l.ip}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>

        {/* 页脚 */}
        <footer className="h-12 bg-white border-t border-gray-100 px-6 flex items-center justify-between text-[12px] text-gray-400 flex-shrink-0">
          <span>© 2024 ToAiAPI. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-primary">文档中心</a>
            <a href="#" className="hover:text-primary">帮助中心</a>
            <a href="#" className="hover:text-primary">关于我们</a>
            <span className="text-gray-300">v2.1.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ============== 小组件 ============== */

function DateRangePicker() {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded px-3 py-2 text-[12.5px] text-gray-600">
      <IconCalendar size={14} className="text-primary" />
      <span>2024-05-01</span>
      <span className="text-gray-400">~</span>
      <span>2024-05-31</span>
    </div>
  );
}

function MetricCard({
  icon,
  iconBg,
  label,
  value,
  growth,
  positive,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  growth: string;
  positive: boolean;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 ${iconBg} rounded flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-[12.5px] text-gray-500">{label}</span>
      </div>
      <div className="text-[20px] font-bold text-gray-900 leading-tight mb-2">
        {value}
      </div>
      <div className="flex items-center gap-1.5 text-[11px]">
        <span className={positive ? "text-success" : "text-red-500"}>{growth}</span>
        <span className="text-gray-400">{sub}</span>
      </div>
    </div>
  );
}

function AnnouncementItem({
  type,
  title,
  desc,
  time,
}: {
  type: string;
  title: string;
  desc: string;
  time: string;
}) {
  const typeColor: Record<string, string> = {
    系统: "bg-primary",
    新: "bg-orange",
    价格: "bg-warning",
  };
  return (
    <li>
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`${typeColor[type] || "bg-primary"} text-white text-[9px] font-bold px-1.5 py-0.5 rounded`}
        >
          {type}
        </span>
        <span className="text-[12.5px] font-medium text-gray-900">{title}</span>
      </div>
      <p className="text-[11.5px] text-gray-500 leading-[1.6] mb-1 line-clamp-2">
        {desc}
      </p>
      <div className="text-[10.5px] text-gray-400 font-mono">{time}</div>
    </li>
  );
}

/* ============== 折线图 (像素艺术) ============== */
function LineChart() {
  // 31 天数据 (高值波动)
  const data = [
    900, 950, 1100, 1050, 1200, 1300, 1150, 1000, 950, 1100, 1250, 1400, 1350, 1200, 1100,
    1234, 1300, 1450, 1400, 1350, 1280, 1300, 1450, 1600, 1550, 1480, 1500, 1650, 1700, 1620, 1750,
  ];
  const max = 2000;
  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const stepX = chartW / (data.length - 1);

  const points = data.map((v, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + chartH - (v / max) * chartH,
  }));

  // 折线路径
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  // 平滑区域
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  // 网格 Y 轴
  const yLines = [0, 500, 1000, 1500, 2000];
  // X 轴标签
  const xLabels = ["05-01", "05-06", "05-11", "05-16", "05-21", "05-26", "05-31"];

  // 05-16 高亮点 (index 15)
  const highlight = points[15];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[240px]" style={{ shapeRendering: "geometricPrecision" }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2962FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2962FF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 网格线 */}
        {yLines.map((v, i) => {
          const y = padding.top + chartH - (v / max) * chartH;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#F0F4F8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text x={padding.left - 8} y={y + 3} fontSize="10" fill="#8A9BA8" textAnchor="end">
                {v >= 1000 ? `${v / 1000}M` : `${v}K`}
              </text>
            </g>
          );
        })}

        {/* X 轴标签 */}
        {xLabels.map((l, i) => {
          const x = padding.left + (chartW * i) / (xLabels.length - 1);
          return (
            <text
              key={i}
              x={x}
              y={height - 8}
              fontSize="10"
              fill="#8A9BA8"
              textAnchor="middle"
            >
              {l}
            </text>
          );
        })}

        {/* 面积 */}
        <path d={areaPath} fill="url(#lineGrad)" />

        {/* 折线 */}
        <path
          d={linePath}
          fill="none"
          stroke="#2962FF"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* 数据点 */}
        {points.map((p, i) => (
          <rect
            key={i}
            x={p.x - 2}
            y={p.y - 2}
            width="4"
            height="4"
            fill="#fff"
            stroke="#2962FF"
            strokeWidth="1.5"
          />
        ))}

        {/* 高亮标记 */}
        <line
          x1={highlight.x}
          y1={padding.top}
          x2={highlight.x}
          y2={height - padding.bottom}
          stroke="#2962FF"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.6"
        />
        <rect
          x={highlight.x - 4}
          y={highlight.y - 4}
          width="8"
          height="8"
          fill="#2962FF"
          stroke="#fff"
          strokeWidth="2"
        />
      </svg>
      {/* 高亮 tooltip */}
      <div
        className="absolute"
        style={{
          left: `${(highlight.x / width) * 100}%`,
          top: `${(highlight.y / height) * 100}%`,
          transform: "translate(-90%, -130%)",
        }}
      >
        <div className="text-[10.5px] text-gray-500 mb-0.5">05-16</div>
        <div className="bg-primary text-white text-[10.5px] px-2 py-1 rounded shadow-sm">
          <div className="font-medium">调用次数: 1,234,567</div>
        </div>
      </div>
    </div>
  );
}

/* ============== 圆环图 ============== */
function DonutChart() {
  const data = [
    { name: "GPT-4o", value: 35.6, color: "#2962FF" },
    { name: "Claude 3.5", value: 24.3, color: "#FF9800" },
    { name: "Gemini 1.5", value: 15.8, color: "#4CAF50" },
    { name: "GPT-4 Turbo", value: 12.6, color: "#9C27B0" },
    { name: "其他", value: 11.7, color: "#03A9F4" },
  ];

  const size = 130;
  const radius = 50;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div>
      <div className="flex items-center justify-center mb-3">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
            {data.map((d, i) => {
              const dash = (d.value / 100) * circumference;
              const gap = circumference - dash;
              const seg = (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += dash;
              return seg;
            })}
            {/* 背景环 */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#F0F4F8"
              strokeWidth={strokeWidth}
              opacity="0.4"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[10.5px] text-gray-500">总计</div>
            <div className="text-[13px] font-bold text-gray-900">98,765,432</div>
          </div>
        </div>
      </div>
      <ul className="space-y-1.5">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-[11.5px]">
            <span
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ background: d.color }}
            />
            <span className="text-gray-700 flex-1 truncate">{d.name}</span>
            <span className="text-gray-500 font-mono">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
