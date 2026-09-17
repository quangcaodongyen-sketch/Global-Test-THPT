import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Clock,
  Layers,
  FileCheck2,
  Award,
  BookOpen,
  Cpu,
  Zap,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface AboutViewProps {
  onStartTrial: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onStartTrial }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Banner Tôn vinh Tác giả */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl border border-blue-800/40 overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          <img
            src="/assets/thay_thanh_circle.png"
            alt="Thầy Đinh Văn Thành"
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-amber-400 shadow-2xl object-cover shrink-0 bg-blue-900"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>Chuyển Đổi Số Giáo Dục Cấp THCS • Bản Quyền Chính Thức 2026</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              CÔNG CỤ TÍCH HỢP NĂNG LỰC SỐ, AI VÀ CÁC NỘI DUNG GIÁO DỤC CẤP THCS
            </h1>
            <p className="text-sm sm:text-base text-blue-200 font-medium max-w-2xl leading-relaxed">
              Chuẩn hóa 100% theo Công văn 5512/BGDĐT-GDTrH, Thông tư 02/2025/TT-BGDĐT, Thông tư 18/2026/TT-BGDĐT và Quyết định 2422/QĐ-BGDĐT cho tất cả 12 bộ môn THCS.
            </p>
            <div className="pt-2 text-xs sm:text-sm text-slate-300 font-semibold flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span>
                Tác giả: <strong className="text-white font-black">Thầy giáo Đinh Văn Thành</strong>
              </span>
              <span>•</span>
              <span>Trường THCS Đồng Yên, tỉnh Tuyên Quang</span>
              <span>•</span>
              <a
                href="https://zalo.me/0915213717"
                target="_blank"
                rel="noreferrer"
                className="text-amber-300 font-black hover:underline flex items-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Hotline/Zalo: 0915.213.717
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Lợi Ích Vàng */}
      <div className="space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <span>6 LỢI ÍCH VÀNG VƯỢT TRỘI CHO GIÁO VIÊN THCS</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Giải pháp chuyên biệt giúp giáo viên hoàn thành kế hoạch bài dạy chuẩn mực chỉ sau vài click chuột
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Clock,
              title: '1. Tiết Kiệm 95% Thời Gian',
              desc: 'Tự động tích hợp toàn bộ bài dạy chỉ trong 3 giây. Không còn phải mất hàng giờ tra cứu thủ công từng mã chỉ báo và gõ lại từng hoạt động.',
              color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200'
            },
            {
              icon: ShieldCheck,
              title: '2. Chuẩn 100% Khung Pháp Lý Mới Nhất',
              desc: 'Bám sát Công văn 5512/BGDĐT, Thông tư 02/2025 (Mã NLS), Quyết định 2422 (Mã AI), Thông tư 08/2024 (Mã ANQP), CV 3089 (STEM)...',
              color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200'
            },
            {
              icon: Cpu,
              title: '3. Kiến Trúc Dual-Engine 2 Lựa Chọn',
              desc: 'Hỗ trợ cả Lựa chọn 1 (Tích hợp nguyên văn 100% Phụ lục III) và Lựa chọn 2 (Phân tích Sư phạm AI Chi tiết 4 hoạt động cho GV, HS, Sản phẩm).',
              color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200'
            },
            {
              icon: FileCheck2,
              title: '4. Bảo Toàn 100% Tài Liệu Gốc',
              desc: 'Can thiệp trực tiếp cấu trúc OpenXML: Giữ nguyên 1000% công thức toán học (OMML), bảng biểu, sơ đồ, hình vẽ, lề trang và Header/Footer.',
              color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200'
            },
            {
              icon: Layers,
              title: '5. Áp Dụng Cho Tất Cả 12 Bộ Môn THCS',
              desc: 'Toán, Ngữ văn, KHTN, Lịch sử và Địa lí, GDCD, Tin học, Công nghệ, Tiếng Anh, Nghệ thuật, GDTC, HĐTN, GDĐP cho các khối lớp 6, 7, 8, 9.',
              color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200'
            },
            {
              icon: BookOpen,
              title: '6. Môn Tiếng Anh Chuẩn Quốc Tế',
              desc: '100% nội dung môn Tiếng Anh được soạn bằng Tiếng Anh chuẩn, dùng Digital Competence (bỏ chữ NLS) và AI, phù hợp mọi bộ SGK hiện hành.',
              color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40 border-pink-200'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-2.5"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bảng So Sánh Cũ vs Mới */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white text-center">
          📊 SO SÁNH: SOẠN TÍCH HỢP KIỂU CŨ VS PHẦN MỀM NLS-AI THCS PRO 2026
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
          <table className="w-full text-xs text-left border-collapse bg-white dark:bg-slate-900">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
                <th className="p-3.5">Tiêu chí so sánh</th>
                <th className="p-3.5 text-red-600 dark:text-red-400">Soạn tích hợp thủ công kiểu cũ</th>
                <th className="p-3.5 text-emerald-600 dark:text-emerald-400">Dùng NLS-AI THCS PRO 2026</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="p-3.5 font-bold">Thời gian hoàn thành 1 giáo án</td>
                <td className="p-3.5 text-slate-600 dark:text-slate-400">45 - 60 phút / bài</td>
                <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">Chỉ 3 giây / bài (Tự động 100%)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold">Mã chỉ báo năng lực số & AI</td>
                <td className="p-3.5 text-slate-600 dark:text-slate-400">Hay nhầm lẫn, tra cứu công văn vất vả</td>
                <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">Chuẩn chỉ 100% theo TT 02/2025 & QĐ 2422</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold">Bảo toàn công thức toán & hình vẽ</td>
                <td className="p-3.5 text-slate-600 dark:text-slate-400">Dễ bị lỗi font, nhảy dòng, lệch bảng biểu</td>
                <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">Bảo toàn 100% công thức OMML và tranh ảnh</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold">Xử lý giáo án tuần (nhiều bài/tiết)</td>
                <td className="p-3.5 text-slate-600 dark:text-slate-400">Phải copy/paste lặp đi lặp lại từng bài</td>
                <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">Tự động nhận diện và xử lý tất cả bài trong tuần</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold">Môn Tiếng Anh</td>
                <td className="p-3.5 text-slate-600 dark:text-slate-400">Dễ bị lẫn tiếng Việt hoặc dùng từ sai chuẩn</td>
                <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">100% Tiếng Anh chuẩn quốc tế (Digital & AI)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Lời Ngỏ Của Thầy Thành & Nút Kêu Gọi Dùng Thử */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950 p-6 sm:p-8 border-2 border-blue-200 dark:border-blue-900 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-600 text-white shrink-0">
            <Award className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              TÂM HUYẾT GỬI TỚI QUÝ THẦY CÔ GIÁO TRÊN TOÀN QUỐC
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Từ Thầy giáo Đinh Văn Thành – Trường THCS Đồng Yên, tỉnh Tuyên Quang
            </p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif italic space-y-2 pl-4 border-l-4 border-blue-600">
          <p>
            "Kính thưa quý Thầy/Cô đồng nghiệp! Công cuộc đổi mới giáo dục và chuyển đổi số đang đặt ra những yêu cầu rất cấp thiết cho người giáo viên trực tiếp đứng lớp. Việc phải đưa Năng lực số, Trí tuệ nhân tạo (AI), STEM, An ninh quốc phòng... vào từng bài học theo Công văn 5512 tốn rất nhiều thời gian quý báu của Thầy Cô."
          </p>
          <p>
            "Với mong muốn san sẻ gánh nặng chuyên môn, tôi đã dày công nghiên cứu và xây dựng phần mềm này nhằm tự động hóa 100% công tác tích hợp nhưng vẫn bảo toàn tuyệt đối chất lượng sư phạm và thể thức văn bản của nhà trường. Kính chúc quý Thầy Cô có những tiết dạy thăng hoa, sáng tạo và thành công rực rỡ!"
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            📱 Hotline / Zalo hỗ trợ & Kích hoạt VIP: <strong className="text-blue-600 dark:text-blue-400 font-bold">0915.213.717 (Đinh Thành)</strong>
          </div>
          <button
            onClick={onStartTrial}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>TRẢI NGHIỆM 5 LƯỢT DÙNG THỬ MIỄN PHÍ NGAY</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
