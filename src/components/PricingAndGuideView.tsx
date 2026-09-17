import React from 'react';
import {
  Crown,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Key,
  BookOpen,
  Award,
  Zap,
  Clock,
  QrCode,
  FileCheck,
} from 'lucide-react';

interface PricingAndGuideViewProps {
  onOpenActivationModal: () => void;
}

export const PricingAndGuideView: React.FC<PricingAndGuideViewProps> = ({
  onOpenActivationModal,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="relative p-8 overflow-hidden text-center text-white bg-gradient-to-r from-blue-800 via-indigo-800 to-teal-800 rounded-3xl shadow-xl">
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-3 text-xs font-black tracking-wider text-amber-900 uppercase bg-amber-400 rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> BẢN QUYỀN CHÍNH THỨC 2026 - 2027
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            MỞ KHÓA BẢN QUYỀN TOÀN BỘ NGÂN HÀNG ĐỀ & TÍNH NĂNG TẠO ĐỀ
          </h1>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed font-medium">
            Phần mềm biên soạn Đề kiểm tra Tiếng Anh THPT chuẩn GDPT 2018. Hỗ trợ đầy đủ khối 10, 11, 12 với các mã đề tương đương, ma trận và hướng dẫn chấm chi tiết.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenActivationModal}
              className="flex items-center gap-2 px-6 py-3 text-sm font-extrabold text-blue-900 transition-all bg-white rounded-xl hover:bg-blue-50 shadow-lg active:scale-95"
            >
              <Key className="w-4 h-4 text-blue-700" />
              KÍCH HOẠT MÃ KEY NGAY
            </button>
            <a
              href="https://zalo.me/0915213717"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 text-sm font-extrabold text-white transition-all bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-lg active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              LIÊN HỆ ZALO: 0915.213.717
            </a>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            CÁC GÓI BẢN QUYỀN DÀNH CHO GIÁO VIÊN THPT
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Thanh toán một lần – Kích hoạt sử dụng ngay trên máy tính hoặc trình duyệt
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gói 1 Năm */}
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
                  GÓI CƠ BẢN
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-100 rounded-full">
                  12 Tháng
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Bản Quyền 1 Năm</h3>
              <div className="mt-3 mb-5">
                <span className="text-3xl font-black text-blue-700">200.000đ</span>
                <span className="text-xs text-slate-500 font-bold ml-1">/ 1 máy</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sử dụng trọn vẹn trong 365 ngày</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tạo đề không giới hạn số lần</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Kho Bộ đề chuẩn THPT + Ma trận & Đặc tả</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cập nhật câu hỏi năm học 2026 - 2027</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenActivationModal}
              className="mt-6 w-full py-2.5 text-xs font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
            >
              Chọn Gói 1 Năm
            </button>
          </div>

          {/* Gói 2 Năm */}
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
                  TIẾT KIỆM HƠN
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-100 rounded-full">
                  24 Tháng
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Bản Quyền 2 Năm</h3>
              <div className="mt-3 mb-5">
                <span className="text-3xl font-black text-indigo-700">300.000đ</span>
                <span className="text-xs text-slate-500 font-bold ml-1">/ 1 máy</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sử dụng trọn vẹn trong 730 ngày (2 năm)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tạo đề không giới hạn số lần</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tất cả khối lớp 10, 11, 12 THPT</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hỗ trợ kỹ thuật ưu tiên qua Zalo</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenActivationModal}
              className="mt-6 w-full py-2.5 text-xs font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
            >
              Chọn Gói 2 Năm
            </button>
          </div>

          {/* Gói Vĩnh Viễn / VIP */}
          <div className="relative p-6 bg-gradient-to-b from-amber-50/70 to-white border-2 border-amber-400 rounded-3xl shadow-lg flex flex-col justify-between">
            <div className="absolute -top-3 right-6 px-3 py-0.5 text-[10px] font-black text-amber-900 bg-gradient-to-r from-amber-300 to-amber-400 rounded-full shadow-sm flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-700" /> PHỔ BIẾN NHẤT
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
                  GÓI TRỌN ĐỜI (VIP)
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold text-amber-900 bg-amber-100 rounded-full">
                  Vĩnh Viễn
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Bản Quyền Vĩnh Viễn</h3>
              <div className="mt-3 mb-5">
                <span className="text-3xl font-black text-rose-600">500.000đ</span>
                <span className="text-xs text-slate-500 font-bold ml-1">/ 1 máy</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2 font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sử dụng vĩnh viễn trọn đời</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Không cần gia hạn hằng năm</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Đầy đủ 20 Bộ đề chuẩn + 04 Đề cương 6 trang</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bảo hành và hỗ trợ trực tiếp từ tác giả</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenActivationModal}
              className="mt-6 w-full py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl transition-all shadow-sm"
            >
              👑 Đăng Ký Gói Vĩnh Viễn
            </button>
          </div>
        </div>
      </div>

      {/* 3 Bước Nhận Key Bản Quyền */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>QUY TRÌNH 3 BƯỚC NHẬN MÃ KÍCH HOẠT NHANH CHÓNG:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-xs mb-2.5">
              1
            </div>
            <div className="text-xs font-bold text-slate-900 mb-1">Copy Mã Thiết Bị</div>
            <p className="text-[11.5px] text-slate-500 leading-snug">
              Bấm nút [Bản quyền: DÙNG THỬ] ở góc trên bên phải để lấy và sao chép Mã Thiết Bị (Device ID).
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-xs mb-2.5">
              2
            </div>
            <div className="text-xs font-bold text-slate-900 mb-1">Gửi Zalo & Chuyển Khoản</div>
            <p className="text-[11.5px] text-slate-500 leading-snug">
              Gửi Mã Thiết Bị kèm gói bản quyền mong muốn tới Zalo Thầy Đinh Văn Thành (<strong>0915.213.717</strong>).
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-black text-xs mb-2.5">
              3
            </div>
            <div className="text-xs font-bold text-slate-900 mb-1">Dán Key & Mở Khóa Ngay</div>
            <p className="text-[11.5px] text-slate-500 leading-snug">
              Thầy Thành gửi lại Mã Key, dán vào ô và bấm [KÍCH HOẠT BẢN QUYỀN] để sử dụng trọn đời.
            </p>
          </div>
        </div>
      </div>

      {/* Author Card */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-blue-700 uppercase">TÁC GIẢ & BẢN QUYỀN PHẦN MỀM:</div>
          <div className="text-base font-black text-slate-900 mt-0.5">
            Thầy giáo Đinh Văn Thành – Tuyên Quang
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Hotline / Zalo tư vấn chuyển giao phần mềm trên toàn quốc: <strong className="text-blue-800">0915.213.717</strong>
          </div>
        </div>
        <a
          href="https://zalo.me/0915213717"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm shrink-0 flex items-center gap-2 transition-all active:scale-95"
        >
          <PhoneCall className="w-4 h-4" />
          Liên Hệ Zalo Thầy Thành
        </a>
      </div>
    </div>
  );
};
