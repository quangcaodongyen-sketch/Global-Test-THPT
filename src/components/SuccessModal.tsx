import React from 'react';
import {
  CheckCircle2,
  FileDown,
  X,
  FileCheck,
  Award,
  Sparkles,
  Layers,
  Clock,
} from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  fileName: string;
  examTitle: string;
  downloadUrl?: string;
  fileBlob?: Blob;
  remainingTrials: number;
  isActivated: boolean;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  fileName,
  examTitle,
  downloadUrl,
  fileBlob,
  remainingTrials,
  isActivated,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleDownloadAgain = () => {
    if (fileBlob) {
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } else if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 overflow-hidden text-center bg-white border shadow-2xl border-slate-200 rounded-3xl">
        <button
          onClick={onClose}
          className="absolute p-2 text-slate-400 transition-colors rounded-full top-4 right-4 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Success */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-emerald-100 border-4 border-emerald-50 rounded-full shadow-lg text-emerald-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-xl font-black tracking-tight text-slate-900">
          XUẤT BẢN ĐỀ THÀNH CÔNG!
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          File đề kiểm tra chuẩn Microsoft Word (.docx) đã được xuất bản và tải về máy tính.
        </p>

        {/* File Details Card */}
        <div className="p-4 my-5 text-left border bg-slate-50 border-slate-200/90 rounded-2xl">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            TÊN FILE ĐỀ KIỂM TRA:
          </div>
          <div className="text-sm font-black text-blue-700 break-all flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 shrink-0 text-blue-600" />
            <span>{fileName}</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Chuẩn CV 7991/BGDĐT</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>02 Mã đề tương đương</span>
            </div>
          </div>
        </div>

        {/* Trial or License Badge */}
        <div className="mb-5">
          {isActivated ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>BẢN QUYỀN CHÍNH THỨC – TẠO KHÔNG GIỚI HẠN</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded-full">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>LƯỢT DÙNG THỬ CÒN LẠI: {remainingTrials} / 5 LƯỢT</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleDownloadAgain}
            type="button"
            className="flex items-center justify-center w-full gap-2 py-3 text-sm font-extrabold text-white transition-all shadow-md bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-indigo-800 active:scale-98"
          >
            <FileDown className="w-4 h-4" />
            TẢI LẠI FILE WORD (.DOCX)
          </button>

          <button
            onClick={onClose}
            type="button"
            className="w-full py-2.5 text-xs font-bold text-slate-600 transition-colors bg-slate-100 rounded-xl hover:bg-slate-200"
          >
            Đóng & Tiếp tục tạo đề khác
          </button>
        </div>
      </div>
    </div>
  );
};
