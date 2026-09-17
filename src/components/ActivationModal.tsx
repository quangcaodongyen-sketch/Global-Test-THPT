import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Key,
  Copy,
  Check,
  PhoneCall,
  Sparkles,
  X,
  AlertCircle,
  Clock,
  Crown,
} from 'lucide-react';
import {
  getOrCreateDeviceId,
  verifyLicenseKey,
  saveActivation,
  getLicenseState,
  LicenseState,
} from '../utils/licenseManager';

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivated: () => void;
}

export const ActivationModal: React.FC<ActivationModalProps> = ({
  isOpen,
  onClose,
  onActivated,
}) => {
  const [deviceId, setDeviceId] = useState<string>('');
  const [inputKey, setInputKey] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState<LicenseState | null>(null);

  useEffect(() => {
    if (isOpen) {
      const id = getOrCreateDeviceId();
      setDeviceId(id);
      setCurrentState(getLicenseState());
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(deviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleActivate = async () => {
    if (!inputKey.trim()) {
      setErrorMsg('Vui lòng nhập Mã Kích Hoạt (License Key) được cấp.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await verifyLicenseKey(deviceId, inputKey);
      if (res.isValid) {
        saveActivation({
          packageType: res.packageType as any,
          packageName: res.packageName,
          expDate: res.expDate,
          expiryTs: res.expiryTs,
          key: inputKey.trim().toUpperCase(),
        });

        setSuccessMsg(res.message);
        setCurrentState(getLicenseState());
        setTimeout(() => {
          onActivated();
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl overflow-hidden bg-white border shadow-2xl border-slate-200 rounded-2xl">
        {/* Header Ribbon */}
        <div className="relative p-6 text-white bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700">
          <button
            onClick={onClose}
            className="absolute p-2 text-white/80 transition-colors rounded-full top-4 right-4 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">KÍCH HOẠT BẢN QUYỀN</h2>
                <span className="px-2 py-0.5 text-xs font-bold text-amber-900 bg-amber-400 rounded-md shadow-sm">
                  ENG-EXAM PRO
                </span>
              </div>
              <p className="mt-1 text-xs text-blue-100">
                Phần mềm Tạo Đề Tiếng Anh THPT 2026 – Tác giả: Thầy giáo Đinh Văn Thành
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Trạng thái hiện tại */}
          {currentState && currentState.isActivated && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-emerald-600" />
                <div>
                  <div className="text-sm font-bold text-emerald-900">{currentState.packageName}</div>
                  <div className="text-xs text-emerald-700">Hạn sử dụng: {currentState.expDate}</div>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-extrabold text-white bg-emerald-600 rounded-lg">
                ĐÃ MỞ KHÓA
              </span>
            </div>
          )}

          {/* Device ID Section */}
          <div className="p-4 border bg-slate-50 border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold tracking-wider uppercase text-slate-600">
                MÃ THIẾT BỊ / TRÌNH DUYỆT CỦA BẠN (DEVICE ID):
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Gửi mã này qua Zalo để nhận Key</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 font-mono text-sm font-bold tracking-wider text-blue-800 bg-white border border-slate-300 rounded-lg select-all">
                {deviceId}
              </div>
              <button
                onClick={handleCopyId}
                type="button"
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Đã chép' : 'Sao chép'}
              </button>
            </div>
          </div>

          {/* Input Key Section */}
          <div>
            <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-700">
              NHẬP MÃ KÍCH HOẠT BẢN QUYỀN (LICENSE KEY):
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value.toUpperCase())}
                placeholder="VD: ENG-LT-... hoặc ENG-Y1-... hoặc KEY-..."
                className="w-full px-4 py-3 font-mono text-sm font-bold text-center tracking-wider uppercase transition-all bg-white border-2 rounded-xl border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
              <Key className="absolute w-5 h-5 text-slate-400 top-3.5 left-3.5" />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 mt-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 p-3 mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              onClick={handleActivate}
              disabled={loading}
              className="flex items-center justify-center w-full gap-2 py-3 mt-3 text-sm font-extrabold text-white transition-all shadow-md bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-indigo-800 active:scale-98 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {loading ? 'Đang xác thực...' : 'XÁC THỰC & MỞ KHÓA BẢN QUYỀN'}
            </button>
          </div>

          {/* Pricing Box for Secondary School Teachers */}
          <div className="pt-4 border-t border-slate-200">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                BẢNG GIÁ ƯU ĐÃI CHUYỂN GIAO GIÁO VIÊN:
              </span>
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Năm học 2026 - 2027
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 text-center border bg-slate-50 border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                <div className="text-[11px] font-bold text-slate-600 uppercase">Gói 1 Năm</div>
                <div className="text-base font-black text-blue-700 mt-0.5">200.000đ</div>
                <div className="text-[10px] text-slate-500 mt-1">12 Tháng đầy đủ</div>
              </div>

              <div className="p-3 text-center border bg-slate-50 border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                <div className="text-[11px] font-bold text-slate-600 uppercase">Gói 2 Năm</div>
                <div className="text-base font-black text-indigo-700 mt-0.5">300.000đ</div>
                <div className="text-[10px] text-slate-500 mt-1">24 Tháng tiết kiệm</div>
              </div>

              <div className="p-3 text-center border-2 border-amber-300 bg-amber-50/60 rounded-xl shadow-sm">
                <div className="text-[11px] font-black text-amber-800 uppercase flex items-center justify-center gap-1">
                  <Crown className="w-3 h-3 text-amber-600" /> Vĩnh Viễn
                </div>
                <div className="text-base font-black text-rose-600 mt-0.5">500.000đ</div>
                <div className="text-[10px] text-amber-900 font-bold mt-1">Trọn đời (VIP)</div>
              </div>
            </div>
          </div>

          {/* Author Contact & Zalo Hotline */}
          <div className="p-3.5 text-xs text-slate-700 bg-gradient-to-br from-blue-50/80 to-teal-50/80 border border-blue-200/80 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-extrabold text-slate-900">
                Tác giả: Thầy giáo Đinh Văn Thành – Tuyên Quang
              </div>
              <div className="text-slate-600 mt-0.5">
                Hotline / Zalo tư vấn kích hoạt: <strong className="text-blue-700">0915.213.717</strong>
              </div>
            </div>
            <a
              href="https://zalo.me/0915213717"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 font-bold text-white transition-all bg-emerald-600 rounded-lg hover:bg-emerald-700 shrink-0 shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Chat Zalo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
