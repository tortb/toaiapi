"use client";

/**
 * 阿里云 ESA AI 验证码组件
 *
 * 基于阿里云 ESA 控制台配置的"一点即过"等验证码类型。
 * 验证成功后通过 onSuccess 回调返回 captchaVerifyParam，
 * 前端将其作为 header `captcha-verify-param` 发送给后端。
 *
 * 两种使用方式：
 * 1. 组件自管理：不传 button/element，组件内部创建按钮和容器
 * 2. 外部控制：传入 button 和 element CSS 选择器，由父页面提供 DOM 元素
 *
 * @see https://help.aliyun.com/zh/edge-security-acceleration/esa/user-guide/get-started-with-ai-captchas
 */

import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    AliyunCaptchaConfig?: {
      region: string;
      prefix: string;
    };
    initAliyunCaptcha?: (options: any) => void;
  }
}

interface AliyunCaptchaProps {
  /** 阿里云场景 ID */
  sceneId: string;
  /** 身份标 */
  identity: string;
  /** 地区：cn 或 sgp */
  region?: string;
  /** 模式：popup 或 embed */
  mode?: "popup" | "embed";
  /** 验证成功回调，返回 captchaVerifyParam */
  onSuccess: (captchaVerifyParam: string) => void;
  /** 验证失败回调 */
  onFail?: (result: any) => void;
  /** 关闭回调 */
  onClose?: () => void;
  /**
   * 触发验证码的按钮 CSS 选择器，如 "#my-btn"。
   * 传入后组件不创建内部按钮，由父页面提供。
   */
  button?: string;
  /**
   * 渲染验证码元素的容器 CSS 选择器，如 "#captcha-element"。
   * 传入后组件不创建内部容器，由父页面提供。
   */
  element?: string;
  /** 内部按钮的 className（仅 button 未传时生效） */
  buttonClassName?: string;
  /** 内部按钮的文本（仅 button 未传时生效） */
  buttonText?: string;
  /** 是否禁用内部按钮 */
  disabled?: boolean;
}

let scriptLoaded = false;
let scriptLoading = false;
const scriptQueue: Array<() => void> = [];

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (scriptLoaded) {
      resolve();
      return;
    }
    if (scriptLoading) {
      scriptQueue.push(resolve);
      return;
    }
    scriptLoading = true;

    const script = document.createElement("script");
    script.src =
      "https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js";
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      scriptQueue.forEach((cb) => cb());
      scriptQueue.length = 0;
      resolve();
    };
    script.onerror = () => {
      scriptLoading = false;
      reject(new Error("Failed to load AliyunCaptcha.js"));
    };
    document.head.appendChild(script);
  });
}

export default function AliyunCaptcha({
  sceneId,
  identity,
  region = "cn",
  mode = "popup",
  onSuccess,
  onFail,
  onClose,
  button,
  element,
  buttonClassName,
  buttonText = "验证",
  disabled = false,
}: AliyunCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const captchaRef = useRef<any>(null);
  const initializedRef = useRef(false);

  // 生成内部使用的 ID（仅当外部未传选择器时使用）
  const internalButtonId = useRef(
    `captcha-btn-${Math.random().toString(36).slice(2, 9)}`
  ).current;
  const internalElementId = useRef(
    `captcha-el-${Math.random().toString(36).slice(2, 9)}`
  ).current;

  // 实际使用的选择器
  const buttonSelector = button || `#${internalButtonId}`;
  const elementSelector = element || `#${internalElementId}`;

  useEffect(() => {
    if (initializedRef.current) return;
    if (!sceneId || !identity) return;

    let cancelled = false;

    const init = async () => {
      try {
        await loadScript();

        if (cancelled) return;

        // 设置全局配置
        window.AliyunCaptchaConfig = {
          region,
          prefix: identity,
        };

        // 等待脚本生效
        await new Promise((r) => setTimeout(r, 200));

        if (cancelled) return;

        if (!window.initAliyunCaptcha) {
          console.error("[AliyunCaptcha] initAliyunCaptcha not available");
          return;
        }

        window.initAliyunCaptcha({
          SceneId: sceneId,
          mode,
          element: elementSelector,
          button: buttonSelector,
          success: (captchaVerifyParam: string) => {
            onSuccess(captchaVerifyParam);
          },
          fail: (result: any) => {
            console.warn("[AliyunCaptcha] verification failed:", result);
            onFail?.(result);
          },
          getInstance: (instance: any) => {
            captchaRef.current = instance;
          },
          onClose: () => {
            onClose?.();
          },
          server: [
            "captcha-esa-open.aliyuncs.com",
            "captcha-esa-open-b.aliyuncs.com",
          ],
          slideStyle: {
            width: 360,
            height: 40,
          },
          language: "cn",
          delayBeforeSuccess: true,
        });

        initializedRef.current = true;
      } catch (err) {
        console.error("[AliyunCaptcha] init error:", err);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [sceneId, identity, region, mode]);

  // 配置不完整时不渲染
  if (!sceneId || !identity) {
    return null;
  }

  // 外部控制模式：父页面已提供 button 和 element，组件不渲染额外 DOM
  if (button && element) {
    return null;
  }

  // 组件自管理模式：创建内部容器和按钮
  return (
    <div className="aliyun-captcha-wrapper">
      {!element && (
        <div id={internalElementId} ref={containerRef} />
      )}
      {!button && (
        <button
          id={internalButtonId}
          type="button"
          disabled={disabled}
          className={
            buttonClassName ||
            "w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          }
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

/**
 * 将 captchaVerifyParam 添加到请求 headers
 */
export function withCaptchaHeaders(
  headers: Record<string, string>,
  captchaVerifyParam?: string
): Record<string, string> {
  if (captchaVerifyParam) {
    return {
      ...headers,
      "captcha-verify-param": captchaVerifyParam,
    };
  }
  return headers;
}
