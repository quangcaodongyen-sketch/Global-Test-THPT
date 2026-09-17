import React, { useState, useEffect } from 'react';
import {
  Grade,
  ExamType,
  AdminInfo,
  TemplateFileData,
  FullExamSuite,
  ExamPaper,
} from './types';
import { Header } from './components/Header';
import { ApiKeyGuideModal } from './components/ApiKeyGuideModal';
import { AuthModal } from './components/AuthModal';
import { OutOfTrialsModal } from './components/OutOfTrialsModal';
import { AdminDashboard } from './components/AdminDashboard';
import { InputForm } from './components/InputForm';
import { MatrixView } from './components/MatrixView';
import { SpecificationView } from './components/SpecificationView';
import { ExamPaperView } from './components/ExamPaperView';
import { AnswerKeyView } from './components/AnswerKeyView';
import { Decree30InfoModal } from './components/Decree30InfoModal';
import { ActivationModal } from './components/ActivationModal';
import { SuccessModal } from './components/SuccessModal';
import { ToolThanhExamView } from './components/ToolThanhExamView';
import { StandardExamsLibraryView } from './components/StandardExamsLibraryView';
import { StudentPracticeView } from './components/StudentPracticeView';
import { AboutView } from './components/AboutView';
import { GLOBAL_SUCCESS_UNITS } from './data/globalSuccessUnits';
import { generateNextPaperVariant } from './utils/variantGenerator';
import {
  generateMatrixAndSpecDocx,
  generateExamPaperDocx,
  generateAnswerKeyDocx,
  generateFullExamPackageDocx,
} from './utils/docxExporter';
import { exportExamSuiteZip } from './utils/zipExporter';
import { generateMatrixExcel, generateSpecificationExcel } from './utils/excelExporter';
import { getLicenseState, LicenseState, getSchoolConfig, saveSchoolConfig } from './utils/licenseManager';
import {
  initAuthDatabase,
  getCurrentUser,
  logoutUser,
  recordUsage,
} from './utils/authManager';
import { User } from './types/authTypes';
import {
  Table,
  FileCheck2,
  FileSpreadsheet,
  Download,
  Eye,
  FileText,
  AlertTriangle,
  HelpCircle,
  Key,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Layers,
  BookOpen,
  Copy,
  GraduationCap,
  Award,
} from 'lucide-react';

export default function App() {
  // Navigation tabs: 'toolThanh' | 'aiSuite' | 'about' | 'library' (Ẩn tab pricing công khai theo yêu cầu)
  const [activeMainTab, setActiveMainTab] = useState<'toolThanh' | 'aiSuite' | 'about' | 'library'>('toolThanh');

  // User Authentication & Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [isOutOfTrialsModalOpen, setIsOutOfTrialsModalOpen] = useState<boolean>(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);

  // AI Suite Exam Generator States
  const [suite, setSuite] = useState<FullExamSuite | null>(null);
  const [activePaperCode, setActivePaperCode] = useState<string>('001');
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'spec' | 'exam' | 'answer'>('exam');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [practicePaper, setPracticePaper] = useState<ExamPaper | null>(null);
  const [showCognition, setShowCognition] = useState<boolean>(true);

  // License & Trial System States
  const [licenseState, setLicenseState] = useState<LicenseState>(() => getLicenseState());
  const [isActivationModalOpen, setIsActivationModalOpen] = useState<boolean>(false);

  // Success Notification Modal State
  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean;
    fileName: string;
    examTitle: string;
    fileBlob?: Blob;
    downloadUrl?: string;
  }>({
    isOpen: false,
    fileName: '',
    examTitle: '',
  });

  // Decree 30 Modal
  const [isDecreeModalOpen, setIsDecreeModalOpen] = useState<boolean>(false);

  // Toast notification
  const [notification, setNotification] = useState<string | null>(null);

  // API Key & Model settings states (Được quản lý bởi ApiKeyGuideModal)
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [selectedModel, setSelectedModel] = useState<string>(
    () => localStorage.getItem('gemini_selected_model') || 'gemini-2.5-flash'
  );
  const [isApiKeyGuideModalOpen, setIsApiKeyGuideModalOpen] = useState<boolean>(false);

  // Khởi tạo cơ sở dữ liệu và session người dùng
  useEffect(() => {
    initAuthDatabase().then(() => {
      const user = getCurrentUser();
      setCurrentUser(user);
      setLicenseState(getLicenseState());
    });
  }, []);

  // Bảo vệ Kho đề: Nếu không phải admin thì tự động chuyển về trang tạo đề chuẩn
  useEffect(() => {
    if (activeMainTab === 'library' && currentUser?.role !== 'admin') {
      setActiveMainTab('toolThanh');
    }
  }, [activeMainTab, currentUser]);

  const refreshLicense = () => {
    const updated = getCurrentUser();
    setCurrentUser(updated);
    setLicenseState(getLicenseState());
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    refreshLicense();
    showToast('👋 Đã đăng xuất khỏi tài khoản.');
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.school && user.school.trim()) {
      saveSchoolConfig(getSchoolConfig().parentAgency, user.school.trim());
    }
    refreshLicense();
    if (user.role === 'admin') {
      showToast('🛡️ Chào mừng Admin Thầy Đinh Văn Thành! Toàn bộ quyền năng hệ thống đã sẵn sàng.');
    } else {
      showToast(`🎉 Đăng nhập thành công: ${user.fullName} (${user.school})`);
    }
  };

  const handleSaveApiKeyConfig = (key: string, model: string) => {
    setApiKey(key);
    setSelectedModel(model);
    localStorage.setItem('gemini_api_key', key);
    localStorage.setItem('gemini_selected_model', model);
    showToast('🔑 Đã lưu API Key và Model AI thành công!');
  };

  // Xử lý khi tạo đề thành công (ghi nhận nhật ký & trừ lượt)
  const handleExamSuccess = (info: {
    fileName: string;
    examTitle: string;
    fileBlob?: Blob;
    downloadUrl?: string;
  }) => {
    // 1. Ghi nhận nhật ký sử dụng
    if (currentUser) {
      recordUsage('Tạo đề kiểm tra', info.examTitle);
    }

    refreshLicense();

    const freshUser = getCurrentUser();
    // 2. Nếu là tài khoản dùng thử và đã hết lượt thì mở popup báo giá / kích hoạt VIP
    if (
      freshUser &&
      freshUser.role !== 'admin' &&
      freshUser.subscription !== 'vip_1y' &&
      freshUser.subscription !== 'vip_2y' &&
      freshUser.trialCountRemaining <= 0
    ) {
      setIsOutOfTrialsModalOpen(true);
    }

    setSuccessModalData({
      isOpen: true,
      fileName: info.fileName,
      examTitle: info.examTitle,
      fileBlob: info.fileBlob,
      downloadUrl: info.downloadUrl,
    });
  };

  // 1. Generate full Exam Suite via backend Gemini API
  const handleGenerateExam = async (config: {
    grade: Grade;
    examType: ExamType;
    selectedUnits: string[];
    adminInfo: AdminInfo;
    customPrompt: string;
    uploadedTemplates: TemplateFileData[];
  }) => {
    // Kiểm tra API Key
    if (!apiKey) {
      setIsApiKeyGuideModalOpen(true);
      return;
    }

    // Kiểm tra quyền sử dụng
    const state = getLicenseState();
    if (!state.isActivated && state.remainingTrials <= 0) {
      setIsOutOfTrialsModalOpen(true);
      return;
    }

    const gradeUnits = GLOBAL_SUCCESS_UNITS[config.grade] || [];
    const unitDetails = config.selectedUnits
      .map((title) => gradeUnits.find((u) => u.title === title))
      .filter(Boolean);

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          ...config,
          unitDetails,
          model: selectedModel,
        }),
      });

      const result = await res.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Lỗi không xác định khi sinh bộ đề.');
      }

      setSuite(result.data);
      setActivePaperCode('001');
      setActiveSubTab('exam');
      handleExamSuccess({
        fileName: `BoDe_TiengAnh_${config.grade}.docx`,
        examTitle: `Bộ đề thi AI Tiếng Anh ${config.grade} (${config.selectedUnits.join(', ')})`,
      });
      showToast('🎉 Đã tự động sinh bộ đề chuẩn Ma trận, Bản đặc tả & Đề kiểm tra Mã 001 thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi kết nối với máy chủ sinh đề. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Generate Next Variant (Code 002, 003...)
  const handleGenerateNextVariant = () => {
    if (!suite || !Array.isArray(suite.papers) || suite.papers.length === 0) return;

    const primaryPaper = suite.papers[0];
    const newVariant = generateNextPaperVariant(primaryPaper, suite.papers.length);

    setSuite((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        papers: [...prev.papers, newVariant],
      };
    });

    setActivePaperCode(newVariant.code);
    setActiveSubTab('exam');
    showToast(`✨ Đã tự động sinh xáo trộn Mã đề ${newVariant.code} thành công!`);
  };

  // 3. Export Single Word Files
  const handleDownloadMatrixSpecDocx = async () => {
    if (!suite || !Array.isArray(suite.papers) || suite.papers.length === 0) return;
    try {
      const blob = await generateMatrixAndSpecDocx(suite, suite.papers[0]);
      downloadBlob(blob, `Matran_Dacta_${(suite.papers[0].grade || '').replace(/\s+/g, '')}.docx`);
      showToast('📥 Đã tải xuống tệp Matran_Dacta.docx!');
    } catch (e: any) {
      alert('Lỗi xuất file Word: ' + e.message);
    }
  };

  const handleDownloadMatrixExcel = async () => {
    if (!suite || !Array.isArray(suite.papers) || suite.papers.length === 0) return;
    const paper = suite.papers[0];
    try {
      const blob = await generateMatrixExcel(
        suite.matrix,
        paper.adminInfo?.schoolName || getSchoolConfig().schoolName || 'THPT Đồng Yên',
        paper.examType,
        paper.adminInfo?.academicYear || '2026-2027',
        paper.grade
      );
      downloadBlob(blob, `MaTran_DeKT_${(paper.grade || '').replace(/\s+/g, '')}.xlsx`);
      showToast('📥 Đã tải xuống tệp MaTran.xlsx!');
    } catch (e: any) {
      alert('Lỗi xuất file Excel: ' + e.message);
    }
  };

  const handleDownloadSpecExcel = async () => {
    if (!suite || !Array.isArray(suite.papers) || suite.papers.length === 0) return;
    const paper = suite.papers[0];
    try {
      const blob = await generateSpecificationExcel(
        suite.specifications,
        paper.adminInfo?.schoolName || getSchoolConfig().schoolName || 'THPT Đồng Yên',
        paper.examType,
        paper.adminInfo?.academicYear || '2026-2027',
        paper.grade
      );
      downloadBlob(blob, `DacTa_DeKT_${(paper.grade || '').replace(/\s+/g, '')}.xlsx`);
      showToast('📥 Đã tải xuống tệp DacTa.xlsx!');
    } catch (e: any) {
      alert('Lỗi xuất file Excel: ' + e.message);
    }
  };

  const handleDownloadPaperDocx = async (paper: ExamPaper) => {
    try {
      const blob = await generateExamPaperDocx(paper, showCognition);
      downloadBlob(blob, `Detap_MaDe${paper.code}.docx`);
      showToast(`📥 Đã tải xuống tệp Detap_MaDe${paper.code}.docx!`);
    } catch (e: any) {
      alert('Lỗi xuất file Word: ' + e.message);
    }
  };

  const handleDownloadAnswerKeyDocx = async (paper: ExamPaper) => {
    try {
      const blob = await generateAnswerKeyDocx(paper);
      downloadBlob(blob, `DapAn_HuongDanCham_MaDe${paper.code}.docx`);
      showToast(`📥 Đã tải xuống tệp DapAn_HuongDanCham_MaDe${paper.code}.docx!`);
    } catch (e: any) {
      alert('Lỗi xuất file Word: ' + e.message);
    }
  };

  // 4. Export 1 Single Full Exam Package Word File (.docx)
  const handleDownloadFullPackageDocx = async () => {
    if (!suite || !Array.isArray(suite.papers) || suite.papers.length === 0) return;
    try {
      const blob = await generateFullExamPackageDocx(suite, showCognition);
      const paper0 = suite.papers[0];
      const fileName = `BoDe_TronGoi_TiengAnh_${(paper0.grade || '').replace(/\s+/g, '')}_${(paper0.examType || '').replace(/\s+/g, '_')}.docx`;
      downloadBlob(blob, fileName);
      showToast('📄 Đã tải xuống thành công 1 File Word trọn bộ (Ma trận + Đặc tả + Đề thi + Đáp án)!');
    } catch (e: any) {
      alert('Lỗi xuất file Word trọn gói: ' + e.message);
    }
  };

  // 5. Export ZIP Package following Decree 30
  const handleExportZip = async () => {
    if (!suite || !Array.isArray(suite.papers) || suite.papers.length === 0) return;
    try {
      const zipBlob = await exportExamSuiteZip(suite, showCognition);
      const paper0 = suite.papers[0];
      const fileName = `BoDe_TiengAnh_${(paper0.grade || '').replace(/\s+/g, '')}_${(paper0.examType || '').replace(/\s+/g, '_')}.zip`;
      downloadBlob(zipBlob, fileName);
      showToast('📦 Đã đóng gói và tải xuống thành công bộ tệp ZIP chuẩn Nghị định 30 & Bộ GDĐT!');
    } catch (e: any) {
      alert('Lỗi đóng gói file ZIP: ' + e.message);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentPaper = Array.isArray(suite?.papers)
    ? suite.papers.find((p) => p.code === activePaperCode) || suite.papers[0]
    : undefined;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/40 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header with Author Branding, Tabs & License Badge */}
      <Header
        activeTab={activeMainTab}
        setActiveTab={setActiveMainTab}
        onOpenDecreeModal={() => setIsDecreeModalOpen(true)}
        onOpenApiKeyGuide={() => setIsApiKeyGuideModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={(defaultTab) => {
          setAuthModalTab(defaultTab || 'login');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onOpenOutOfTrialsModal={() => setIsOutOfTrialsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Feature Stats Bar: Thể hiện quy mô 48 Units & Sinh đề vô tận */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900">30 Units SGK Toàn Diện</div>
              <div className="text-[11px] text-slate-500 font-medium">Lớp 10, 11, 12 (Toàn bộ SGK Global Success THPT)</div>
            </div>
          </div>

          <div className="p-4 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900">Sinh Đề Mới Vô Tận</div>
              <div className="text-[11px] text-slate-500 font-medium">Tự động tạo câu hỏi mới không trùng lặp</div>
            </div>
          </div>

          <div className="p-4 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900">Chuẩn GDPT 2018 THPT</div>
              <div className="text-[11px] text-slate-500 font-medium">Ma trận 4 mức độ & Bản đặc tả chi tiết</div>
            </div>
          </div>

          <div className="p-4 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900">Kho Đề Gốc Chuẩn Mẫu THPT</div>
              <div className="text-[11px] text-slate-500 font-medium">Kèm Audio bài nghe & Speaking Test</div>
            </div>
          </div>
        </section>

        {/* TAB 1: TOOL TẠO ĐỀ CHUẨN THẦY THÀNH */}
        {activeMainTab === 'toolThanh' && (
          <ToolThanhExamView
            onExamSuccess={handleExamSuccess}
            onOpenActivationModal={() => setIsOutOfTrialsModalOpen(true)}
            onSwitchToAiSuite={() => setActiveMainTab('aiSuite')}
          />
        )}

        {/* TAB 2: TẠO ĐỀ AI NÂNG CAO (THEO UNIT & MẪU TRƯỜNG) */}
        {activeMainTab === 'aiSuite' && (
          <div>
            {practicePaper ? (
              <StudentPracticeView
                paper={practicePaper}
                onBack={() => setPracticePaper(null)}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Config & Input Controls (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <InputForm
                    onGenerateExam={handleGenerateExam}
                    onGenerateNextVariant={handleGenerateNextVariant}
                    onExportZip={handleExportZip}
                    isGenerating={isGenerating}
                    hasGeneratedSuite={!!suite}
                    variantCount={Array.isArray(suite?.papers) ? suite.papers.length : 0}
                  />
                </div>

                {/* Right Column: Output Preview & Tabs (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {suite ? (
                    <div className="space-y-4">
                      {/* Tab Navigation Controls */}
                      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-1 overflow-x-auto">
                        <button
                          onClick={() => setActiveSubTab('exam')}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[110px] ${
                            activeSubTab === 'exam'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          <span>1. Đề Kiểm tra ({Array.isArray(suite.papers) ? suite.papers.length : 0} mã)</span>
                        </button>

                        <button
                          onClick={() => setActiveSubTab('matrix')}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[100px] ${
                            activeSubTab === 'matrix'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <Table className="w-4 h-4" />
                          <span>2. Ma Trận</span>
                        </button>

                        <button
                          onClick={() => setActiveSubTab('spec')}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[100px] ${
                            activeSubTab === 'spec'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <Layers className="w-4 h-4" />
                          <span>3. Bản Đặc Tả</span>
                        </button>

                        <button
                          onClick={() => setActiveSubTab('answer')}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[110px] ${
                            activeSubTab === 'answer'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>4. Đáp Án</span>
                        </button>
                      </div>

                      {/* Quick Export Action Bar */}
                      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 rounded-xl border border-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <FileArchive className="w-5 h-5 text-amber-400 shrink-0" />
                          <div>
                            <p className="text-xs font-bold">Xuất Hồ Sơ Đề Kiểm Tra (Chuẩn Công Văn 7991)</p>
                            <p className="text-[11px] text-indigo-200">
                              Lựa chọn tải 1 file Word trọn gói đầy đủ 4 phần hoặc tải trọn bộ file nén ZIP
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <button
                            onClick={handleDownloadFullPackageDocx}
                            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow cursor-pointer shrink-0"
                            title="Tải 1 file Word duy nhất đầy đủ Ma trận, Bản đặc tả, Đề thi và Đáp án"
                          >
                            <FileText className="w-4 h-4" />
                            <span>📄 Tải 1 File Word Trọn Gói</span>
                          </button>

                          <button
                            onClick={handleExportZip}
                            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow cursor-pointer shrink-0"
                            title="Tải trọn bộ các tệp Word riêng lẻ đóng gói dạng ZIP"
                          >
                            <Download className="w-4 h-4" />
                            <span>📦 Tải File Nén ZIP</span>
                          </button>
                        </div>
                      </div>

                      {/* Tab Render Views */}
                      {activeSubTab === 'exam' && (
                        <ExamPaperView
                          papers={suite.papers}
                          activePaperCode={activePaperCode}
                          onSelectPaperCode={setActivePaperCode}
                          onGenerateNextVariant={handleGenerateNextVariant}
                          onDownloadPaperDocx={handleDownloadPaperDocx}
                          onDownloadFullPackageDocx={handleDownloadFullPackageDocx}
                          onPracticeOnline={(paper) => setPracticePaper(paper)}
                          showCognition={showCognition}
                          onToggleCognition={setShowCognition}
                        />
                      )}

                      {activeSubTab === 'matrix' && (
                        <MatrixView
                          matrix={suite.matrix}
                          summary={suite.summary}
                          onDownloadDocx={handleDownloadMatrixSpecDocx}
                          onDownloadExcel={handleDownloadMatrixExcel}
                        />
                      )}

                      {activeSubTab === 'spec' && (
                        <SpecificationView
                          specifications={suite.specifications}
                          onDownloadDocx={handleDownloadMatrixSpecDocx}
                          onDownloadExcel={handleDownloadSpecExcel}
                        />
                      )}

                      {activeSubTab === 'answer' && currentPaper && (
                        <AnswerKeyView
                          paper={currentPaper}
                          onDownloadDocx={() => handleDownloadAnswerKeyDocx(currentPaper)}
                        />
                      )}
                    </div>
                  ) : (
                    /* Empty Placeholder State before generating */
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center space-y-4 shadow-sm">
                      <div className="w-16 h-16 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                        <Sparkles className="w-8 h-8 text-indigo-600" />
                      </div>
                      <div className="max-w-md mx-auto">
                        <h3 className="text-base font-bold text-slate-800">
                          Tạo Đề Nâng Cao Bằng Trợ Lý AI Theo Unit SGK & Mẫu Trường
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Chọn khối lớp, loại bài kiểm tra, tích chọn các Unit kiến thức bên trái và bấm nút{' '}
                          <span className="font-bold text-indigo-700">"Tự động sinh bộ đề chuẩn"</span>.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left pt-2 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="font-bold text-indigo-900">1. Chuẩn Ma Trận</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Tự động cân bằng 4 mức độ nhận thức 40-30-20-10%</p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="font-bold text-indigo-900">2. Đa Dạng Mã Đề</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Tạo thêm các mã 002, 003... bằng 1 cú nhấp chuột</p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="font-bold text-indigo-900">3. Xuất File Word & ZIP</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Xuất .docx định dạng chuẩn Nghị định 30/2020/NĐ-CP</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB GIỚI THIỆU: LỢI ÍCH ỨNG DỤNG CHO GIÁO VIÊN */}
        {activeMainTab === 'about' && (
          <AboutView
            onGoToToolThanh={() => setActiveMainTab('toolThanh')}
            onGoToAiSuite={() => setActiveMainTab('aiSuite')}
            onOpenAuthModal={() => {
              setAuthModalTab('register');
              setIsAuthModalOpen(true);
            }}
          />
        )}

        {/* TAB 3: THƯ VIỆN 20 BỘ ĐỀ & ĐỀ CƯƠNG GỐC CHUẨN - CHỈ DÀNH CHO ADMIN */}
        {activeMainTab === 'library' && (
          currentUser?.role === 'admin' ? (
            <StandardExamsLibraryView
              onExamSuccess={handleExamSuccess}
              onOpenActivationModal={() => setIsOutOfTrialsModalOpen(true)}
            />
          ) : (
            <div className="p-8 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-lg">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Khu Vực Lưu Trữ Nội Bộ</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Kho 20 bộ đề và đề cương gốc chuẩn hóa là tài nguyên nội bộ độc quyền dành riêng cho Quản trị viên (Admin Thầy Đinh Văn Thành).
              </p>
              <button
                onClick={() => setActiveMainTab('toolThanh')}
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-700 transition shadow-md"
              >
                Quay lại Trang Tạo Đề Chuẩn
              </button>
            </div>
          )
        )}
      </main>

      {/* Auth Modal: Đăng Nhập & Đăng Ký Thành Viên (Cấp 5 lượt dùng thử) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultTab={authModalTab}
      />

      {/* Out of Trials Modal: Thông báo hết lượt & Bảng giá VIP 1 Năm (200k) / 2 Năm (300k) */}
      <OutOfTrialsModal
        isOpen={isOutOfTrialsModalOpen}
        onClose={() => setIsOutOfTrialsModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Admin Dashboard: 5 Phân hệ Quản trị Toàn diện cho Thầy Thành */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => {
          setIsAdminDashboardOpen(false);
          refreshLicense();
        }}
        currentUser={currentUser}
        onOpenLibrary={() => setActiveMainTab('library')}
      />

      {/* Hướng Dẫn Cài Đặt API Key Chuẩn Giáo Viên (6 Bước + 4 Nút) */}
      <ApiKeyGuideModal
        isOpen={isApiKeyGuideModalOpen}
        onClose={() => setIsApiKeyGuideModalOpen(false)}
        currentApiKey={apiKey}
        currentModel={selectedModel}
        onSave={handleSaveApiKeyConfig}
      />

      {/* Activation Modal cũ (Key Bản Quyền Offline nếu có) */}
      <ActivationModal
        isOpen={isActivationModalOpen}
        onClose={() => setIsActivationModalOpen(false)}
        onActivated={() => {
          refreshLicense();
          setIsActivationModalOpen(false);
          showToast('🎉 Kích hoạt bản quyền thành công! Cảm ơn Thầy/Cô đã ủng hộ phần mềm!');
        }}
      />

      {/* Success Notification Modal Dialog */}
      <SuccessModal
        isOpen={successModalData.isOpen}
        fileName={successModalData.fileName}
        examTitle={successModalData.examTitle}
        fileBlob={successModalData.fileBlob}
        downloadUrl={successModalData.downloadUrl}
        remainingTrials={licenseState.remainingTrials}
        isActivated={licenseState.isActivated}
        onClose={() => setSuccessModalData((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Decree 30 Modal */}
      <Decree30InfoModal
        isOpen={isDecreeModalOpen}
        onClose={() => setIsDecreeModalOpen(false)}
      />

      {/* Footer Bản Quyền Thầy Đinh Văn Thành */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="font-extrabold text-white text-sm">
            © 2026 - 2027 PHẦN MỀM TẠO ĐỀ TIẾNG ANH THPT (ENG-EXAM PRO & GLOBAL SUCCESS TEST)
          </p>
          <p className="text-slate-400">
            Tác giả & Bản quyền:{' '}
            <strong className="text-blue-400">Thầy giáo Đinh Văn Thành – Tuyên Quang</strong>{' '}
            | ĐT/Zalo:{' '}
            <a href="https://zalo.me/0915213717" target="_blank" rel="noreferrer" className="text-amber-400 font-bold hover:underline">
              0915.213.717
            </a>
          </p>
          <p className="text-[11px] text-slate-500">
            Hệ thống biên soạn Đề kiểm tra THPT chuẩn GDPT 2018, Công văn 5512/BGDĐT & Thể thức văn bản Nghị định 30/2020/NĐ-CP
          </p>
        </div>
      </footer>
    </div>
  );
}
