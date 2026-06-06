/**
 * Dashboard 图标库
 *
 * 统一使用 inline SVG，零外部依赖。
 * 所有图标 size=18（默认），strokeWidth=1.5
 */

import React from "react";

type IconProps = {
  size?: number;
  className?: string;
};

function withDefaults(children: React.ReactNode, props: IconProps, defaultSize = 18) {
  const { size = defaultSize, className = "" } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

/* ───── 导航图标 ───── */

export function IconOverview(props: IconProps) {
  return withDefaults(
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>,
    props
  );
}

export function IconApiKey(props: IconProps) {
  return withDefaults(
    <>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </>,
    props
  );
}

export function IconUsage(props: IconProps) {
  return withDefaults(
    <>
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </>,
    props
  );
}

export function IconBilling(props: IconProps) {
  return withDefaults(
    <>
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <path d="M1 10h22" />
    </>,
    props
  );
}

export function IconLogs(props: IconProps) {
  return withDefaults(
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </>,
    props
  );
}

export function IconSettings(props: IconProps) {
  return withDefaults(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </>,
    props
  );
}

/* ───── Topbar 图标 ───── */

export function IconSearch(props: IconProps) {
  return withDefaults(
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </>,
    props
  );
}

export function IconBell(props: IconProps) {
  return withDefaults(
    <>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </>,
    props
  );
}

export function IconChevronDown(props: IconProps) {
  return withDefaults(
    <path d="m6 9 6 6 6-6" />,
    props
  );
}

export function IconChevronRight(props: IconProps) {
  return withDefaults(
    <path d="m9 18 6-6-6-6" />,
    props
  );
}

/* ───── 操作图标 ───── */

export function IconPlus(props: IconProps) {
  return withDefaults(
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>,
    props
  );
}

export function IconCopy(props: IconProps) {
  return withDefaults(
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>,
    props
  );
}

export function IconTrash(props: IconProps) {
  return withDefaults(
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>,
    props
  );
}

export function IconEye(props: IconProps) {
  return withDefaults(
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>,
    props
  );
}

export function IconEyeOff(props: IconProps) {
  return withDefaults(
    <>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </>,
    props
  );
}

export function IconRefresh(props: IconProps) {
  return withDefaults(
    <>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </>,
    props
  );
}

export function IconClose(props: IconProps) {
  return withDefaults(
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>,
    props
  );
}

export function IconMenu(props: IconProps) {
  return withDefaults(
    <>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>,
    props
  );
}

export function IconBack(props: IconProps) {
  return withDefaults(
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </>,
    props
  );
}

export function IconLogout(props: IconProps) {
  return withDefaults(
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>,
    props
  );
}

/* ───── 状态 / 通用图标 ───── */

export function IconCheckCircle(props: IconProps) {
  return withDefaults(
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>,
    props
  );
}

export function IconXCircle(props: IconProps) {
  return withDefaults(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </>,
    props
  );
}

export function IconWarning(props: IconProps) {
  return withDefaults(
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>,
    props
  );
}

export function IconInfo(props: IconProps) {
  return withDefaults(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>,
    props
  );
}

export function IconEmpty(props: IconProps) {
  return withDefaults(
    <>
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </>,
    props
  );
}

export function IconToken(props: IconProps) {
  return withDefaults(
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </>,
    props
  );
}
