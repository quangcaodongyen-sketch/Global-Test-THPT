import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  GraduationCap,
  PhoneCall,
  Key,
  Crown,
  Flame,
  Wand2,
  Library,
  User as UserIcon,
  LogOut,
  Sliders,
  Award,
} from 'lucide-react';
import { User } from '../types/authTypes';

interface HeaderProps {
  activeTab: 'toolThanh' | 'aiSuite' | 'about' | 'library';
  setActiveTab: (tab: 'toolThanh' | 'aiSuite' | 'about' | 'library') => void;
  onOpenDecreeModal: () => void;
  onOpenApiKeyGuide: () => void;
  currentUser: User | null;
  onOpenAuthModal: (defaultTab?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenAdminDashboard: () => void;
  onOpenOutOfTrialsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenDecreeModal,
  onOpenApiKeyGuide,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenAdminDashboard,
  onOpenOutOfTrialsModal,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const isVip =
    (currentUser?.subscription === 'vip_1y' || currentUser?.subscription === 'vip_2y') &&
    (!currentUser?.vipExpiresAt || new Date(currentUser.vipExpiresAt).getTime() > Date.now());
  const isExpired =
    currentUser &&
    (currentUser.subscription === 'expired' ||
      (!isVip && !isAdmin && currentUser.trialCountRemaining <= 0));
  const remainingTrials = currentUser?.trialCountRemaining ?? 5;

  return (
    <header className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white border-b border-blue-900/60 shadow-xl sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      {/* Top Row: Branding & User Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Logo & Author Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl border border-blue-400/30 flex items-center justify-center shadow-lg shrink-0">
              <GraduationCap className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>ENG-EXAM PRO 2026</span>
                  <span className="text-blue-400 font-bold">|</span>
                  <span className="text-blue-300">GLOBAL SUCCESS TEST THPT</span>
                </h1>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> THPT Khối 10, 11, 12
                </span>
              </div>
              <div className="text-xs text-blue-200 mt-0.5 font-medium flex items-center gap-1.5 flex-wrap">
                <span>Tác giả & Bản quyền:</span>
                <strong className="text-white font-extrabold">
                  Thầy giáo Đinh Văn Thành – Tuyên Quang
                </strong>
              </div>
            </div>
          </div>

          {/* Top Actions: Badges, Admin, Hotline, User Auth */}
          <div className="flex items-center flex-wrap gap-2 justify-start lg:justify-end text-xs">
            {/* 1. Phân quyền / Trạng thái bản quyền */}
            {currentUser ? (
              <>
                {isAdmin ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={onOpenAdminDashboard}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/30 border border-purple-400/30 animate-pulse"
                      title="Mở bảng điều khiển quản trị Admin"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>📊 TRANG QUẢN TRỊ ADMIN</span>
                    </button>
                  </div>
                ) : isVip ? (
                  <button
                    onClick={onOpenOutOfTrialsModal}
                    className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded-xl font-bold flex items-center gap-1.5 transition"
                    title="Tài khoản VIP đang hoạt động"
                  >
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>
                      {currentUser.subscription === 'vip_1y' ? 'VIP 1 NĂM' : 'VIP 2 NĂM'}
                      {currentUser.vipExpiresAt &&
                        ` (${new Date(currentUser.vipExpiresAt).toLocaleDateString('vi-VN')})`}
                    </span>
                  </button>
                ) : isExpired ? (
                  <button
                    onClick={onOpenOutOfTrialsModal}
                    className="px-3 py-1.5 bg-rose-950/90 hover:bg-rose-900 border border-rose-500/60 text-rose-300 rounded-xl font-bold flex items-center gap-1.5 transition animate-bounce"
                    title="Nhấn để kích hoạt VIP"
                  >
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>⚠️ Hết lượt dùng thử (0/5) - Kích hoạt VIP</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenOutOfTrialsModal}
                    className="px-3 py-1.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-500/50 text-blue-200 rounded-xl font-bold flex items-center gap-1.5 transition"
                    title="Số lượt dùng thử còn lại"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dùng thử: <strong>Còn {remainingTrials}/5 lượt</strong></span>
                  </button>
                )}

                {/* User Profile Info & Logout */}
                <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-xl border border-white/10">
                  <UserIcon className="w-3.5 h-3.5 text-blue-300" />
                  <span className="font-semibold text-white max-w-[120px] truncate" title={currentUser.fullName}>
                    {currentUser.fullName}
                  </span>
                  <button
                    onClick={onLogout}
                    className="ml-1 p-1 hover:text-rose-400 rounded transition-colors"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Đăng Nhập / Dùng Thử 5 Lượt</span>
              </button>
            )}

            {/* Hotline / Zalo Thầy Thành */}
            <a
              href="https://zalo.me/0915213717"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Hotline / Zalo Thầy Đinh Văn Thành"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Zalo: <strong>0915.213.717</strong></span>
            </a>

            {/* Hướng dẫn cài đặt API Key */}
            <button
              onClick={onOpenApiKeyGuide}
              className="px-2.5 py-1.5 bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-700/60 text-indigo-200 rounded-xl font-semibold transition flex items-center gap-1.5"
              title="Hướng dẫn lấy và cài đặt API Key Google Gemini"
            >
              <Key className="w-3.5 h-3.5 text-amber-300" />
              <span>🔑 Cài đặt API Key</span>
            </button>

            {/* Thể thức Nghị định 30 */}
            <button
              onClick={onOpenDecreeModal}
              className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-semibold transition flex items-center gap-1"
              title="Xem thông tin Thể thức Nghị định 30/2020/NĐ-CP"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">NĐ 30</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-950/70 border-t border-blue-900/30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('toolThanh')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'toolThanh'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>⚡ TẠO ĐỀ CHUẨN THPT (TOOL THẦY THÀNH)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('aiSuite')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'aiSuite'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wand2 className="w-4 h-4 text-teal-300" />
            <span>🤖 TẠO ĐỀ AI THEO UNIT & MẪU TRƯỜNG</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md'
                : 'text-amber-200 hover:text-white hover:bg-white/5 border border-amber-400/30'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>🌟 GIỚI THIỆU & LỢI ÍCH</span>
          </button>

          {/* KHO ĐỀ GỐC: ẨN VỚI NGƯỜI DÙNG, CHỈ ADMIN MỚI XEM ĐƯỢC */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                activeTab === 'library'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                  : 'text-purple-200 hover:text-white hover:bg-purple-950/60 border-purple-500/40 bg-purple-950/20'
              }`}
              title="Kho lưu trữ 20 bộ đề & đề cương gốc (Chỉ dành riêng cho Admin)"
            >
              <Library className="w-4 h-4 text-amber-300" />
              <span>📚 KHO ĐỀ GỐC (ADMIN)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
