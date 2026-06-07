"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/dashboard/ui/Toast";
import UserConsoleLayout from "@/components/dashboard/layout/UserConsoleLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ArrowLeft,
  ShieldCheck,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getVerificationStatus,
  submitVerification,
  uploadVerificationImage,
  type VerificationStatus,
} from "@/lib/user-api";

export default function VerificationPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const [status, setStatus] = React.useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [name, setName] = React.useState("");
  const [idNumber, setIdNumber] = React.useState("");
  const [frontFile, setFrontFile] = React.useState<File | null>(null);
  const [backFile, setBackFile] = React.useState<File | null>(null);
  const [frontPreview, setFrontPreview] = React.useState<string | null>(null);
  const [backPreview, setBackPreview] = React.useState<string | null>(null);
  const [frontId, setFrontId] = React.useState<string | null>(null);
  const [backId, setBackId] = React.useState<string | null>(null);
  const [isUploadingFront, setIsUploadingFront] = React.useState(false);
  const [isUploadingBack, setIsUploadingBack] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    getVerificationStatus()
      .then(setStatus)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, router]);

  const handleFileSelect = async (
    file: File,
    side: "front" | "back"
  ) => {
    if (!file.type.startsWith("image/")) {
      toast("error", "请上传图片文件");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("error", "图片大小不能超过 5MB");
      return;
    }

    const preview = URL.createObjectURL(file);
    if (side === "front") {
      setFrontFile(file);
      setFrontPreview(preview);
      setIsUploadingFront(true);
    } else {
      setBackFile(file);
      setBackPreview(preview);
      setIsUploadingBack(true);
    }

    try {
      const result = await uploadVerificationImage(file);
      if (side === "front") {
        setFrontId(result.id);
      } else {
        setBackId(result.id);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "上传失败";
      toast("error", message);
    } finally {
      if (side === "front") {
        setIsUploadingFront(false);
      } else {
        setIsUploadingBack(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast("error", "请输入姓名");
      return;
    }
    if (!idNumber.trim() || idNumber.length < 15) {
      toast("error", "请输入正确的身份证号");
      return;
    }
    if (!frontId) {
      toast("error", "请上传身份证正面照片");
      return;
    }
    if (!backId) {
      toast("error", "请上传身份证反面照片");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitVerification({
        name: name.trim(),
        idNumber: idNumber.trim(),
        frontImageId: frontId,
        backImageId: backId,
      });
      setStatus(result);
      toast("success", "认证信息已提交，请等待审核");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "提交失败";
      toast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <UserConsoleLayout>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="mb-6 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回设置
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6" />
            实名认证
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            完成实名认证可提升您的额度限制，并解锁更多高级模型。
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-[100px] rounded-2xl" />
            <Skeleton className="h-[300px] rounded-2xl" />
          </div>
        ) : status?.status === "verified" ? (
          /* 已认证状态 */
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-emerald-500" />
            <h2 className="mt-4 text-xl font-bold text-emerald-900">
              认证已通过
            </h2>
            <p className="mt-2 text-sm text-emerald-700">
              您的实名认证已于 {status.verifiedAt ? new Date(status.verifiedAt).toLocaleDateString("zh-CN") : ""} 通过审核。
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              {status.name} · {status.idNumber?.slice(0, 4)}****{status.idNumber?.slice(-4)}
            </div>
          </div>
        ) : status?.status === "pending" ? (
          /* 审核中状态 */
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <Clock className="mx-auto h-16 w-16 text-amber-500" />
            <h2 className="mt-4 text-xl font-bold text-amber-900">
              认证审核中
            </h2>
            <p className="mt-2 text-sm text-amber-700">
              您的实名认证信息正在审核中，请耐心等待。审核通常需要 1-3 个工作日。
            </p>
          </div>
        ) : status?.status === "rejected" ? (
          /* 被拒绝状态 */
          <div className="space-y-6">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-500" />
                <div>
                  <h3 className="font-semibold text-red-900">认证未通过</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {status.rejectReason || "请重新提交认证信息"}
                  </p>
                </div>
              </div>
            </div>
            {/* 重新提交表单 */}
            <VerificationForm
              name={name}
              setName={setName}
              idNumber={idNumber}
              setIdNumber={setIdNumber}
              frontPreview={frontPreview}
              backPreview={backPreview}
              frontId={frontId}
              backId={backId}
              isUploadingFront={isUploadingFront}
              isUploadingBack={isUploadingBack}
              onFileSelect={handleFileSelect}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        ) : (
          /* 未认证状态 */
          <VerificationForm
            name={name}
            setName={setName}
            idNumber={idNumber}
            setIdNumber={setIdNumber}
            frontPreview={frontPreview}
            backPreview={backPreview}
            frontId={frontId}
            backId={backId}
            isUploadingFront={isUploadingFront}
            isUploadingBack={isUploadingBack}
            onFileSelect={handleFileSelect}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </UserConsoleLayout>
  );
}

function VerificationForm({
  name,
  setName,
  idNumber,
  setIdNumber,
  frontPreview,
  backPreview,
  frontId,
  backId,
  isUploadingFront,
  isUploadingBack,
  onFileSelect,
  onSubmit,
  isSubmitting,
}: {
  name: string;
  setName: (v: string) => void;
  idNumber: string;
  setIdNumber: (v: string) => void;
  frontPreview: string | null;
  backPreview: string | null;
  frontId: string | null;
  backId: string | null;
  isUploadingFront: boolean;
  isUploadingBack: boolean;
  onFileSelect: (file: File, side: "front" | "back") => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 mb-1">
          身份信息
        </h3>
        <p className="text-xs text-neutral-500">
          请填写您的真实身份信息，通过阿里云/腾讯云进行实名认证
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="姓名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="请输入真实姓名"
          required
        />
        <Input
          label="身份证号"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          placeholder="请输入 18 位身份证号"
          required
          maxLength={18}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UploadBox
          label="身份证正面"
          preview={frontPreview}
          isLoading={isUploadingFront}
          isReady={!!frontId}
          onFileSelect={(file) => onFileSelect(file, "front")}
        />
        <UploadBox
          label="身份证反面"
          preview={backPreview}
          isLoading={isUploadingBack}
          isReady={!!backId}
          onFileSelect={(file) => onFileSelect(file, "back")}
        />
      </div>

      <Button
        onClick={onSubmit}
        loading={isSubmitting}
        disabled={!frontId || !backId || isUploadingFront || isUploadingBack}
        className="w-full"
      >
        提交认证
      </Button>
    </div>
  );
}

function UploadBox({
  label,
  preview,
  isLoading,
  isReady,
  onFileSelect,
}: {
  label: string;
  preview: string | null;
  isLoading: boolean;
  isReady: boolean;
  onFileSelect: (file: File) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        {label}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all",
          preview
            ? "border-emerald-300 bg-emerald-50"
            : "border-neutral-300 bg-neutral-50 hover:border-neutral-400"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
            <span className="text-xs text-neutral-500">上传中...</span>
          </div>
        ) : preview ? (
          <img
            src={preview}
            alt={label}
            className="h-full w-full object-contain rounded-xl p-2"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-neutral-400" />
            <span className="text-xs text-neutral-500">点击上传</span>
            <span className="text-[10px] text-neutral-400">
              JPG/PNG，最大 5MB
            </span>
          </div>
        )}
        {isReady && !isLoading && (
          <div className="absolute top-2 right-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
        )}
      </div>
    </div>
  );
}
