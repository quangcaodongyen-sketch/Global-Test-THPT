import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ToolThanhIntegrationView } from './components/ToolThanhIntegrationView';
import { AIAssistantView } from './components/AIAssistantView';
import { AboutView } from './components/AboutView';
import { StandardAnnexLibraryView } from './components/StandardAnnexLibraryView';
import { AuthModal } from './components/AuthModal';
import { OutOfTrialsModal } from './components/OutOfTrialsModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ApiKeyGuideModal } from './components/ApiKeyGuideModal';
import {
  initAuthDatabase,
  getCurrentUser,
  logoutUser,
  recordUsage,
} from './utils/authManager';
import { User } from './types/authTypes';
import { ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // 4 Tab Điều Hướng Chuẩn Mực: 'toolThanh' | 'aiSuite' | 'about' | 'library'
  const [activeMainTab, setActiveMainTab] = useState<'toolThanh' | 'aiSuite' | 'about' | 'library'>('toolThanh');

  // User Authentication & Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [isOutOfTrialsModalOpen, setIsOutOfTrialsModalOpen] = useState<boolean>(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('info');

  // API Key & Model settings states (Quản lý qua ApiKeyGuideModal)
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [selectedModel, setSelectedModel] = useState<string>(
    () => localStorage.getItem('gemini_selected_model') || 'gemini-2.5-flash'
  );
  const [isApiKeyGuideModalOpen, setIsApiKeyGuideModalOpen] = useState<boolean>(false);

  // Khởi tạo cơ sở dữ liệu Auth và tải phiên làm việc
  useEffect(() => {
    initAuthDatabase().then(() => {
      const user = getCurrentUser();
      setCurrentUser(user);
    });
  }, []);

  // Bảo vệ Kho Phụ lục III & Tài liệu gốc: Nếu không phải Admin thì tự chuyển về tab Tool Thầy Thành
  useEffect(() => {
    if (activeMainTab === 'library' && currentUser?.role !== 'admin') {
      setActiveMainTab('toolThanh');
    }
  }, [activeMainTab, currentUser]);

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const refreshUserSession = () => {
    const fresh = getCurrentUser();
    setCurrentUser(fresh);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    showToast('👋 Đã đăng xuất khỏi tài khoản thành công.', 'info');
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      showToast('🛡️ Chào mừng Thầy Đinh Văn Thành! Toàn bộ quyền năng quản trị hệ thống đã sẵn sàng.', 'success');
    } else {
      showToast(`🎉 Đăng nhập thành công: ${user.fullName} (${user.school})`, 'success');
    }
  };

  const handleSaveApiKeyConfig = (key: string, model: string) => {
    setApiKey(key);
    setSelectedModel(model);
    localStorage.setItem('gemini_api_key', key);
    localStorage.setItem('gemini_selected_model', model);
    showToast('🔑 Đã lưu API Key và Model AI thành công!', 'success');
  };

  /**
   * Hàm tiêu thụ lượt dùng thử (Trừ 1 lượt khi tích hợp thành công)
   * Trả về true nếu được phép tiếp tục, false nếu bị chặn
   */
  const handleConsumeTrial = (details: string): boolean => {
    const user = getCurrentUser();

    // 1. Nếu chưa đăng nhập: Yêu cầu đăng nhập hoặc đăng ký để nhận 5 lượt dùng thử
    if (!user) {
      setAuthModalTab('register');
      setIsAuthModalOpen(true);
      showToast('Thầy/Cô vui lòng Đăng ký nhanh hoặc Đăng nhập để nhận 5 lượt tích hợp dùng thử miễn phí!', 'info');
      return false;
    }

    // 2. Ghi nhận và khấu trừ lượt dùng
    const res = recordUsage('Tích hợp giáo án NLS-AI', details);
    refreshUserSession();

    if (!res.success) {
      setIsOutOfTrialsModalOpen(true);
      showToast(res.message || 'Bạn đã sử dụng hết lượt dùng thử.', 'error');
      return false;
    }

    if (!res.isVipOrAdmin) {
      showToast(`✅ Đã tích hợp thành công! Thầy/Cô còn ${res.remaining}/5 lượt dùng thử.`, 'success');
      if (res.remaining <= 0) {
        setTimeout(() => {
          setIsOutOfTrialsModalOpen(true);
        }, 1200);
      }
    } else {
      showToast('✅ Đã tích hợp giáo án thành công (Đặc quyền VIP/Admin không giới hạn)!', 'success');
    }

    return true;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* Toast Notification Floating */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
              toastType === 'success'
                ? 'bg-emerald-900/90 text-white border-emerald-500/50'
                : toastType === 'error'
                ? 'bg-rose-900/90 text-white border-rose-500/50'
                : 'bg-slate-900/90 text-white border-blue-500/50'
            }`}
          >
            {toastType === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toastType === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toastType === 'info' && <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />}
            <p className="text-xs sm:text-sm font-medium leading-snug">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Header Chuẩn Mực 4 Tab & Bản Quyền Thầy Thành */}
      <Header
        activeTab={activeMainTab}
        setActiveTab={setActiveMainTab}
        onOpenApiKeyGuide={() => setIsApiKeyGuideModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={(tab) => {
          setAuthModalTab(tab || 'login');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onOpenOutOfTrialsModal={() => setIsOutOfTrialsModalOpen(true)}
      />

      {/* Nội dung chính điều hướng theo 4 Tab */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: ⚡ TÍCH HỢP GIÁO ÁN THCS (TOOL THẦY THÀNH) - MẶC ĐỊNH */}
        {activeMainTab === 'toolThanh' && (
          <ToolThanhIntegrationView
            currentUser={currentUser}
            onConsumeTrial={handleConsumeTrial}
            onOpenOutOfTrialsModal={() => setIsOutOfTrialsModalOpen(true)}
          />
        )}

        {/* TAB 2: 🤖 TÍCH HỢP AI CHUYÊN SÂU & TRỢ LÝ SOẠN BÀI */}
        {activeMainTab === 'aiSuite' && (
          <AIAssistantView
            currentUser={currentUser}
            onOpenApiKeyGuide={() => setIsApiKeyGuideModalOpen(true)}
            onConsumeTrial={handleConsumeTrial}
            onOpenOutOfTrialsModal={() => setIsOutOfTrialsModalOpen(true)}
          />
        )}

        {/* TAB 3: 🌟 GIỚI THIỆU & LỢI ÍCH ỨNG DỤNG */}
        {activeMainTab === 'about' && (
          <AboutView onStartTrial={() => setActiveMainTab('toolThanh')} />
        )}

        {/* TAB 4: 📚 KHO PHỤ LỤC III & TÀI LIỆU GỐC (CHỈ DÀNH CHO ADMIN) */}
        {activeMainTab === 'library' && (
          currentUser?.role === 'admin' ? (
            <StandardAnnexLibraryView currentUser={currentUser} />
          ) : (
            <div className="p-8 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xl">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Khu Vực Quản Trị Nội Bộ</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Kho Phụ lục III và các tài liệu gốc chuẩn hóa là tài nguyên nội bộ độc quyền dành riêng cho Quản trị viên (Admin Thầy giáo Đinh Văn Thành).
              </p>
              <button
                onClick={() => setActiveMainTab('toolThanh')}
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-700 transition shadow-md"
              >
                Quay lại Trang Tích Hợp Giáo Án
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

      {/* Out of Trials Modal: Thông báo hết lượt & Kích hoạt VIP 1 Năm (200k) / 2 Năm (300k) */}
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
          refreshUserSession();
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

      {/* Footer Bản Quyền Thầy Đinh Văn Thành Bất Biến */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="font-black text-white text-sm tracking-wide">
              © 2026 - 2027 CÔNG CỤ TÍCH HỢP NĂNG LỰC SỐ, AI VÀ CÁC NỘI DUNG GIÁO DỤC CẤP THCS (NLS-AI THCS PRO)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-bold">
              Bản Quyền Chính Thức
            </span>
          </div>

          <p className="text-slate-300">
            Tác giả & Bản quyền:{' '}
            <strong className="text-blue-400 font-bold">Thầy giáo Đinh Văn Thành – Trường THCS Đồng Yên, tỉnh Tuyên Quang</strong>{' '}
            | ĐT/Zalo:{' '}
            <a
              href="https://zalo.me/0915213717"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 font-extrabold hover:underline"
            >
              0915.213.717
            </a>
          </p>

          <p className="text-[11px] text-slate-400 max-w-4xl mx-auto leading-relaxed">
            Hệ thống tích hợp chuẩn mực theo Công văn 5512/BGDĐT-GDTrH, Thông tư 02/2025/TT-BGDĐT, Thông tư 18/2026/TT-BGDĐT, Quyết định 2422/QĐ-BGDĐT và Công văn 5588/BGDĐT. Bảo toàn 100% định dạng, công thức toán học và bảng biểu giáo án.
          </p>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-6 text-[11px] text-slate-400">
            <span>🛡️ Bảo mật SHA-256 Web Crypto</span>
            <span>•</span>
            <span>🔒 Nhận diện thiết bị Canvas 2D (Không chặn IP trường học)</span>
            <span>•</span>
            <span>⚡ Khởi tạo trực tiếp không cần mạng Internet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
