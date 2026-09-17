import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Bot,
  Copy,
  Check,
  Download,
  Key,
  Layers,
  BookOpen,
  Send,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { PedagogicalAnalyzer } from '../utils/pedagogicalAnalyzer';
import { ExactLessonPlanEngine } from '../utils/exactLessonPlanEngine';
import { User } from '../types/authTypes';

interface AIAssistantViewProps {
  currentUser: User | null;
  onOpenApiKeyGuide: () => void;
  onConsumeTrial: (details: string) => boolean;
  onOpenOutOfTrialsModal: () => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  currentUser,
  onOpenApiKeyGuide,
  onConsumeTrial,
  onOpenOutOfTrialsModal,
}) => {
  const [subject, setSubject] = useState('Toán');
  const [grade, setGrade] = useState('9');
  const [lessonTitle, setLessonTitle] = useState('Bài 1: Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['NLS', 'AI']);
  const [additionalNote, setAdditionalNote] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const topicOptions = [
    { id: 'NLS', label: 'Năng lực số (TT 02/2025)', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300' },
    { id: 'AI', label: 'Trí tuệ nhân tạo (QĐ 2422)', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-300' },
    { id: 'STEM', label: 'Giáo dục STEM (CV 3089)', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300' },
    { id: 'ANQP', label: 'An ninh quốc phòng (TT 08/2024)', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-300' },
    { id: 'QCN', label: 'Quyền con người / Kỹ năng sống', color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40 border-pink-300' },
    { id: 'BVMT', label: 'Bảo vệ môi trường / BĐKH', color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-300' },
    { id: 'GDTC', label: 'Giáo dục tài chính', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-300' },
    { id: 'GDĐP', label: 'Giáo dục địa phương', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300' },
  ];

  const toggleTopic = (id: string) => {
    if (selectedTopics.includes(id)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((t) => t !== id));
      }
    } else {
      setSelectedTopics([...selectedTopics, id]);
    }
  };

  const handleGenerateAI = async () => {
    if (!lessonTitle.trim()) {
      alert('Vui lòng nhập tên bài học!');
      return;
    }

    const hasPermission = onConsumeTrial(`Trợ lý AI phân tích bài: ${lessonTitle}`);
    if (!hasPermission) {
      onOpenOutOfTrialsModal();
      return;
    }

    setIsLoading(true);
    setAiResult(null);

    const apiKey = localStorage.getItem('gemini_api_key_2026') || '';

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Bạn là chuyên gia sư phạm hàng đầu của Bộ Giáo dục & Đào tạo Việt Nam, chuyên về chương trình GDPT 2018 cấp THCS theo Công văn 5512/BGDĐT-GDTrH, Thông tư 02/2025/TT-BGDĐT (Khung năng lực số) và Quyết định 2422/QĐ-BGDĐT (Khung giáo dục AI phổ thông).

Hãy thiết kế kế hoạch tích hợp sư phạm hoàn chỉnh cho bài dạy:
- Môn: ${subject}
- Khối lớp: ${grade}
- Tên bài dạy: ${lessonTitle}
- Các nội dung tích hợp bắt buộc: ${selectedTopics.join(', ')}
${additionalNote ? `- Ghi chú thêm của giáo viên: ${additionalNote}` : ''}

YÊU CẦU ĐỊNH DẠNG ĐẦU RA BẮT BUỘC (Times New Roman 13pt màu đỏ):
1. PHẦN MỤC TIÊU (MỤC I):
Mỗi nội dung tích hợp là một gạch đầu dòng riêng biệt có Mã chỉ báo chuẩn (ví dụ: * NLS [NLS.1.2 - NLS.3.1]: ...; * AI [AI.2 - AI.3]: ...; * ANQP [ANQP.1]: ...).
${subject.toLowerCase().includes('tiếng anh') ? 'ĐẶC BIỆT: Môn Tiếng Anh phải viết 100% bằng tiếng Anh chuẩn quốc tế, dùng Digital Competence (không viết tắt NLS) và AI.' : ''}

2. PHẦN TIẾN TRÌNH DẠY HỌC (MỤC III) QUA 4 HOẠT ĐỘNG:
Phân tích chi tiết hành động của Giáo viên (GV), thao tác của Học sinh (HS) và Sản phẩm / Kết quả tương tác cụ thể:
- Hoạt động 1: Khởi động (Warm-up)
- Hoạt động 2: Khám phá / Hình thành kiến thức mới (Discovery)
- Hoạt động 3: Luyện tập / Thực hành (Practice)
- Hoạt động 4: Vận dụng / Mở rộng (Application)

Hãy trả về văn bản sư phạm chuẩn mực, trang trọng, thiết thực, có thể đưa ngay vào giáo án.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        if (response.text) {
          setAiResult(response.text);
          setIsLoading(false);
          return;
        }
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to offline pedagogical analyzer:', err);
      }
    }

    // Fallback Offline Generator nếu chưa có API Key hoặc gặp lỗi
    const analysis = PedagogicalAnalyzer.generateIntegration({
      subject,
      grade,
      lessonTitle,
      mode: 'deep_analysis'
    });

    const fallbackOutput = `=== NỘI DUNG TÍCH HỢP NLS, AI & CHUYÊN ĐỀ GIÁO DỤC CẤP THCS ===
Môn: ${subject} | Lớp: ${grade} | ${lessonTitle}
Căn cứ: CV 5512/BGDĐT, TT 02/2025/TT-BGDĐT, QĐ 2422/QĐ-BGDĐT

I. MỤC TIÊU (Bổ sung vào cuối Mục I trước Mục II):
${analysis.objectives_list.join('\n')}

III. TIẾN TRÌNH DẠY HỌC (Tích hợp vào Mục III qua 4 Hoạt động):

1. HOẠT ĐỘNG 1: KHỞI ĐỘNG (WARM-UP)
- Hoạt động của GV: ${analysis.warmup_gv}
- Hoạt động của HS: ${analysis.warmup_hs}
- Sản phẩm / Kết quả: ${analysis.warmup_prod}

2. HOẠT ĐỘNG 2: KHÁM PHÁ / HÌNH THÀNH KIẾN THỨC MỚI (DISCOVERY)
- Hoạt động của GV: ${analysis.discovery_gv}
- Hoạt động của HS: ${analysis.discovery_hs}
- Sản phẩm / Kết quả: ${analysis.discovery_prod}

3. HOẠT ĐỘNG 3: LUYỆN TẬP / THỰC HÀNH (PRACTICE)
- Hoạt động của GV: ${analysis.practice_gv}
- Hoạt động của HS: ${analysis.practice_hs}
- Sản phẩm / Kết quả: ${analysis.practice_prod}

4. HOẠT ĐỘNG 4: VẬN DỤNG / MỞ RỘNG (APPLICATION)
- Hoạt động của GV: ${analysis.application_gv}
- Hoạt động của HS: ${analysis.application_hs}
- Sản phẩm / Kết quả: ${analysis.application_prod}

⭐ Quy chuẩn định dạng: Times New Roman, cỡ chữ 13pt, chữ màu ĐỎ #FF0000, thụt lề 1.27cm, căn đều 2 bên.`;

    setAiResult(fallbackOutput);
    setIsLoading(false);
  };

  const handleCopy = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTextDocx = () => {
    if (!aiResult) return;
    const blob = new Blob([aiResult], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TichHop_AI_${lessonTitle.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-indigo-950 rounded-2xl p-5 text-white shadow-xl border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-purple-600/40 rounded-2xl border border-purple-400/30 shrink-0">
            <Bot className="w-8 h-8 text-pink-300" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <span>🤖 TRỢ LÝ AI TÍCH HỢP GIÁO ÁN CHUYÊN SÂU</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-500/30 text-pink-200 border border-pink-400/40">
                Gemini 2.5 Flash
              </span>
            </h2>
            <p className="text-xs text-purple-200 mt-0.5">
              Sinh kịch bản sư phạm tích hợp Năng lực số, AI, STEM, ANQP... theo yêu cầu bài học cụ thể
            </p>
          </div>
        </div>

        <button
          onClick={onOpenApiKeyGuide}
          className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/20 shrink-0"
        >
          <Key className="w-3.5 h-3.5 text-amber-300" />
          <span>Cài đặt Gemini API Key</span>
        </button>
      </div>

      {/* Grid Configuration vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: 5 Cols */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>THIẾT LẬP BÀI HỌC CẦN TÍCH HỢP</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Môn học THCS</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full mt-1 p-2 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                {Object.keys(PedagogicalAnalyzer.SUBJECTS).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Khối lớp</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full mt-1 p-2 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                <option value="6">Lớp 6</option>
                <option value="7">Lớp 7</option>
                <option value="8">Lớp 8</option>
                <option value="9">Lớp 9</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tên bài dạy / Chủ đề</label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="VD: Bài 14: Phản xạ âm thanh - Chống ô nhiễm tiếng ồn"
              className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Chọn các nội dung tích hợp:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {topicOptions.map((topic) => {
                const active = selectedTopics.includes(topic.id);
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => toggleTopic(topic.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                      active
                        ? topic.color
                        : 'text-slate-500 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-60'
                    }`}
                  >
                    {active ? '✔ ' : '+ '}
                    {topic.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Gợi ý công cụ / Yêu cầu sư phạm bổ sung (tùy chọn)
            </label>
            <textarea
              rows={2}
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
              placeholder="VD: Muốn dùng thí nghiệm ảo PhET, phần mềm GeoGebra hoặc tổ chức trò chơi Quizizz..."
              className="w-full mt-1 p-2 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <button
            onClick={handleGenerateAI}
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md ${
              isLoading
                ? 'bg-purple-300 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/30'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>AI ĐANG THIẾT KẾ KỊCH BẢN SƯ PHẠM...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>PHÂN TÍCH VÀ TẠO KỊCH BẢN TÍCH HỢP (AI)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output: 7 Cols */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-pink-600" />
              <span>KẾT QUẢ PHÂN TÍCH SƯ PHẠM AI</span>
            </h3>

            {aiResult && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                </button>
                <button
                  onClick={handleExportTextDocx}
                  className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg flex items-center gap-1 border border-blue-200 dark:border-blue-900/40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải văn bản</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 mt-3 overflow-y-auto">
            {aiResult ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 font-serif text-[13.5px] leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                {aiResult}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-500">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                    Chưa có kịch bản tích hợp nào
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Nhập tên bài học và bấm nút <strong>"Phân tích và tạo kịch bản tích hợp (AI)"</strong> ở cột bên trái để nhận kết quả phân tích sư phạm chi tiết.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
