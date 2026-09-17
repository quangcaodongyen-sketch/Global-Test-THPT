import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  School,
  Save,
  CheckCircle2,
  FileText,
  Clock,
  Mic,
  MicOff,
  BookOpen,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  getSchoolConfig,
  saveSchoolConfig,
  consumeTrial,
  getLicenseState,
} from '../utils/licenseManager';
import {
  downloadCustomizedStandardDocx,
  generateDynamicExamFromExactTemplate,
} from '../utils/exactExamTemplateEngine';

interface ToolThanhExamViewProps {
  onExamSuccess: (info: {
    fileName: string;
    examTitle: string;
    fileBlob?: Blob;
    downloadUrl?: string;
  }) => void;
  onOpenActivationModal: () => void;
  onSwitchToAiSuite?: () => void;
}

interface ExamMeta {
  file: string;
  relPath: string;
  topics: string;
  score: string;
  speaking: string;
  isSpeaking: boolean;
  pills: string[];
}

const EXAM_CATALOG: Record<string, Record<string, ExamMeta>> = {
  '10': {
    GK1: {
      file: 'GK1 - Anh 10.docx',
      relPath: '/bo_de_chuan/Tieng_Anh_10/Giua_Ky_1/GK1 - Anh 10.docx',
      topics: 'Unit 1: Family Life, Unit 2: Humans and the Environment, Unit 3: Music',
      score: '100% Đề kiểm tra Viết trên giấy (10.0 điểm) • Thời gian làm bài: 60 phút.',
      speaking: 'Không có phần thi Nói (Giữa kỳ chỉ thi Viết trên giấy).',
      isSpeaking: false,
      pills: ['Hiện tại đơn vs Tiếp diễn', 'Will vs Be going to', 'To-infinitive & Bare infinitive', 'Từ vựng Gia đình & Môi trường'],
    },
    CK1: {
      file: 'CK1 - Anh 10.docx',
      relPath: '/bo_de_chuan/Tieng_Anh_10/Cuoi_Ky_1/CK1 - Anh 10.docx',
      topics: 'Unit 1 đến Unit 5 (For a Better Community, Inventions)',
      score: 'Đề viết 8.0 điểm + Bài thi Nói Speaking 2.0 điểm = Tổng 10.0 điểm • 60 phút.',
      speaking: 'Có Speaking 2.0đ: Giới thiệu bản thân + Trình bày chủ đề kèm Examiner Script.',
      isSpeaking: true,
      pills: ['Quá khứ đơn vs Tiếp diễn', 'Hiện tại hoàn thành', 'Bình đẳng giới', 'Speaking Test 2.0đ'],
    },
    GK2: {
      file: 'GK2 - Anh 10.docx',
      relPath: '/bo_de_chuan/Tieng_Anh_10/Giua_Ky_2/GK2 - Anh 10.docx',
      topics: 'Unit 6: Gender Equality, Unit 7: Viet Nam & International Organisations, Unit 8: New Ways to Learn',
      score: '100% Đề kiểm tra Viết trên giấy (10.0 điểm) • Thời gian làm bài: 60 phút.',
      speaking: 'Không có phần thi Nói.',
      isSpeaking: false,
      pills: ['Passive with modals', 'So sánh hơn & nhất', 'Mệnh đề quan hệ who/which/that', 'Học tập kỹ thuật số'],
    },
    CK2: {
      file: 'CK2 - Anh 10.docx',
      relPath: '/bo_de_chuan/Tieng_Anh_10/Cuoi_Ky_2/CK2 - Anh 10.docx',
      topics: 'Unit 6 đến Unit 10 (Protecting the Environment, Ecotourism)',
      score: 'Đề viết 8.0 điểm + Bài thi Nói Speaking 2.0 điểm = Tổng 10.0 điểm • 60 phút.',
      speaking: 'Có Speaking 2.0đ: Phỏng vấn & Thảo luận chủ đề du lịch sinh thái.',
      isSpeaking: true,
      pills: ['Reported speech', 'Câu điều kiện loại 1 & 2', 'Bảo tồn đa dạng sinh học', 'Speaking Test 2.0đ'],
    },
  },
  '11': {
    GK1: {
      file: 'GK1 - Anh 11.docx',
      relPath: '/bo_de_chuan/Tieng_Anh_11/Giua_Ky_1/GK1 - Anh 11.docx',
      topics: 'Unit 1: A Long and Healthy Life, Unit 2: The Generation Gap, Unit 3: Cities of the Future',
      score: '100% Đề kiểm tra Viết trên giấy (10.0 điểm) • Thời gian làm bài: 60 phút.',
      speaking: 'Không có phần thi Nói (Giữa kỳ chỉ thi Viết trên giấy).',
      isSpeaking: false,
      pills: ['Quá khứ đơn vs Hiện tại hoàn thành', 'Modal verbs must/should', 'Stative verbs', 'Đô thị tương lai'],
    },
    CK1: {
      file: 'CK1 - Anh 11.docx',
      relPath: '/bo_de_chuan/Tieng_Anh_11/Cuoi_Ky_1/CK1 - Anh 11.docx',
      topics: 'Unit 1 đến Unit 5 (ASEAN and Viet Nam, Global Warming)',
      score: 'Đề viết 8.0 điểm + Bài thi Nói Speaking 2.0 điểm = Tổng 10.0 điểm • 60 phút.',
      speaking: 'Có Speaking 2.0đ: Examiner Script & Chủ đề văn hóa ASEAN.',
      isSpeaking: true,
      pills: ['Gerunds làm chủ ngữ/tân ngữ', 'Participle clauses', 'Nóng lên toàn cầu', 'Speaking Test 2.0đ'],
    },
    GK2: {
      file: 'GK2 - Anh 11.docx',
      relPath: '/bo_de_chuan/Tieng_Anh_11/Giua_Ky_2/GK2 - Anh 11.docx',
      topics: 'Unit 6: Preserving Our Heritage, Unit 7: Education Options, Unit 8: Becoming Independent',
      score: '100% Đề kiểm tra Viết trên giấy (10.0 điểm) • Thời gian làm bài: 60 phút.',
      speaking: 'Không có phần thi Nói.',
      isSpeaking: false,
      pills: ['To-infinitive clauses', 'Perfect gerunds & participles', 'Cleft sentences It is... that', 'Kỹ năng tự lập'],
    },
    CK2: {
      file: 'CK2 - Anh 11.docx',
      relPath: '/bo_de_chuan/Tieng_Anh_11/Cuoi_Ky_2/CK2 - Anh 11.docx',
      topics: 'Unit 6 đến Unit 10 (Social Issues, The Ecosystem)',
      score: 'Đề viết 8.0 điểm + Bài thi Nói Speaking 2.0 điểm = Tổng 10.0 điểm • 60 phút.',
      speaking: 'Có Speaking 2.0đ: Thảo luận vấn đề xã hội & Bảo tồn hệ sinh thái.',
      isSpeaking: true,
      pills: ['Linking words nguyên nhân - kết quả', 'Compound nouns', 'Hệ sinh thái', 'Speaking Test 2.0đ'],
    },
  },
  '12': {
    GK1: {
      file: 'GK1 - Anh 12.docx',
      relPath: '/bo_de_chuan/Tieng_Anh_12/Giua_Ky_1/GK1 - Anh 12.docx',
      topics: 'Unit 1: Life Stories We Admire, Unit 2: A Multicultural World, Unit 3: Green Living',
      score: '100% Đề kiểm tra Viết trên giấy (10.0 điểm) • Thời gian làm bài: 60 phút.',
      speaking: 'Không có phần thi Nói.',
      isSpeaking: false,
      pills: ['Quá khứ hoàn thành', 'Mạo từ a/an/the/zero', 'Mệnh đề nhượng bộ although/despite', 'Tiểu sử danh nhân'],
    },
    CK1: {
      file: 'CK1 - Anh 12.docx',
      relPath: '/bo_de_chuan/Tieng_Anh_12/Cuoi_Ky_1/CK1 - Anh 12.docx',
      topics: 'Unit 1 đến Unit 5 (Urbanisation, The World of Work)',
      score: 'Đề viết 8.0 điểm + Bài thi Nói Speaking 2.0 điểm = Tổng 10.0 điểm • 60 phút.',
      speaking: 'Có Speaking 2.0đ: Green Living & Life Stories We Admire (2 Topics).',
      isSpeaking: true,
      pills: ['Câu giả định Subjunctive', 'Dependent prepositions', 'Đô thị hóa & Việc làm', 'Speaking Test 2.0đ'],
    },
    GK2: {
      file: 'GK2 - Anh 12.docx',
      relPath: '/bo_de_chuan/Tieng_Anh_12/Giua_Ky_2/GK2 - Anh 12.docx',
      topics: 'Unit 6: Artificial Intelligence, Unit 7: The World of Mass Media, Unit 8: Wildlife Conservation',
      score: '100% Đề kiểm tra Viết trên giấy (10.0 điểm) • Thời gian làm bài: 60 phút.',
      speaking: 'Không có phần thi Nói.',
      isSpeaking: false,
      pills: ['Passive reporting verbs', 'Participle clauses', 'Mixed conditionals', 'Trí tuệ nhân tạo AI'],
    },
    CK2: {
      file: 'CK2 - Anh 12.docx',
      relPath: '/bo_de_chuan/Tieng_Anh_12/Cuoi_Ky_2/CK2 - Anh 12.docx',
      topics: 'Unit 6 đến Unit 10 (Career Paths, Lifelong Learning - Khảo thí THPT Chuyên)',
      score: 'Đề viết 8.0 điểm + Bài thi Nói Speaking 2.0 điểm = Tổng 10.0 điểm • 60 phút.',
      speaking: 'Có Speaking 2.0đ: Bộ 5 Đề thi Nói Speaking chuyên sâu.',
      isSpeaking: true,
      pills: ['Phrasal verbs', 'Đảo ngữ Inversion', 'Định hướng sự nghiệp', 'Bộ 5 Đề thi Nói'],
    },
  },
};

export const ToolThanhExamView: React.FC<ToolThanhExamViewProps> = ({
  onExamSuccess,
  onOpenActivationModal,
  onSwitchToAiSuite,
}) => {
  const [grade, setGrade] = useState<'10' | '11' | '12'>('10');
  const [term, setTerm] = useState<'GK1' | 'CK1' | 'GK2' | 'CK2'>('GK1');
  const [parentAgency, setParentAgency] = useState<string>('SỞ GD&ĐT TUYÊN QUANG');
  const [schoolName, setSchoolName] = useState<string>(() => getSchoolConfig().schoolName || 'THPT Đồng Yên');
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    const cfg = getSchoolConfig();
    if (cfg.parentAgency) setParentAgency(cfg.parentAgency);
    if (cfg.schoolName) setSchoolName(cfg.schoolName);
  }, []);

  const handleSaveConfig = () => {
    saveSchoolConfig(parentAgency, schoolName);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const currentMeta = EXAM_CATALOG[grade]?.[term] || EXAM_CATALOG['10']['GK1'];

  // 1. Tải đề chuẩn có sẵn (Tự động điền Tên Trường & Cơ quan cấp trên của Thầy/Cô)
  const handleDownloadStandard = async () => {
    const trial = consumeTrial();
    if (!trial.allowed) {
      onOpenActivationModal();
      return;
    }

    saveSchoolConfig(parentAgency, schoolName);
    setIsGenerating(true);
    try {
      const result = await downloadCustomizedStandardDocx({
        relPath: currentMeta.relPath,
        defaultFileName: currentMeta.file,
        parentAgency,
        schoolName,
      });

      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      onExamSuccess({
        fileName: result.fileName,
        examTitle: `Đề Thi Gốc Chuẩn Tiếng Anh ${grade} (${term})`,
        fileBlob: result.blob,
      });
    } catch (err: any) {
      alert(`Không thể tải file đề mẫu: ${err?.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Sinh đề mới ngẫu nhiên tương đương theo đúng khuôn mẫu gốc
  const handleGenerateDynamic = async () => {
    const trial = consumeTrial();
    if (!trial.allowed) {
      onOpenActivationModal();
      return;
    }

    saveSchoolConfig(parentAgency, schoolName);
    setIsGenerating(true);
    try {
      const result = await generateDynamicExamFromExactTemplate({
        grade,
        term,
        parentAgency,
        schoolName,
      });

      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      onExamSuccess({
        fileName: result.fileName,
        examTitle: `Đề Thi Hoán Vị Mã ${result.code1}-${result.code2} (Tiếng Anh ${grade})`,
        fileBlob: result.blob,
      });
    } catch (err: any) {
      alert(`Lỗi sinh đề: ${err?.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="p-6 text-white shadow-xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Bộ Đề Thi Chuẩn THPT (Lớp 10, 11, 12)
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              TẠO ĐỀ THI TIẾNG ANH THPT CHUẨN MẪU KHẢO THÍ
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
              Kế thừa 100% kho đề chuẩn, ma trận 4 mức độ nhận thức, bản đặc tả chi tiết và tệp nghe Audio bài học SGK Global Success Lớp 10, 11, 12.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-1.5">
            <div className="px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-right">
              <span className="text-[11px] font-bold text-blue-200 block">Tác giả biên soạn:</span>
              <span className="text-xs font-black text-amber-300 block">Thầy Đinh Văn Thành – Tuyên Quang</span>
              <span className="text-[11px] font-extrabold text-white block">Hotline/Zalo: 0915.213.717</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cấu hình thông tin & Chọn Đề */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Thông tin cơ quan & Trường học */}
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Thông Tin Hành Chính Của Thầy/Cô
                </span>
              </div>
              {isSavedNotice && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu cấu hình!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block mb-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  CƠ QUAN QUẢN LÝ (SỞ GD&ĐT):
                </label>
                <input
                  type="text"
                  value={parentAgency}
                  onChange={(e) => setParentAgency(e.target.value)}
                  onBlur={handleSaveConfig}
                  placeholder="Ví dụ: SỞ GD&ĐT TUYÊN QUANG"
                  className="w-full px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block mb-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  TÊN TRƯỜNG THPT:
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  onBlur={handleSaveConfig}
                  placeholder="Ví dụ: THPT Đồng Yên"
                  className="w-full px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Chọn Khối lớp & Kỳ kiểm tra */}
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-5">
            <div>
              <label className="block mb-2.5 text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>1. Chọn Khối Lớp THPT:</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['10', '11', '12'] as const).map((g) => {
                  const isSelected = grade === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`p-3.5 text-center transition-all rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className={`text-2xl font-black ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                        {g}
                      </span>
                      <span className={`text-xs font-extrabold uppercase mt-0.5 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>
                        Lớp {g}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block mb-2.5 text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>2. Chọn Kỳ Kiểm Tra Định Kỳ:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'GK1', name: 'Giữa Học kỳ I', tag: '10.0đ Viết', desc: 'Units 1 - 3. Đề kiểm tra 60 phút, Listening, Language, Reading, Writing.' },
                  { id: 'CK1', name: 'Cuối Học kỳ I', tag: '8.0đ + 2.0đ Nói', desc: 'Units 1 - 5. Đề viết 8.0đ + Bài thi Nói Speaking 2.0đ (Script & tiêu chí chấm).' },
                  { id: 'GK2', name: 'Giữa Học kỳ II', tag: '10.0đ Viết', desc: 'Units 6 - 8. Đề kiểm tra 60 phút, bám sát ma trận 4 mức độ nhận thức.' },
                  { id: 'CK2', name: 'Cuối Học kỳ II', tag: '8.0đ + 2.0đ Nói', desc: 'Units 6 - 10. Đề viết 8.0đ + Bài thi Nói Speaking 2.0đ.' },
                ].map((item) => {
                  const isSelected = term === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setTerm(item.id as any)}
                      className={`p-3.5 transition-all rounded-xl border-2 cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-black ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                          {item.name}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-800 rounded-md">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-500 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-2.5">
              <button
                type="button"
                onClick={handleGenerateDynamic}
                disabled={isGenerating}
                className="flex items-center justify-center w-full gap-2 py-3.5 text-sm font-black text-white transition-all shadow-md bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-indigo-800 active:scale-98 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {isGenerating
                    ? 'Đang nạp mẫu và xử lý mã đề...'
                    : `SINH 02 MÃ ĐỀ MỚI NGẪU NHIÊN (TIẾNG ANH ${grade})`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadStandard}
                disabled={isGenerating}
                className="flex items-center justify-center w-full gap-2 py-2.5 text-xs font-bold text-slate-700 transition-all border border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl active:scale-98"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Tải đề gốc chuẩn có sẵn (Tự động điền Tên Trường của Thầy/Cô)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Preview chi tiết đề mẫu */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Thông Tin Bài Kiểm Tra Đã Chọn
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-black bg-blue-100 text-blue-800 rounded-full">
                Lớp {grade} • {term}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-500 block mb-0.5">Tệp Mẫu Gốc:</span>
                <span className="font-extrabold text-blue-700 break-all">{currentMeta.file}</span>
              </div>

              <div>
                <span className="font-bold text-slate-500 block mb-0.5">Trọng tâm bài học:</span>
                <span className="font-semibold text-slate-800 leading-relaxed block">{currentMeta.topics}</span>
              </div>

              <div>
                <span className="font-bold text-slate-500 block mb-0.5">Cơ cấu điểm:</span>
                <span className="font-semibold text-slate-700 block">{currentMeta.score}</span>
              </div>

              <div>
                <span className="font-bold text-slate-500 block mb-0.5">Phần thi Nói (Speaking):</span>
                <span className="font-semibold text-slate-700 block">{currentMeta.speaking}</span>
              </div>

              <div>
                <span className="font-bold text-slate-500 block mb-1">Chủ điểm ngữ pháp trọng tâm:</span>
                <div className="flex flex-wrap gap-1">
                  {currentMeta.pills.map((pill, pIdx) => (
                    <span key={pIdx} className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
