import React, { useState } from 'react';
import {
  Crown,
  PhoneCall,
  CheckCircle2,
  Copy,
  Check,
  X,
  Sparkles,
  Calendar,
  CreditCard,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { User } from '../types/authTypes';

interface OutOfTrialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
}

export const OutOfTrialsModal: React.FC<OutOfTrialsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'1y' | '2y'>('2y');
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);
  const [copiedSyntax, setCopiedSyntax] = useState<boolean>(false);

  if (!isOpen) return null;

  const adminPhone = '0915213717';
  const adminName = 'Đinh Văn Thành';
  const syntax = `VIP ${selectedPlan === '1y' ? '1NAM' : '2NAM'} ${currentUser?.username || 'Giaovien'} ${currentUser?.phone || ''}`.trim();

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(adminPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopySyntax = () => {
    navigator.clipboard.writeText(syntax);
    setCopiedSyntax(true);
    setTimeout(() => setCopiedSyntax(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header với vương miện VIP */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white p-6 pb-5 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
              <Crown className="w-7 h-7 text-amber-200 fill-amber-200/30" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold tracking-wide uppercase mb-1">
                Thông Báo Hết Lượt Dùng Thử
              </span>
              <h2 className="text-xl font-bold tracking-tight">Kích Hoạt Tài Khoản VIP Toàn Năng</h2>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5">
          {/* Thông điệp đề xuất trân trọng */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-2">
            <p className="font-semibold text-amber-900">
              Kính gửi Quý Thầy/Cô {currentUser?.fullName ? `(${currentUser.fullName})` : ''},
            </p>
            <p>
              Bạn đã sử dụng hết <strong>5 lượt dùng thử miễn phí</strong>. Nếu thấy ứng dụng hữu ích cho công việc soạn giảng tích hợp Năng lực số, AI và các chuyên đề giáo dục THCS theo Công văn 5512 và muốn tiếp tục sử dụng đầy đủ các tính năng nâng cao, quý thầy cô có thể liên hệ để kích hoạt tài khoản <strong>VIP</strong> và góp phần duy trì, nâng cấp hệ thống phục vụ cộng đồng giáo viên THCS trên toàn quốc.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs font-medium text-amber-800">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Xin chân thành cảm ơn sự ủng hộ và đồng hành của quý thầy cô!</span>
            </div>
          </div>

          {/* Lựa chọn gói VIP */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Chọn gói VIP phù hợp:
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Kích hoạt nhanh trong 1 phút
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Gói 1 Năm */}
              <div
                onClick={() => setSelectedPlan('1y')}
                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${
                  selectedPlan === '1y'
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-800 text-sm">VIP 1 NĂM</span>
                  <span className="text-xs text-blue-600 font-semibold bg-blue-100/70 px-2 py-0.5 rounded-md">
                    12 Tháng
                  </span>
                </div>
                <div className="text-xl font-extrabold text-blue-700 mb-1">
                  200.000 <span className="text-xs font-normal text-slate-500">VNĐ</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Toàn quyền tích hợp Năng lực số, AI và các nội dung giáo dục THCS chuẩn Công văn 5512 không giới hạn trong 1 năm.
                </p>
              </div>

              {/* Gói 2 Năm - Đề xuất */}
              <div
                onClick={() => setSelectedPlan('2y')}
                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${
                  selectedPlan === '2y'
                    ? 'border-amber-500 bg-amber-50/60 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  TIẾT KIỆM 100K ★ KHUYÊN DÙNG
                </div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-800 text-sm">VIP 2 NĂM</span>
                  <span className="text-xs text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-md">
                    24 Tháng
                  </span>
                </div>
                <div className="text-xl font-extrabold text-amber-600 mb-1">
                  300.000 <span className="text-xs font-normal text-slate-500">VNĐ</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Chỉ 150k/năm! Tích hợp NLS-AI không giới hạn trong 2 năm và mở khóa toàn bộ kho Phụ lục III chuẩn cập nhật mới nhất.
                </p>
              </div>
            </div>
          </div>

          {/* Cú pháp chuyển khoản & liên hệ */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-slate-500" />
                Thông tin nhận kích hoạt:
              </span>
              <span className="text-slate-900 font-bold">{adminName}</span>
            </div>
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 text-[11px] block">Số điện thoại / Zalo:</span>
                <span className="font-mono font-bold text-blue-700 text-sm">{adminPhone}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              >
                {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPhone ? 'Đã chép' : 'Sao chép SĐT'}
              </button>
            </div>
          </div>

          {/* Nút hành động chính theo yêu cầu */}
          <div className="space-y-2 pt-1">
            <a
              href={`https://zalo.me/${adminPhone}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-sm sm:text-base group"
            >
              <PhoneCall className="w-5 h-5 group-hover:animate-bounce" />
              💬 Liên Hệ Zalo Để Kích Hoạt VIP ({adminPhone})
            </a>
            <p className="text-center text-[11px] text-slate-400">
              Admin kiểm tra và kích hoạt gói VIP ngay sau khi nhận thông tin xác nhận.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
