import { BadRequestException } from '@nestjs/common';
import { isIP } from 'net';

const BLOCKED_HOSTNAMES = new Set(['localhost', 'localhost.localdomain']);

function ipv4ToNumber(ip: string): number {
  return ip.split('.').reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
}

function isPrivateIpv4(ip: string): boolean {
  const value = ipv4ToNumber(ip);
  const ranges: Array<[string, string]> = [
    ['0.0.0.0', '0.255.255.255'],
    ['10.0.0.0', '10.255.255.255'],
    ['100.64.0.0', '100.127.255.255'],
    ['127.0.0.0', '127.255.255.255'],
    ['169.254.0.0', '169.254.255.255'],
    ['172.16.0.0', '172.31.255.255'],
    ['192.0.0.0', '192.0.0.255'],
    ['192.168.0.0', '192.168.255.255'],
    ['198.18.0.0', '198.19.255.255'],
    ['224.0.0.0', '255.255.255.255'],
  ];

  return ranges.some(([start, end]) => value >= ipv4ToNumber(start) && value <= ipv4ToNumber(end));
}

function isBlockedIpv6(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return normalized === '::1'
    || normalized === '::'
    || normalized.startsWith('fe80:')
    || normalized.startsWith('fc')
    || normalized.startsWith('fd');
}

export function assertSafeOutboundUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new BadRequestException('URL 格式无效');
  }

  if (url.protocol !== 'https:') {
    throw new BadRequestException('外联 URL 必须使用 HTTPS');
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost')) {
    throw new BadRequestException('禁止访问本地主机地址');
  }

  const ipVersion = isIP(hostname);
  if (ipVersion === 4 && isPrivateIpv4(hostname)) {
    throw new BadRequestException('禁止访问内网或保留 IPv4 地址');
  }
  if (ipVersion === 6 && isBlockedIpv6(hostname)) {
    throw new BadRequestException('禁止访问内网或保留 IPv6 地址');
  }

  return url;
}
