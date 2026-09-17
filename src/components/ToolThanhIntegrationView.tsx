import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Settings2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileCheck,
  AlertCircle,
  Clock,
  Layers,
  Bot,
  Flame,
  ShieldAlert,
  FolderOpen,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { AnnexIntegrationItem, IntegrationMode, ProcessingLog } from '../types/annexTypes';
import { User } from '../types/authTypes';
import { AnnexManager } from '../utils/annexManager';
import { ExactLessonPlanEngine, IntegrationExecutionResult } from '../utils/exactLessonPlanEngine';
import { AnnexManagementModal } from './AnnexManagementModal';

interface ToolThanhIntegrationViewProps {
  currentUser: User | null;
  onConsumeTrial: (details: string) => boolean;
  onOpenOutOfTrialsModal: () => void;
}

export const ToolThanhIntegrationView: React.FC<ToolThanhIntegrationViewProps> = ({
  currentUser,
  onConsumeTrial,
  onOpenOutOfTrialsModal,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [integrationMode, setIntegrationMode] = useState<IntegrationMode>('deep_analysis');
  const [injectSection1, setInjectSection1] = useState(true);
  const [injectSection3, setInjectSection3] = useState(true);
  const [selectedAnnexItem, setSelectedAnnexItem] = useState<AnnexIntegrationItem | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('Sẵn sàng');
  const [logs, setLogs] = useState<ProcessingLog[]>([
    {
      timestamp: new Date().toLocaleTimeString(),
      step: 0,
      message: 'Hệ thống tích hợp NLS, AI cấp THCS (CV 5512) đã sẵn sàng. Vui lòng thực hiện theo 3 bước bên trái.',
      type: 'info'
    }
  ]);

  const [executionResult, setExecutionResult] = useState<IntegrationExecutionResult | null>(null);
  const [isAnnexModalOpen, setIsAnnexModalOpen] = useState(false);

  const annexCount = AnnexManager.getItems().length;

  const addLog = (message: string, step = 0, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        step,
        message,
        type
      }
    ]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExecutionResult(null);
      addLog(`Đã chọn giáo án: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 1, 'info');
    }
  };

  // Dùng thử file mẫu có sẵn trong public
  const handleLoadSampleFile = async () => {
    try {
      addLog('Đang nạp file giáo án mẫu chuẩn THCS của Thầy Thành...', 1, 'info');
      const sampleUrl = '/tai_lieu_chuan/BAI 1. KHAI NI?M PT VA H? HAI PT B?C NH?T HAI ?N (ti?t 1,2) - g?c_TichHop_NLS_AI_THCS.docx';
      const res = await fetch(sampleUrl);
      if (!res.ok) {
        throw new Error('Không tìm thấy file mẫu.');
      }
      const blob = await res.blob();
      const sampleFile = new File([blob], 'Giao_An_Mau_Toan_9_Bai_1.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      setSelectedFile(sampleFile);
      setExecutionResult(null);
      addLog('Đã nạp file giáo án mẫu: Giao_An_Mau_Toan_9_Bai_1.docx (260 KB)', 1, 'success');
    } catch (e: any) {
      addLog(`Không thể tải file mẫu: ${e.message}`, 1, 'warning');
    }
  };

  const handleStartIntegration = async () => {
    if (!selectedFile) {
      alert('Vui lòng chọn 1 file giáo án Word (.docx) để bắt đầu!');
      return;
    }

    // Kiểm tra lượt dùng thử
    const hasPermission = onConsumeTrial(`Tích hợp giáo án: ${selectedFile.name}`);
    if (!hasPermission) {
      onOpenOutOfTrialsModal();
      return;
    }

    setIsProcessing(true);
    setProgressPercent(10);
    setExecutionResult(null);
    addLog(`=== BẮT ĐẦU TÍCH HỢP TỰ ĐỘNG THEO PHỤ LỤC III (CV 5512) ===`, 1, 'info');
    addLog(`📄 File gốc: ${selectedFile.name}`, 1, 'info');
    addLog(`🎯 Chế độ: ${integrationMode === 'exact' ? 'Tích hợp Nguyên văn Phụ lục III' : 'Phân tích Sư phạm AI Chi tiết'}`, 1, 'info');

    try {
      const result = await ExactLessonPlanEngine.processLessonPlanDocx({
        file: selectedFile,
        mode: integrationMode,
        injectSection1,
        injectSection3,
        selectedAnnexItem,
        onProgress: (step, total, msg) => {
          const pct = Math.round((step / total) * 100);
          setProgressPercent(pct);
          setCurrentStepText(msg);
          addLog(`[${step}/${total}] ${msg}`, step, 'info');
        }
      });

      setExecutionResult(result);
      setProgressPercent(100);
      setCurrentStepText('Tích hợp thành công 100%!');
      addLog(`🎉 TÍCH HỢP THÀNH CÔNG! Đã tạo file: ${result.fileName}`, 6, 'success');
      addLog(`Nhận diện: Môn ${result.detectedSubject} | Lớp ${result.detectedGrade} | ${result.detectedTitle}`, 6, 'success');
      addLog(`Định dạng: Times New Roman 13pt ĐỎ #FF0000, thụt lề 1.27cm, căn đều 2 bên, bảo toàn 100% công thức toán & hình vẽ.`, 6, 'success');

      // Tự động kích hoạt tải về
      ExactLessonPlanEngine.triggerDownload(result.blob, result.fileName);
    } catch (err: any) {
      addLog(`❌ Lỗi xử lý: ${err.message}`, 0, 'error');
      alert(`Đã xảy ra lỗi khi tích hợp: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 3-Step Stepper Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-4 text-white shadow-xl border border-blue-700/40">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-black">
          <div className="flex items-center gap-2 text-cyan-300">
            <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <span>BƯỚC 1: Đưa Phụ lục III lên</span>
          </div>
          <ArrowRight className="hidden md:block w-5 h-5 text-blue-400 shrink-0" />
          <div className="flex items-center gap-2 text-purple-300">
            <span className="w-6 h-6 rounded-full bg-purple-400 text-slate-950 flex items-center justify-center font-bold text-xs">
              2
            </span>
            <span>BƯỚC 2: Đưa Giáo án lên & Tùy chọn</span>
          </div>
          <ArrowRight className="hidden md:block w-5 h-5 text-blue-400 shrink-0" />
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold text-xs">
              3
            </span>
            <span>BƯỚC 3: Tải về giáo án NLS, AI</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Steps (60%) vs Right Progress & Logs (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3 Steps */}
        <div className="lg:col-span-7 space-y-5">
          {/* ============================================================== */}
          {/* BƯỚC 1: ĐƯA PHỤ LỤC III LÊN */}
          {/* ============================================================== */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border-2 border-cyan-500/50 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-black text-xs">
                  B1
                </span>
                <h3 className="text-sm sm:text-base font-black text-cyan-700 dark:text-cyan-400">
                  BƯỚC 1: ĐƯA PHỤ LỤC III LÊN (KẾ HOẠCH GIÁO DỤC)
                </h3>
              </div>
              <button
                onClick={() => setIsAnnexModalOpen(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>⚙ Quản lý Phụ lục III</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/50 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Kho Phụ lục III đang sẵn sàng:{' '}
                    <strong className="text-cyan-700 dark:text-cyan-300 font-black">{annexCount} bài học</strong>
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  💾 Lưu vĩnh viễn trên máy tính
                </span>
              </div>

              {selectedAnnexItem ? (
                <div className="mt-2.5 pt-2.5 border-t border-cyan-200 dark:border-cyan-900/50 flex items-center justify-between">
                  <div className="truncate">
                    <span className="text-slate-500">Đã ghim bài: </span>
                    <strong className="text-slate-900 dark:text-white font-bold">{selectedAnnexItem.lesson_title}</strong>
                  </div>
                  <button
                    onClick={() => setSelectedAnnexItem(null)}
                    className="text-[11px] text-red-500 hover:underline shrink-0 ml-2"
                  >
                    Bỏ ghim (Tự động nhận diện)
                  </button>
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>💡 Chế độ: Tự động đối chiếu thông minh theo tên bài trong giáo án.</span>
                  <button
                    onClick={() => setIsAnnexModalOpen(true)}
                    className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
                  >
                    Chọn bài cụ thể →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* BƯỚC 2: ĐƯA GIÁO ÁN LÊN & CÁC TÙY CHỌN TÍCH HỢP */}
          {/* ============================================================== */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border-2 border-purple-500/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                  B2
                </span>
                <h3 className="text-sm sm:text-base font-black text-purple-700 dark:text-purple-400">
                  BƯỚC 2: ĐƯA GIÁO ÁN LÊN & CÁC TÙY CHỌN TÍCH HỢP
                </h3>
              </div>
              <button
                onClick={handleLoadSampleFile}
                className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1"
                title="Dùng thử file giáo án Toán 9 có sẵn để test nhanh"
              >
                <span>📄 Dùng thử file mẫu</span>
              </button>
            </div>

            {/* Upload Box */}
            <label className="border-2 border-dashed border-purple-300 dark:border-purple-800/80 hover:border-purple-500 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition bg-purple-50/40 dark:bg-purple-950/20 group">
              <input type="file" accept=".docx" className="hidden" onChange={handleFileChange} />
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-2 group-hover:scale-110 transition text-purple-600 dark:text-purple-300">
                <Upload className="w-6 h-6" />
              </div>
              {selectedFile ? (
                <div>
                  <p className="text-sm font-black text-purple-700 dark:text-purple-300 flex items-center justify-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{selectedFile.name}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dung lượng: {(selectedFile.size / 1024).toFixed(1)} KB • Bấm để đổi file khác
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Bấm để chọn 1 file Giáo án Word (.docx)
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hỗ trợ cả giáo án từng bài đơn lẻ & giáo án tuần (chứa nhiều bài, nhiều môn, nhiều tiết)
                  </p>
                </div>
              )}
            </label>

            {/* 2 Integration Modes */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                CHỌN CHẾ ĐỘ TÍCH HỢP (THEO CÔNG VĂN 5512):
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                <label
                  className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    integrationMode === 'deep_analysis'
                      ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="deep_analysis"
                    checked={integrationMode === 'deep_analysis'}
                    onChange={() => setIntegrationMode('deep_analysis')}
                    className="mt-1 text-purple-600"
                  />
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>LỰA CHỌN 2: LẤY PHỤ LỤC III & PHÂN TÍCH SƯ PHẠM CHI TIẾT</span>
                      <span className="bg-purple-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                        KHUYÊN DÙNG
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      AI gắn mã chỉ báo chuẩn (TT 02/2025, QĐ 2422) và phân tích sâu hành động cụ thể của <strong>Giáo viên</strong>, <strong>Học sinh</strong> và <strong>Sản phẩm/Kết quả</strong> qua 4 hoạt động: Khởi động, Khám phá, Luyện tập, Vận dụng bám sát từng môn THCS.
                    </p>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    integrationMode === 'exact'
                      ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="exact"
                    checked={integrationMode === 'exact'}
                    onChange={() => setIntegrationMode('exact')}
                    className="mt-1 text-purple-600"
                  />
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      LỰA CHỌN 1: TÍCH HỢP NGUYÊN VĂN NỘI DUNG PHỤ LỤC III
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Trích nguyên văn 100% từng câu chữ từ Phụ lục III vào Mục I và Mục III của giáo án mà không chỉnh sửa bất kỳ từ nào.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Checkboxes for Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={injectSection1}
                  onChange={(e) => setInjectSection1(e.target.checked)}
                  className="rounded text-blue-600 w-4 h-4"
                />
                <span>Chèn Mục I (Mục tiêu / Yêu cầu cần đạt)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={injectSection3}
                  onChange={(e) => setInjectSection3(e.target.checked)}
                  className="rounded text-purple-600 w-4 h-4"
                />
                <span>Chèn Mục III (Tiến trình 4 hoạt động)</span>
              </label>
            </div>

            {/* Formatting Guarantee */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <div className="font-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>CAM KẾT QUY CHUẨN THẦY ĐINH VĂN THÀNH:</span>
              </div>
              <p className="leading-relaxed">
                • Phông <strong>Times New Roman 13pt</strong>, chữ <strong>Màu ĐỎ #FF0000</strong>, in thường, căn đều 2 bên, thụt lề 1.27cm.<br />
                • Bảo toàn 100% tài liệu gốc: Giữ nguyên vẹn toàn bộ <strong>công thức toán học (OMML)</strong>, hình vẽ, sơ đồ, bảng biểu, lề trang, Header/Footer.
              </p>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartIntegration}
              disabled={isProcessing || !selectedFile}
              className={`w-full py-3.5 rounded-xl font-black text-sm transition flex items-center justify-center gap-2 shadow-lg ${
                isProcessing || !selectedFile
                  ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-500/30 hover:shadow-blue-500/50'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>ĐANG TIẾN HÀNH TÍCH HỢP... ({progressPercent}%)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>🚀 TIẾN HÀNH TÍCH HỢP TỰ ĐỘNG THEO PHỤ LỤC III</span>
                </>
              )}
            </button>
          </div>

          {/* ============================================================== */}
          {/* BƯỚC 3: TẢI VỀ GIÁO ÁN NLS, AI HOÀN THIỆN */}
          {/* ============================================================== */}
          {executionResult && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 rounded-2xl p-5 shadow-xl border-2 border-emerald-500 space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                    B3
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>BƯỚC 3: TẢI VỀ GIÁO ÁN ĐÃ TÍCH HỢP HOÀN THIỆN</span>
                  </h3>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/60 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="font-bold text-slate-500">Tên tệp xuất bản:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    {executionResult.fileName}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="text-slate-400 text-[10px]">Môn nhận diện</div>
                    <div className="font-bold text-blue-600 dark:text-blue-400">{executionResult.detectedSubject}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="text-slate-400 text-[10px]">Khối lớp</div>
                    <div className="font-bold text-purple-600 dark:text-purple-400">Lớp {executionResult.detectedGrade}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="text-slate-400 text-[10px]">Tiêu đề bài</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 truncate" title={executionResult.detectedTitle}>
                      {executionResult.detectedTitle}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => ExactLessonPlanEngine.triggerDownload(executionResult.blob, executionResult.fileName)}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30"
                >
                  <Download className="w-4 h-4" />
                  <span>📥 BẤM ĐỂ TẢI FILE WORD GIÁO ÁN VỀ MÁY (.DOCX)</span>
                </button>
              </div>

              {/* Preview of Injected Red Texts */}
              <div className="text-xs space-y-2">
                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Xem trước nội dung chữ ĐỎ đã được chèn vào giáo án:</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto space-y-2 font-serif text-[13px] leading-relaxed text-red-600">
                  {executionResult.analysis.objectives_list.map((obj, i) => (
                    <p key={i} className="pl-4">
                      {obj}
                    </p>
                  ))}
                  {injectSection3 && (
                    <>
                      <p className="pl-4 font-sans font-bold text-slate-500 pt-1 text-xs">
                        --- Tiến trình 4 Hoạt động (Mục III) ---
                      </p>
                      <p className="pl-4">{executionResult.analysis.warmup_gv}</p>
                      <p className="pl-4">{executionResult.analysis.discovery_gv}</p>
                      <p className="pl-4">{executionResult.analysis.practice_gv}</p>
                      <p className="pl-4">{executionResult.analysis.application_gv}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Progress & Realtime Logs (40%) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Realtime Status Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>TIẾN TRÌNH XỬ LÝ (CV 5512)</span>
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 italic">
              {currentStepText}
            </p>

            {/* 6 Steps Overview */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              {[
                '1. Đọc tệp Docx',
                '2. Nhận diện môn/lớp',
                '3. Đối chiếu Phụ lục III',
                '4. Phân tích Sư phạm',
                '5. Chèn OpenXML ĐỎ 13pt',
                '6. Đóng gói hoàn tất'
              ].map((step, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-left font-medium ${
                    progressPercent >= ((idx + 1) / 6) * 100
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Realtime Logs Box */}
          <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 shadow-xl border border-slate-800 font-mono text-xs space-y-2 h-[380px] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
              <span>NHẬT KÝ THỜI GIAN THỰC</span>
              <button
                onClick={() => setLogs([])}
                className="hover:text-slate-200 transition text-[10px]"
              >
                Xóa nhật ký
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    log.type === 'success'
                      ? 'text-emerald-400'
                      : log.type === 'warning'
                      ? 'text-amber-400'
                      : log.type === 'error'
                      ? 'text-red-400'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 mr-1.5">[{log.timestamp}]</span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Annex Management Modal */}
      <AnnexManagementModal
        isOpen={isAnnexModalOpen}
        onClose={() => setIsAnnexModalOpen(false)}
        onItemSelect={(item) => {
          setSelectedAnnexItem(item);
          addLog(`Đã ghim bài từ Phụ lục III: ${item.lesson_title} (Môn: ${item.subject})`, 1, 'success');
        }}
      />
    </div>
  );
};
