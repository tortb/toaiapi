import * as React from "react";
const baseProps = (size, className) => ({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className: className,
    style: { shapeRendering: "crispEdges" },
});
/* ============== 基础图标 ============== */
export const IconMenu = ({ size = 20, className }) => (<svg {...baseProps(size, className)}>
    <rect x="3" y="5" width="18" height="2" fill="currentColor"/>
    <rect x="3" y="11" width="18" height="2" fill="currentColor"/>
    <rect x="3" y="17" width="18" height="2" fill="currentColor"/>
  </svg>);
export const IconSearch = ({ size = 20, className }) => (<svg {...baseProps(size, className)}>
    <rect x="9" y="3" width="2" height="2" fill="currentColor"/>
    <rect x="7" y="5" width="2" height="2" fill="currentColor"/>
    <rect x="5" y="7" width="2" height="2" fill="currentColor"/>
    <rect x="5" y="9" width="2" height="2" fill="currentColor"/>
    <rect x="5" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="5" y="13" width="2" height="2" fill="currentColor"/>
    <rect x="7" y="15" width="2" height="2" fill="currentColor"/>
    <rect x="9" y="17" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="17" width="4" height="2" fill="currentColor"/>
    <rect x="15" y="15" width="2" height="2" fill="currentColor"/>
    <rect x="17" y="13" width="2" height="2" fill="currentColor"/>
  </svg>);
export const IconBell = ({ size = 20, className }) => (<svg {...baseProps(size, className)}>
    <rect x="8" y="3" width="8" height="2" fill="currentColor"/>
    <rect x="6" y="5" width="12" height="2" fill="currentColor"/>
    <rect x="5" y="7" width="14" height="10" fill="currentColor"/>
    <rect x="10" y="2" width="4" height="1" fill="currentColor"/>
    <rect x="7" y="17" width="10" height="2" fill="currentColor"/>
    <rect x="9" y="19" width="6" height="2" fill="currentColor"/>
    <rect x="10" y="21" width="4" height="1" fill="currentColor"/>
  </svg>);
export const IconSettings = ({ size = 20, className }) => (<svg {...baseProps(size, className)}>
    <rect x="10" y="2" width="4" height="2" fill="currentColor"/>
    <rect x="9" y="4" width="2" height="2" fill="currentColor"/>
    <rect x="13" y="4" width="2" height="2" fill="currentColor"/>
    <rect x="6" y="6" width="2" height="2" fill="currentColor"/>
    <rect x="16" y="6" width="2" height="2" fill="currentColor"/>
    <rect x="4" y="8" width="2" height="2" fill="currentColor"/>
    <rect x="18" y="8" width="2" height="2" fill="currentColor"/>
    <rect x="3" y="10" width="2" height="2" fill="currentColor"/>
    <rect x="7" y="10" width="10" height="6" fill="currentColor"/>
    <rect x="19" y="10" width="2" height="2" fill="currentColor"/>
    <rect x="3" y="12" width="2" height="2" fill="currentColor"/>
    <rect x="19" y="12" width="2" height="2" fill="currentColor"/>
    <rect x="4" y="14" width="2" height="2" fill="currentColor"/>
    <rect x="18" y="14" width="2" height="2" fill="currentColor"/>
    <rect x="6" y="16" width="2" height="2" fill="currentColor"/>
    <rect x="16" y="16" width="2" height="2" fill="currentColor"/>
    <rect x="9" y="18" width="2" height="2" fill="currentColor"/>
    <rect x="13" y="18" width="2" height="2" fill="currentColor"/>
    <rect x="10" y="20" width="4" height="2" fill="currentColor"/>
  </svg>);
export const IconChevronDown = ({ size = 14, className }) => (<svg {...baseProps(size, className)}>
    <rect x="6" y="9" width="2" height="2" fill="currentColor"/>
    <rect x="8" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="10" y="13" width="2" height="2" fill="currentColor"/>
    <rect x="12" y="13" width="2" height="2" fill="currentColor"/>
    <rect x="14" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="16" y="9" width="2" height="2" fill="currentColor"/>
  </svg>);
export const IconArrowRight = ({ size = 14, className }) => (<svg {...baseProps(size, className)}>
    <rect x="14" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="12" y="9" width="2" height="2" fill="currentColor"/>
    <rect x="10" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="2" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="4" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="6" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="8" y="11" width="2" height="2" fill="currentColor"/>
  </svg>);
export const IconRefresh = ({ size = 14, className }) => (<svg {...baseProps(size, className)}>
    <rect x="10" y="3" width="4" height="2" fill="currentColor"/>
    <rect x="8" y="5" width="2" height="2" fill="currentColor"/>
    <rect x="14" y="5" width="2" height="2" fill="currentColor"/>
    <rect x="6" y="7" width="2" height="2" fill="currentColor"/>
    <rect x="16" y="7" width="2" height="2" fill="currentColor"/>
    <rect x="4" y="9" width="2" height="2" fill="currentColor"/>
    <rect x="18" y="9" width="2" height="2" fill="currentColor"/>
    <rect x="3" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="19" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="3" y="13" width="2" height="2" fill="currentColor"/>
    <rect x="19" y="13" width="2" height="2" fill="currentColor"/>
    <rect x="4" y="15" width="2" height="2" fill="currentColor"/>
    <rect x="18" y="15" width="2" height="2" fill="currentColor"/>
    <rect x="6" y="17" width="2" height="2" fill="currentColor"/>
    <rect x="16" y="17" width="2" height="2" fill="currentColor"/>
    <rect x="8" y="19" width="2" height="2" fill="currentColor"/>
    <rect x="14" y="19" width="2" height="2" fill="currentColor"/>
    <rect x="10" y="21" width="4" height="2" fill="currentColor"/>
  </svg>);
export const IconCalendar = ({ size = 16, className }) => (<svg {...baseProps(size, className)}>
    <rect x="4" y="3" width="2" height="2" fill="currentColor"/>
    <rect x="18" y="3" width="2" height="2" fill="currentColor"/>
    <rect x="3" y="5" width="18" height="2" fill="currentColor"/>
    <rect x="3" y="7" width="18" height="14" fill="currentColor"/>
    <rect x="5" y="9" width="3" height="3" fill="#fff"/>
    <rect x="10" y="9" width="3" height="3" fill="#fff"/>
    <rect x="15" y="9" width="3" height="3" fill="#fff"/>
    <rect x="5" y="14" width="3" height="3" fill="#fff"/>
    <rect x="10" y="14" width="3" height="3" fill="#fff"/>
    <rect x="15" y="14" width="3" height="3" fill="#fff"/>
  </svg>);
export const IconMore = ({ size = 16, className }) => (<svg {...baseProps(size, className)}>
    <rect x="4" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="18" y="11" width="2" height="2" fill="currentColor"/>
  </svg>);
/* ============== Logo ============== */
export const ToAiAPILogo = ({ size = 32 }) => (<svg width={size} height={size} viewBox="0 0 32 32" style={{ shapeRendering: "crispEdges" }}>
    <rect x="2" y="2" width="28" height="28" rx="4" fill="#2962FF"/>
    <rect x="6" y="6" width="6" height="6" fill="#fff"/>
    <rect x="20" y="6" width="6" height="6" fill="#fff"/>
    <rect x="6" y="14" width="6" height="6" fill="#fff"/>
    <rect x="20" y="14" width="6" height="6" fill="#fff"/>
    <rect x="6" y="22" width="6" height="2" fill="#fff"/>
    <rect x="20" y="22" width="6" height="2" fill="#fff"/>
    <rect x="13" y="10" width="6" height="12" fill="#fff"/>
  </svg>);
/* ============== 数据卡片图标 ============== */
export const IconUsers = ({ size = 20, className }) => (<svg {...baseProps(size, className)}>
    <rect x="6" y="4" width="6" height="2" fill="currentColor"/>
    <rect x="4" y="6" width="2" height="2" fill="currentColor"/>
    <rect x="12" y="6" width="2" height="2" fill="currentColor"/>
    <rect x="3" y="8" width="2" height="4" fill="currentColor"/>
    <rect x="13" y="8" width="2" height="4" fill="currentColor"/>
    <rect x="5" y="8" width="8" height="6" fill="currentColor"/>
    <rect x="4" y="14" width="10" height="4" fill="currentColor"/>
    <rect x="16" y="4" width="2" height="2" fill="currentColor" opacity="0.5"/>
    <rect x="18" y="6" width="2" height="4" fill="currentColor" opacity="0.5"/>
    <rect x="16" y="10" width="4" height="6" fill="currentColor" opacity="0.5"/>
  </svg>);
export const IconWallet = ({ size = 20, className }) => (<svg {...baseProps(size, className)}>
    <rect x="3" y="6" width="18" height="2" fill="currentColor"/>
    <rect x="2" y="8" width="20" height="12" fill="currentColor"/>
    <rect x="4" y="10" width="16" height="8" fill="#fff"/>
    <rect x="14" y="12" width="6" height="4" fill="currentColor"/>
    <rect x="15" y="13" width="2" height="2" fill="#FFC107"/>
    <rect x="3" y="20" width="18" height="2" fill="currentColor"/>
  </svg>);
export const IconChartBar = ({ size = 20, className }) => (<svg {...baseProps(size, className)}>
    <rect x="3" y="14" width="3" height="6" fill="currentColor"/>
    <rect x="7" y="10" width="3" height="10" fill="currentColor"/>
    <rect x="11" y="6" width="3" height="14" fill="currentColor"/>
    <rect x="15" y="3" width="3" height="17" fill="currentColor"/>
    <rect x="3" y="20" width="18" height="1" fill="currentColor"/>
  </svg>);
export const IconChartLine = ({ size = 20, className }) => (<svg {...baseProps(size, className)}>
    <rect x="3" y="3" width="1" height="18" fill="currentColor" opacity="0.3"/>
    <rect x="3" y="20" width="18" height="1" fill="currentColor" opacity="0.3"/>
    <rect x="4" y="16" width="2" height="2" fill="currentColor"/>
    <rect x="6" y="14" width="2" height="2" fill="currentColor"/>
    <rect x="8" y="12" width="2" height="2" fill="currentColor"/>
    <rect x="10" y="14" width="2" height="2" fill="currentColor"/>
    <rect x="12" y="10" width="2" height="2" fill="currentColor"/>
    <rect x="14" y="8" width="2" height="2" fill="currentColor"/>
    <rect x="16" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="18" y="6" width="2" height="2" fill="currentColor"/>
  </svg>);
export const IconCoin = ({ size = 20, className }) => (<svg {...baseProps(size, className)}>
    <circle cx="12" cy="12" r="9" fill="currentColor"/>
    <circle cx="12" cy="12" r="6" fill="#fff"/>
    <rect x="11" y="6" width="2" height="12" fill="currentColor"/>
    <rect x="6" y="11" width="12" height="2" fill="currentColor"/>
  </svg>);
/* ============== 侧边栏图标 ============== */
export const IconDashboard = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <rect x="3" y="3" width="8" height="8" fill="currentColor"/>
    <rect x="13" y="3" width="8" height="8" fill="currentColor"/>
    <rect x="3" y="13" width="8" height="8" fill="currentColor"/>
    <rect x="13" y="13" width="8" height="8" fill="currentColor"/>
  </svg>);
export const IconUserList = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <rect x="6" y="4" width="6" height="2" fill="currentColor"/>
    <rect x="4" y="6" width="2" height="2" fill="currentColor"/>
    <rect x="12" y="6" width="2" height="2" fill="currentColor"/>
    <rect x="3" y="8" width="2" height="2" fill="currentColor"/>
    <rect x="13" y="8" width="2" height="2" fill="currentColor"/>
    <rect x="4" y="10" width="10" height="4" fill="currentColor"/>
    <rect x="3" y="14" width="12" height="2" fill="currentColor"/>
    <rect x="3" y="18" width="2" height="2" fill="currentColor"/>
    <rect x="7" y="18" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="18" width="2" height="2" fill="currentColor"/>
    <rect x="3" y="20" width="12" height="1" fill="currentColor"/>
  </svg>);
export const IconUserGroup = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <rect x="3" y="5" width="2" height="2" fill="currentColor"/>
    <rect x="3" y="9" width="2" height="2" fill="currentColor"/>
    <rect x="3" y="13" width="2" height="2" fill="currentColor"/>
    <rect x="3" y="17" width="2" height="2" fill="currentColor"/>
    <rect x="5" y="4" width="2" height="2" fill="currentColor"/>
    <rect x="5" y="8" width="2" height="2" fill="currentColor"/>
    <rect x="5" y="12" width="2" height="2" fill="currentColor"/>
    <rect x="5" y="16" width="2" height="2" fill="currentColor"/>
    <rect x="7" y="6" width="2" height="2" fill="currentColor"/>
    <rect x="9" y="5" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="4" width="2" height="2" fill="currentColor"/>
    <rect x="13" y="5" width="2" height="2" fill="currentColor"/>
    <rect x="15" y="6" width="2" height="2" fill="currentColor"/>
    <rect x="17" y="8" width="2" height="2" fill="currentColor"/>
    <rect x="19" y="9" width="2" height="2" fill="currentColor"/>
  </svg>);
export const IconKey = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <circle cx="6" cy="12" r="3" fill="currentColor"/>
    <circle cx="6" cy="12" r="1" fill="#fff"/>
    <rect x="9" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="13" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="15" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="17" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="19" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="15" y="9" width="2" height="2" fill="currentColor"/>
    <rect x="17" y="7" width="2" height="2" fill="currentColor"/>
  </svg>);
export const IconOrders = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <rect x="5" y="3" width="14" height="18" fill="currentColor"/>
    <rect x="7" y="5" width="10" height="2" fill="#fff"/>
    <rect x="7" y="9" width="10" height="1" fill="#fff"/>
    <rect x="7" y="12" width="10" height="1" fill="#fff"/>
    <rect x="7" y="15" width="10" height="1" fill="#fff"/>
    <rect x="7" y="18" width="6" height="1" fill="#fff"/>
  </svg>);
export const IconRecharge = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <rect x="3" y="6" width="18" height="12" fill="currentColor"/>
    <rect x="3" y="9" width="18" height="1" fill="#fff"/>
    <rect x="11" y="12" width="2" height="4" fill="#fff"/>
    <rect x="9" y="14" width="6" height="2" fill="#fff"/>
  </svg>);
export const IconBill = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <rect x="4" y="3" width="14" height="18" fill="currentColor"/>
    <rect x="4" y="3" width="14" height="2" fill="#fff"/>
    <rect x="6" y="7" width="2" height="2" fill="#fff"/>
    <rect x="10" y="7" width="6" height="2" fill="#fff"/>
    <rect x="6" y="11" width="2" height="2" fill="#fff"/>
    <rect x="10" y="11" width="6" height="2" fill="#fff"/>
    <rect x="6" y="15" width="2" height="2" fill="#fff"/>
    <rect x="10" y="15" width="6" height="2" fill="#fff"/>
  </svg>);
export const IconInvoice = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <rect x="4" y="3" width="16" height="2" fill="currentColor"/>
    <rect x="4" y="5" width="16" height="14" fill="currentColor"/>
    <rect x="6" y="19" width="2" height="2" fill="currentColor"/>
    <rect x="10" y="19" width="2" height="2" fill="currentColor"/>
    <rect x="14" y="19" width="2" height="2" fill="currentColor"/>
    <rect x="18" y="19" width="2" height="2" fill="currentColor"/>
    <rect x="6" y="7" width="6" height="2" fill="#fff"/>
    <rect x="6" y="11" width="12" height="1" fill="#fff"/>
    <rect x="6" y="13" width="12" height="1" fill="#fff"/>
    <rect x="6" y="15" width="8" height="1" fill="#fff"/>
  </svg>);
export const IconModel = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
    <circle cx="12" cy="5" r="2" fill="currentColor"/>
    <circle cx="12" cy="19" r="2" fill="currentColor"/>
    <circle cx="5" cy="12" r="2" fill="currentColor"/>
    <circle cx="19" cy="12" r="2" fill="currentColor"/>
    <rect x="11" y="6" width="2" height="3" fill="currentColor"/>
    <rect x="11" y="15" width="2" height="3" fill="currentColor"/>
    <rect x="6" y="11" width="3" height="2" fill="currentColor"/>
    <rect x="15" y="11" width="3" height="2" fill="currentColor"/>
  </svg>);
export const IconChannel = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <rect x="3" y="9" width="4" height="6" fill="currentColor"/>
    <rect x="9" y="5" width="4" height="14" fill="currentColor"/>
    <rect x="15" y="11" width="4" height="2" fill="currentColor"/>
    <rect x="15" y="7" width="4" height="2" fill="currentColor"/>
    <rect x="15" y="15" width="4" height="2" fill="currentColor"/>
  </svg>);
export const IconPrice = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <rect x="4" y="3" width="16" height="18" fill="currentColor"/>
    <rect x="4" y="3" width="16" height="2" fill="#fff"/>
    <rect x="11" y="7" width="2" height="2" fill="#fff"/>
    <rect x="9" y="9" width="6" height="2" fill="#fff"/>
    <rect x="9" y="12" width="2" height="2" fill="#fff"/>
    <rect x="9" y="14" width="2" height="2" fill="#fff"/>
    <rect x="11" y="14" width="2" height="2" fill="#fff"/>
    <rect x="13" y="14" width="2" height="2" fill="#fff"/>
    <rect x="9" y="16" width="6" height="2" fill="#fff"/>
  </svg>);
export const IconSystem = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
    <rect x="11" y="3" width="2" height="3" fill="currentColor"/>
    <rect x="11" y="18" width="2" height="3" fill="currentColor"/>
    <rect x="3" y="11" width="3" height="2" fill="currentColor"/>
    <rect x="18" y="11" width="3" height="2" fill="currentColor"/>
    <rect x="5" y="5" width="2" height="2" fill="currentColor"/>
    <rect x="17" y="5" width="2" height="2" fill="currentColor"/>
    <rect x="5" y="17" width="2" height="2" fill="currentColor"/>
    <rect x="17" y="17" width="2" height="2" fill="currentColor"/>
  </svg>);
export const IconLog = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <rect x="4" y="3" width="16" height="18" fill="currentColor"/>
    <rect x="6" y="5" width="12" height="1" fill="#fff"/>
    <rect x="6" y="8" width="12" height="1" fill="#fff"/>
    <rect x="6" y="11" width="12" height="1" fill="#fff"/>
    <rect x="6" y="14" width="12" height="1" fill="#fff"/>
    <rect x="6" y="17" width="8" height="1" fill="#fff"/>
  </svg>);
export const IconMonitor = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <rect x="3" y="4" width="18" height="13" fill="currentColor"/>
    <rect x="5" y="6" width="14" height="9" fill="#fff"/>
    <rect x="7" y="8" width="3" height="2" fill="currentColor"/>
    <rect x="12" y="8" width="5" height="1" fill="currentColor"/>
    <rect x="12" y="10" width="3" height="1" fill="currentColor"/>
    <rect x="7" y="11" width="2" height="1" fill="currentColor"/>
    <rect x="10" y="12" width="7" height="1" fill="currentColor"/>
    <rect x="9" y="17" width="6" height="2" fill="currentColor"/>
    <rect x="7" y="19" width="10" height="2" fill="currentColor"/>
  </svg>);
export const IconBack = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <rect x="11" y="5" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="17" width="2" height="2" fill="currentColor"/>
    <rect x="9" y="7" width="2" height="2" fill="currentColor"/>
    <rect x="9" y="15" width="2" height="2" fill="currentColor"/>
    <rect x="7" y="9" width="2" height="2" fill="currentColor"/>
    <rect x="7" y="13" width="2" height="2" fill="currentColor"/>
    <rect x="5" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="13" y="11" width="8" height="2" fill="currentColor"/>
  </svg>);
/* ============== 价值柱图标 ============== */
export const IconShield = ({ size = 24, className }) => (<svg {...baseProps(size, className)}>
    <rect x="6" y="3" width="12" height="2" fill="currentColor"/>
    <rect x="5" y="5" width="2" height="2" fill="currentColor"/>
    <rect x="17" y="5" width="2" height="2" fill="currentColor"/>
    <rect x="4" y="7" width="2" height="8" fill="currentColor"/>
    <rect x="18" y="7" width="2" height="8" fill="currentColor"/>
    <rect x="6" y="15" width="2" height="2" fill="currentColor"/>
    <rect x="16" y="15" width="2" height="2" fill="currentColor"/>
    <rect x="8" y="17" width="8" height="2" fill="currentColor"/>
    <rect x="10" y="19" width="4" height="2" fill="currentColor"/>
    <rect x="11" y="9" width="2" height="2" fill="#fff"/>
    <rect x="11" y="11" width="2" height="3" fill="#fff"/>
  </svg>);
export const IconCloud = ({ size = 24, className }) => (<svg {...baseProps(size, className)}>
    <rect x="6" y="7" width="2" height="2" fill="currentColor"/>
    <rect x="8" y="5" width="4" height="2" fill="currentColor"/>
    <rect x="12" y="3" width="6" height="2" fill="currentColor"/>
    <rect x="16" y="5" width="2" height="2" fill="currentColor"/>
    <rect x="4" y="9" width="16" height="2" fill="currentColor"/>
    <rect x="3" y="11" width="18" height="6" fill="currentColor"/>
    <rect x="5" y="17" width="14" height="2" fill="currentColor"/>
  </svg>);
export const IconBolt = ({ size = 24, className }) => (<svg {...baseProps(size, className)}>
    <rect x="11" y="3" width="4" height="2" fill="currentColor"/>
    <rect x="9" y="5" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="5" width="2" height="2" fill="currentColor"/>
    <rect x="7" y="7" width="2" height="2" fill="currentColor"/>
    <rect x="9" y="7" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="7" width="2" height="2" fill="currentColor"/>
    <rect x="13" y="7" width="2" height="2" fill="currentColor"/>
    <rect x="5" y="9" width="2" height="2" fill="currentColor"/>
    <rect x="7" y="9" width="2" height="2" fill="currentColor"/>
    <rect x="9" y="9" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="9" width="2" height="2" fill="currentColor"/>
    <rect x="13" y="9" width="2" height="2" fill="currentColor"/>
    <rect x="7" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="9" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="13" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="15" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="9" y="13" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="13" width="2" height="2" fill="currentColor"/>
    <rect x="13" y="13" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="15" width="2" height="2" fill="currentColor"/>
    <rect x="13" y="15" width="2" height="2" fill="currentColor"/>
    <rect x="9" y="15" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="17" width="2" height="2" fill="currentColor"/>
    <rect x="13" y="17" width="2" height="2" fill="currentColor"/>
    <rect x="15" y="17" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="19" width="2" height="2" fill="currentColor"/>
    <rect x="13" y="19" width="2" height="2" fill="currentColor"/>
  </svg>);
export const IconCheck = ({ size = 16, className }) => (<svg {...baseProps(size, className)}>
    <rect x="3" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="5" y="13" width="2" height="2" fill="currentColor"/>
    <rect x="7" y="11" width="2" height="2" fill="currentColor"/>
    <rect x="9" y="9" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="7" width="2" height="2" fill="currentColor"/>
    <rect x="13" y="5" width="2" height="2" fill="currentColor"/>
    <rect x="15" y="3" width="2" height="2" fill="currentColor"/>
  </svg>);
export const IconStar = ({ size = 14, className }) => (<svg {...baseProps(size, className)}>
    <rect x="10" y="2" width="4" height="2" fill="currentColor"/>
    <rect x="8" y="4" width="2" height="2" fill="currentColor"/>
    <rect x="14" y="4" width="2" height="2" fill="currentColor"/>
    <rect x="6" y="6" width="2" height="2" fill="currentColor"/>
    <rect x="16" y="6" width="2" height="2" fill="currentColor"/>
    <rect x="2" y="10" width="20" height="2" fill="currentColor"/>
    <rect x="4" y="12" width="2" height="6" fill="currentColor"/>
    <rect x="18" y="12" width="2" height="6" fill="currentColor"/>
    <rect x="6" y="18" width="2" height="2" fill="currentColor"/>
    <rect x="16" y="18" width="2" height="2" fill="currentColor"/>
    <rect x="8" y="20" width="2" height="2" fill="currentColor"/>
    <rect x="14" y="20" width="2" height="2" fill="currentColor"/>
  </svg>);
export const IconQuote = ({ size = 18, className }) => (<svg {...baseProps(size, className)}>
    <rect x="3" y="6" width="2" height="2" fill="currentColor"/>
    <rect x="5" y="4" width="2" height="2" fill="currentColor"/>
    <rect x="7" y="3" width="2" height="2" fill="currentColor"/>
    <rect x="9" y="3" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="4" width="2" height="2" fill="currentColor"/>
    <rect x="11" y="6" width="2" height="2" fill="currentColor"/>
    <rect x="3" y="8" width="8" height="6" fill="currentColor"/>
    <rect x="5" y="14" width="6" height="2" fill="currentColor"/>
    <rect x="4" y="16" width="2" height="2" fill="currentColor"/>
    <rect x="5" y="18" width="2" height="2" fill="currentColor"/>
  </svg>);
export const IconLogoSmall = ({ size = 14, className }) => (<svg {...baseProps(size, className)}>
    <rect x="2" y="2" width="20" height="20" rx="2" fill="#2962FF"/>
    <rect x="6" y="6" width="5" height="5" fill="#fff"/>
    <rect x="13" y="6" width="5" height="5" fill="#fff"/>
    <rect x="6" y="13" width="5" height="5" fill="#fff"/>
    <rect x="13" y="13" width="5" height="5" fill="#fff"/>
  </svg>);
/* ============== 模型 Logo (像素) ============== */
export const LogoOpenAI = ({ size = 32 }) => (<svg width={size} height={size} viewBox="0 0 32 32" style={{ shapeRendering: "crispEdges" }}>
    <circle cx="16" cy="16" r="14" fill="#10A37F"/>
    <rect x="11" y="8" width="10" height="2" fill="#fff"/>
    <rect x="9" y="10" width="14" height="2" fill="#fff"/>
    <rect x="8" y="12" width="16" height="8" fill="#fff"/>
    <rect x="10" y="20" width="12" height="2" fill="#fff"/>
    <rect x="12" y="22" width="8" height="2" fill="#fff"/>
  </svg>);
export const LogoAnthropic = ({ size = 32 }) => (<svg width={size} height={size} viewBox="0 0 32 32" style={{ shapeRendering: "crispEdges" }}>
    <rect x="2" y="2" width="28" height="28" rx="4" fill="#D97757"/>
    <rect x="8" y="8" width="3" height="16" fill="#fff"/>
    <rect x="13" y="8" width="3" height="12" fill="#fff"/>
    <rect x="18" y="8" width="3" height="8" fill="#fff"/>
    <rect x="8" y="24" width="3" height="2" fill="#fff"/>
    <rect x="18" y="16" width="3" height="2" fill="#fff"/>
  </svg>);
export const LogoGoogle = ({ size = 32 }) => (<svg width={size} height={size} viewBox="0 0 32 32" style={{ shapeRendering: "crispEdges" }}>
    <circle cx="16" cy="16" r="14" fill="#fff" stroke="#e4e9f0" strokeWidth="2"/>
    <rect x="20" y="8" width="6" height="2" fill="#EA4335"/>
    <rect x="24" y="10" width="2" height="4" fill="#FBBC05"/>
    <rect x="24" y="14" width="2" height="4" fill="#34A853"/>
    <rect x="20" y="18" width="6" height="2" fill="#4285F4"/>
    <rect x="18" y="20" width="2" height="6" fill="#4285F4"/>
    <rect x="8" y="16" width="10" height="2" fill="#EA4335"/>
    <rect x="8" y="14" width="2" height="2" fill="#FBBC05"/>
    <rect x="8" y="18" width="2" height="2" fill="#34A853"/>
  </svg>);
export const LogoMeta = ({ size = 32 }) => (<svg width={size} height={size} viewBox="0 0 32 32" style={{ shapeRendering: "crispEdges" }}>
    <rect x="2" y="2" width="28" height="28" rx="4" fill="#0866FF"/>
    <rect x="8" y="14" width="3" height="2" fill="#fff"/>
    <rect x="8" y="16" width="2" height="2" fill="#fff"/>
    <rect x="11" y="12" width="3" height="6" fill="#fff"/>
    <rect x="14" y="11" width="3" height="8" fill="#fff"/>
    <rect x="17" y="12" width="3" height="6" fill="#fff"/>
    <rect x="20" y="14" width="3" height="2" fill="#fff"/>
    <rect x="20" y="16" width="2" height="2" fill="#fff"/>
  </svg>);
export const LogoMixtral = ({ size = 32 }) => (<svg width={size} height={size} viewBox="0 0 32 32" style={{ shapeRendering: "crispEdges" }}>
    <rect x="2" y="2" width="28" height="28" rx="4" fill="#1A1D21"/>
    <rect x="6" y="6" width="4" height="4" fill="#9C27B0"/>
    <rect x="11" y="6" width="4" height="4" fill="#03A9F4"/>
    <rect x="16" y="6" width="4" height="4" fill="#4CAF50"/>
    <rect x="21" y="6" width="4" height="4" fill="#FF9800"/>
    <rect x="6" y="11" width="4" height="4" fill="#FFC107"/>
    <rect x="11" y="11" width="4" height="4" fill="#9C27B0"/>
    <rect x="16" y="11" width="4" height="4" fill="#03A9F4"/>
    <rect x="21" y="11" width="4" height="4" fill="#4CAF50"/>
    <rect x="6" y="16" width="4" height="4" fill="#FF9800"/>
    <rect x="11" y="16" width="4" height="4" fill="#FFC107"/>
    <rect x="16" y="16" width="4" height="4" fill="#9C27B0"/>
    <rect x="21" y="16" width="4" height="4" fill="#03A9F4"/>
    <rect x="6" y="21" width="4" height="4" fill="#4CAF50"/>
    <rect x="11" y="21" width="4" height="4" fill="#FF9800"/>
    <rect x="16" y="21" width="4" height="4" fill="#FFC107"/>
    <rect x="21" y="21" width="4" height="4" fill="#9C27B0"/>
  </svg>);
export const LogoCohere = ({ size = 32 }) => (<svg width={size} height={size} viewBox="0 0 32 32" style={{ shapeRendering: "crispEdges" }}>
    <rect x="2" y="2" width="28" height="28" rx="4" fill="#39594D"/>
    <rect x="8" y="8" width="3" height="3" fill="#fff"/>
    <rect x="13" y="8" width="3" height="3" fill="#fff"/>
    <rect x="18" y="8" width="3" height="3" fill="#fff"/>
    <rect x="23" y="8" width="3" height="3" fill="#fff"/>
    <rect x="8" y="13" width="3" height="3" fill="#fff"/>
    <rect x="13" y="13" width="3" height="3" fill="#FF7759"/>
    <rect x="18" y="13" width="3" height="3" fill="#fff"/>
    <rect x="23" y="13" width="3" height="3" fill="#FF7759"/>
    <rect x="8" y="18" width="3" height="3" fill="#fff"/>
    <rect x="13" y="18" width="3" height="3" fill="#fff"/>
    <rect x="18" y="18" width="3" height="3" fill="#FF7759"/>
    <rect x="23" y="18" width="3" height="3" fill="#fff"/>
  </svg>);
/* ============== 等距 3D 模型 logo ============== */
export const Isometric3DChart = () => (<svg width="500" height="380" viewBox="0 0 500 380" style={{ shapeRendering: "crispEdges" }}>
    {/* 中心立方体 */}
    <g transform="translate(180, 130)">
      {/* 顶面 */}
      <polygon points="70,0 140,35 70,70 0,35" fill="#5B85FF"/>
      {/* 左面 */}
      <polygon points="0,35 70,70 70,140 0,105" fill="#2962FF"/>
      {/* 右面 */}
      <polygon points="70,70 140,35 140,105 70,140" fill="#1E4FE0"/>
      {/* 顶面 ToAiAPI 文字 */}
      <rect x="40" y="20" width="60" height="4" fill="#fff"/>
      <rect x="50" y="28" width="40" height="2" fill="#fff"/>
    </g>

    {/* 立方体边缘高亮 */}
    <g transform="translate(180, 130)" opacity="0.3">
      <polygon points="70,0 140,35 140,40 70,5" fill="#fff"/>
      <polygon points="0,35 0,40 70,75 70,70" fill="#fff"/>
    </g>

    {/* 顶部小立方体 */}
    <g transform="translate(220, 95)">
      <polygon points="35,0 70,17 35,35 0,17" fill="#8AA9FF"/>
      <polygon points="0,17 35,35 35,70 0,52" fill="#5B85FF"/>
      <polygon points="35,35 70,17 70,52 35,70" fill="#2962FF"/>
    </g>

    {/* 周围连接线 - 像素电路 */}
    <g stroke="#2962FF" strokeWidth="2" fill="none" opacity="0.4">
      <line x1="100" y1="200" x2="180" y2="200"/>
      <line x1="320" y1="200" x2="400" y2="200"/>
      <line x1="250" y1="100" x2="250" y2="130"/>
      <line x1="250" y1="270" x2="250" y2="320"/>
    </g>
    <g fill="#2962FF" opacity="0.6">
      <rect x="98" y="198" width="4" height="4"/>
      <rect x="318" y="198" width="4" height="4"/>
      <rect x="248" y="98" width="4" height="4"/>
      <rect x="248" y="318" width="4" height="4"/>
    </g>

    {/* 左上 GPT 标志 */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="60" height="60" rx="6" fill="#fff" stroke="#E4E9F0" strokeWidth="2"/>
      <circle cx="30" cy="30" r="20" fill="none" stroke="#10A37F" strokeWidth="3"/>
      <circle cx="30" cy="30" r="10" fill="#10A37F"/>
      <rect x="28" y="10" width="4" height="20" fill="#10A37F"/>
      <rect x="28" y="30" width="4" height="20" fill="#10A37F"/>
    </g>

    {/* 右上 Claude 标志 */}
    <g transform="translate(390, 60)">
      <rect x="0" y="0" width="60" height="60" rx="6" fill="#fff" stroke="#E4E9F0" strokeWidth="2"/>
      <rect x="15" y="15" width="6" height="30" fill="#D97757"/>
      <rect x="27" y="15" width="6" height="22" fill="#D97757"/>
      <rect x="39" y="15" width="6" height="14" fill="#D97757"/>
    </g>

    {/* 左下 Google 标志 */}
    <g transform="translate(40, 230)">
      <rect x="0" y="0" width="60" height="60" rx="6" fill="#fff" stroke="#E4E9F0" strokeWidth="2"/>
      <circle cx="30" cy="30" r="14" fill="#fff" stroke="#4285F4" strokeWidth="3"/>
      <path d="M30,16 L30,30 L42,30" stroke="#EA4335" strokeWidth="3" fill="none"/>
      <path d="M30,44 L30,30 L42,30" stroke="#FBBC05" strokeWidth="3" fill="none"/>
      <path d="M30,44 L30,30 L18,30" stroke="#34A853" strokeWidth="3" fill="none"/>
    </g>

    {/* 右下 Mistral 雪花 */}
    <g transform="translate(390, 230)">
      <rect x="0" y="0" width="60" height="60" rx="6" fill="#fff" stroke="#E4E9F0" strokeWidth="2"/>
      <g transform="translate(30, 30)" stroke="#1A1D21" strokeWidth="2">
        <line x1="0" y1="-15" x2="0" y2="15"/>
        <line x1="-15" y1="0" x2="15" y2="0"/>
        <line x1="-10" y1="-10" x2="10" y2="10"/>
        <line x1="-10" y1="10" x2="10" y2="-10"/>
        <circle cx="0" cy="0" r="3" fill="#1A1D21"/>
      </g>
    </g>

    {/* 底面网格 */}
    <g opacity="0.15">
      <polygon points="0,330 250,260 500,330 250,400" fill="none" stroke="#2962FF" strokeWidth="1"/>
      <line x1="100" y1="310" x2="350" y2="240" stroke="#2962FF" strokeWidth="1"/>
      <line x1="150" y1="345" x2="400" y2="275" stroke="#2962FF" strokeWidth="1"/>
      <line x1="200" y1="380" x2="450" y2="310" stroke="#2962FF" strokeWidth="1"/>
    </g>
  </svg>);
/* ============== 二维码占位 ============== */
export const QRCode = ({ size = 80 }) => {
    // 生成 12x12 像素 QR 占位
    const cells = [];
    for (let i = 0; i < 12; i++) {
        cells[i] = [];
        for (let j = 0; j < 12; j++) {
            cells[i][j] = Math.random() > 0.5;
        }
    }
    // 三个定位角
    const setFinder = (r, c) => {
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                cells[r + i][c + j] = true;
        cells[r + 1][c + 1] = false;
    };
    setFinder(0, 0);
    setFinder(0, 9);
    setFinder(9, 0);
    return (<svg width={size} height={size} viewBox="0 0 12 12" style={{ shapeRendering: "crispEdges" }}>
      <rect width="12" height="12" fill="#fff"/>
      {cells.map((row, i) => row.map((on, j) => on ? <rect key={`${i}-${j}`} x={j} y={i} width="1" height="1" fill="#1A1D21"/> : null))}
    </svg>);
};
//# sourceMappingURL=PixelIcons.js.map