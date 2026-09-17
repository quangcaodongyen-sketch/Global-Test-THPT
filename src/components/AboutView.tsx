import React from 'react';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  FileText,
  Award,
  BookOpen,
  Headphones,
  Mic,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  HeartHandshake,
  Star,
  Users,
  Flame,
  Wand2,
  PhoneCall,
  Download,
  AlertCircle,
} from 'lucide-react';

interface AboutViewProps {
  onGoToToolThanh: () => void;
  onGoToAiSuite: () => void;
  onOpenAuthModal?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onGoToToolThanh,
  onGoToAiSuite,
  onOpenAuthModal,
}) => {
  return (
    <div className="space-y-10 pb-12">
      {/* 1. HERO SECTION: LỜI GIỚI THIỆU & TỔNG QUAN ĐỘT PHÁ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white p-8 sm:p-12 shadow-2xl border border-blue-800/40">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-wider animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>GIẢI PHÁP KHẢO THÍ SỐ TOÀN DIỆN CHO GIÁO VIÊN TIẾNG ANH THPT</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            Tạo Đề Kiểm Tra Chuẩn 4 Kỹ Năng <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-teal-300 to-sky-300 bg-clip-text text-transparent">
              Chỉ Trong 30 Giây – Đúng Y Hệt Đề Mẫu
            </span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100 max-w-3xl mx-auto leading-relaxed font-normal">
            Ứng dụng độc quyền của <strong className="text-amber-300 font-bold">Thầy giáo Đinh Văn Thành</strong> (Tuyên Quang). Giúp quý Thầy/Cô loại bỏ hoàn toàn nỗi ám ảnh kẻ bảng ma trận, làm bản đặc tả chi tiết, chia điểm thủ công và gõ lại từng mã đề.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={onGoToToolThanh}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-blue-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>⚡ Trải Nghiệm Tool Tạo Đề Chuẩn 7991</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onGoToAiSuite}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs sm:text-sm rounded-2xl backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Wand2 className="w-4 h-4 text-teal-300" />
              <span>🤖 Khám Phá Tạo Đề AI (Kho 48 Units)</span>
            </button>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Tặng 5 lượt dùng thử miễn phí</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Bám sát CV 7991 & GDPT 2018</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Xuất 1 File Word nộp BGH ngay</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SÁU LỢI ÍCH VÀNG VƯỢT TRỘI (6 GOLDEN BENEFITS) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-black text-blue-600 uppercase tracking-widest">
            TẠI SAO HÀNG TRĂM GIÁO VIÊN TIN DÙNG?
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            6 Lợi Ích Vàng Giúp Thầy Cô Thảnh Thơi Khi Tới Kỳ Thi
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Lợi ích 1 */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 group hover:border-blue-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">1. Tiết Kiệm 90% Thời Gian</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thay vì mất <strong>3 đến 4 tiếng</strong> mỗi kỳ thi để căn chỉnh lề Word, kẻ ma trận 15 cột, làm bản đặc tả 7 cột và hoán vị câu hỏi thủ công, hệ thống xử lý hoàn tất chỉ trong <strong>30 giây</strong>.
            </p>
          </div>

          {/* Lợi ích 2 */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 group hover:border-blue-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">2. Chuẩn 100% Khảo Thí 7991</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tuyệt đối tuân thủ <strong>Công văn 7991/BGDĐT-GDTrH</strong> và chương trình GDPT 2018: Trắc nghiệm <strong>3 phương án A, B, C (không có D)</strong>, đủ 4 cấp độ nhận thức (Biết, Hiểu, Vận dụng, Vận dụng cao).
            </p>
          </div>

          {/* Lợi ích 3 */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 group hover:border-blue-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">3. Kiến Trúc Dual-Engine Độc Nhất</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kết hợp hoàn hảo giữa <strong>Bộ đề chuẩn THPT</strong> và <strong>Cỗ máy AI 30 Units Lớp 10, 11, 12</strong> với kho từ vựng khổng lồ, sinh đề ngẫu nhiên không bao giờ trùng lặp.
            </p>
          </div>

          {/* Lợi ích 4 */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 group hover:border-blue-300">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">4. Xuất 1 File Word Trọn Gói</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bấm 1 click tải về <strong>1 file Word (.docx) duy nhất</strong> chứa đầy đủ cả 4 phần: Ma trận + Bản đặc tả + Đề thi học sinh (Mã 1 & 2) + Hướng dẫn chấm & Audio Scripts. Nộp BGH ký duyệt ngay!
            </p>
          </div>

          {/* Lợi ích 5 */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 group hover:border-blue-300">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">5. Đầy Đủ Audio Script & Thi Nói</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tích hợp sẵn lời thoại bài nghe <strong>Audio Scripts</strong> cho cả 2 mã đề và bảng <strong>Phiếu chấm kỹ năng Nói (Speaking Guidelines)</strong> 4 cột (*To do, To say, Response, Back-up*) giúp kỳ thi cuối kỳ chuẩn chỉnh.
            </p>
          </div>

          {/* Lợi ích 6 */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 group hover:border-blue-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">6. Tặng Đề Cương Ôn Tập Trọng Tâm Lớp 10, 11, 12</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bộ tài liệu ôn tập trọng tâm cho cả 3 khối (10, 11, 12). Giúp Thầy Cô có sẵn tài liệu phụ đạo học sinh, nâng cao phổ điểm khảo sát và chất lượng đại trà môn Tiếng Anh.
            </p>
          </div>
        </div>
      </section>

      {/* 3. BẢNG SO SÁNH: LÀM THỦ CÔNG VS SỬ DỤNG ENG-EXAM PRO 2026 */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200">
          <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">
            BẢNG SO SÁNH HIỆU QUẢ CÔNG VIỆC
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Sự Khác Biệt Giữa Cách Làm Cũ & Sử Dụng Ứng Dụng
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200">
                <th className="p-4 font-black text-slate-700 w-1/3">Tiêu Chí Đánh Giá</th>
                <th className="p-4 font-bold text-rose-700 bg-rose-50/50 w-1/3">Soạn Đề Thủ Công Kiểu Cũ</th>
                <th className="p-4 font-black text-blue-700 bg-blue-50/80 w-1/3">Sử Dụng ENG-EXAM PRO 2026</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-4 font-bold text-slate-800">Thời gian hoàn thành 1 bộ đề</td>
                <td className="p-4 text-slate-600 bg-rose-50/20">Mất từ 3 - 4 giờ căng thẳng</td>
                <td className="p-4 font-black text-emerald-600 bg-blue-50/30">Chỉ mất 30 giây (1 cú click chuột)</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-800">Kẻ bảng ma trận 15 cột & đặc tả 7 cột</td>
                <td className="p-4 text-slate-600 bg-rose-50/20">Dễ nhầm điểm, lệch số câu, tính sai tỷ lệ %</td>
                <td className="p-4 font-bold text-blue-900 bg-blue-50/30">Tự động tính chuẩn xác 100% theo CV 7991</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-800">Hoán vị mã đề (Mã 1 & Mã 2)</td>
                <td className="p-4 text-slate-600 bg-rose-50/20">Dễ bị nhầm đáp án khi xáo trộn thủ công</td>
                <td className="p-4 font-bold text-blue-900 bg-blue-50/30">Tự động đảo A-B-C và lập bảng đáp án song song chuẩn xác</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-800">Thể thức văn bản & Bảng điểm</td>
                <td className="p-4 text-slate-600 bg-rose-50/20">Thường xuyên lỗi font, nhảy dòng, lệch bảng khi in</td>
                <td className="p-4 font-bold text-blue-900 bg-blue-50/30">Chuẩn Nghị định 30, bảng điểm Marks 4 ô Thông tư 22</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-800">Lời thoại bài nghe (Audio Scripts)</td>
                <td className="p-4 text-slate-600 bg-rose-50/20">Phải tự gõ hoặc copy rời rạc</td>
                <td className="p-4 font-bold text-blue-900 bg-blue-50/30">Đính kèm sẵn trong đề thi cho cả 2 mã đề</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-800">Tùy biến Tên trường & Cơ quan</td>
                <td className="p-4 text-slate-600 bg-rose-50/20">Phải sửa lại từng trang, footer từng mã đề</td>
                <td className="p-4 font-bold text-blue-900 bg-blue-50/30">Nhập 1 lần, tự động điền vào toàn bộ hồ sơ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. QUY TRÌNH 3 BƯỚC SIÊU ĐƠN GIẢN */}
      <section className="p-8 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-white rounded-3xl border border-indigo-100 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="text-xs font-black text-indigo-600 uppercase tracking-widest">
            DỄ SỬ DỤNG CHO MỌI GIÁO VIÊN
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Quy Trình 3 Bước Đơn Giản – Không Cần Rành Tin Học
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-indigo-100 shadow-sm space-y-2 relative">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-extrabold text-sm text-slate-800">Chọn Khối Lớp & Kỳ Thi THPT</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Chọn Lớp 10, 11 hoặc 12. Chọn kỳ Giữa kỳ 1, Cuối kỳ 1, Giữa kỳ 2 hoặc Cuối kỳ 2.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-indigo-100 shadow-sm space-y-2 relative">
            <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-extrabold text-sm text-slate-800">Điền Tên Trường THPT & Sở GD&ĐT</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nhập tên Sở GD&ĐT và Trường THPT của Thầy/Cô. Hệ thống tự động ghi nhớ cho các lần sử dụng sau.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-indigo-100 shadow-sm space-y-2 relative">
            <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="font-extrabold text-sm text-slate-800">Bấm Tạo & Tải 1 File Word</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nhấn nút tạo đề. Chỉ sau 30 giây, file Word trọn gói (.docx) sẽ tự động tải về máy tính, sẵn sàng in ấn nộp BGH!
            </p>
          </div>
        </div>
      </section>

      {/* 5. LỜI NGỎ & TÂM SỰ TỪ TÁC GIẢ THẦY ĐINH VĂN THÀNH */}
      <section className="p-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg font-black text-xl shrink-0">
            ĐT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">Thầy giáo Đinh Văn Thành</h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-extrabold">
                Tác giả & Bản quyền
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Giáo viên Tiếng Anh – Tuyên Quang • Hotline/Zalo: <strong>0915.213.717</strong>
            </p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 font-normal">
          <p className="italic text-slate-600">
            "Kính thưa quý Thầy Cô đồng nghiệp trên khắp cả nước!
          </p>
          <p>
            Là một giáo viên trực tiếp đứng lớp giảng dạy bộ môn Tiếng Anh THPT nhiều năm qua, tôi thấu hiểu sâu sắc áp lực và sự vất vả của các Thầy Cô mỗi khi bước vào mùa kiểm tra giữa kỳ, cuối kỳ. Việc phải vừa giảng dạy, vừa soạn đề thi, vừa cân đối ma trận và bản đặc tả kỹ thuật chi tiết theo đúng tinh thần chương trình GDPT 2018 chiếm dụng rất nhiều thời gian nghỉ ngơi quý báu của Thầy Cô.
          </p>
          <p>
            Chính vì vậy, tôi đã dành trọn tâm huyết xây dựng và hoàn thiện phần mềm <strong>ENG-EXAM PRO 2026</strong>. Tôi cam kết tài liệu xuất ra từ phần mềm luôn đảm bảo tính chính xác cao nhất về mặt sư phạm, chuẩn mực về thể thức và sẵn sàng hỗ trợ kỹ thuật tận tình cho tất cả các Thầy Cô."
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Kênh Hỗ Trợ Kỹ Thuật & Kích Hoạt Bản Quyền VIP:</span>
          </div>
          <a
            href="https://zalo.me/0915213717"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <span>Nhắn Zalo: 0915.213.717 (Đinh Thành)</span>
          </a>
        </div>
      </section>

      {/* 6. CALL TO ACTION (CTA BANNER CUỐI TRANG) */}
      <section className="text-center p-8 sm:p-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl space-y-4">
        <h2 className="text-xl sm:text-3xl font-black tracking-tight">
          Sẵn Sàng Trải Nghiệm Công Nghệ Tạo Đề Đột Phá?
        </h2>
        <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto">
          Mỗi thiết bị đều được tặng ngay <strong>5 lượt dùng thử miễn phí đầy đủ tính năng</strong>. Hãy bắt đầu tạo ngay bộ đề kiểm tra cho trường của Thầy/Cô hôm nay!
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onGoToToolThanh}
            className="px-6 py-3.5 bg-white text-blue-800 hover:bg-blue-50 font-black text-xs sm:text-sm rounded-2xl shadow-lg flex items-center gap-2 transition cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Bắt Đầu Tạo Đề Chuẩn Ngay</span>
          </button>

          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="px-6 py-3.5 bg-blue-900/60 hover:bg-blue-900 border border-white/30 text-white font-bold text-xs sm:text-sm rounded-2xl transition cursor-pointer"
            >
              <span>Đăng Ký Nhận 5 Lượt Dùng Thử</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
