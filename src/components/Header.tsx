import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  PhoneCall,
  Key,
  Crown,
  Flame,
  Wand2,
  Library,
  User as UserIcon,
  LogOut,
  Sliders,
  FileCheck2,
  FileCode,
} from 'lucide-react';
import { User } from '../types/authTypes';

interface HeaderProps {
  activeTab: 'toolThanh' | 'aiSuite' | 'about' | 'library';
  setActiveTab: (tab: 'toolThanh' | 'aiSuite' | 'about' | 'library') => void;
  onOpenDecreeModal?: () => void;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Logo & Author Branding */}
          <div className="flex items-center space-x-3">
            <img
              src="/assets/thay_thanh_circle.png"
              alt="Thầy Đinh Văn Thành"
              className="w-12 h-12 rounded-full border-2 border-amber-400 shadow-lg object-cover shrink-0 bg-blue-900"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span className="text-amber-400">✨ NLS-AI THCS PRO 2026</span>
                  <span className="text-blue-400 font-bold">|</span>
                  <span className="text-blue-200">TÍCH HỢP GIÁO ÁN THCS</span>
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-300" /> Chuẩn CV 5512 & TT 02/2025
                </span>
              </div>
              <div className="text-xs text-blue-200 mt-0.5 font-medium flex items-center gap-1.5 flex-wrap">
                <span>Tác giả & Bản quyền:</span>
                <strong className="text-white font-extrabold">
                  Thầy giáo Đinh Văn Thành – Trường THCS Đồng Yên, tỉnh Tuyên Quang
                </strong>
                <span className="text-amber-300 font-bold flex items-center gap-1 ml-1">
                  <PhoneCall className="w-3 h-3" /> 0915.213.717
                </span>
              </div>
            </div>
          </div>

          {/* Top Actions: Badges, Admin, Hotline, User Auth */}
          <div className="flex items-center flex-wrap gap-2 justify-start lg:justify-end text-xs">
            {/* 1. Phân quyền / Trạng thái bản quyền */}
            {currentUser ? (
              <>
                {isAdmin ? (
                  <button
                    onClick={onOpenAdminDashboard}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/30 border border-purple-400/30 animate-pulse"
                    title="Mở bảng điều khiển quản trị Admin"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>📊 TRANG QUẢN TRỊ ADMIN</span>
                  </button>
                ) : isVip ? (
                  <button
                    onClick={onOpenOutOfTrialsModal}
                    className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-700/30 border border-emerald-400/30"
                    title="Tài khoản VIP Đang kích hoạt"
                  >
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>👑 THÀNH VIÊN VIP CHÍNH THỨC</span>
                  </button>
                ) : isExpired ? (
                  <button
                    onClick={onOpenOutOfTrialsModal}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-red-700/40 animate-bounce border border-red-400/40"
                    title="Bấm để kích hoạt tài khoản VIP"
                  >
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>⚠ HẾT LƯỢT DÙNG THỬ [KÍCH HOẠT VIP]</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenOutOfTrialsModal}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/30 border border-amber-300"
                    title="Xem thông tin lượt dùng thử"
                  >
                    <Flame className="w-4 h-4 text-slate-950" />
                    <span>🎁 DÙNG THỬ: CÒN {remainingTrials}/5 BÀI [VIP]</span>
                  </button>
                )}

                {/* Tên thành viên & Nút Đăng xuất */}
                <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/15">
                  <UserIcon className="w-3.5 h-3.5 text-blue-300" />
                  <span className="font-bold text-white max-w-[130px] truncate" title={currentUser.fullName}>
                    {currentUser.fullName}
                  </span>
                  <button
                    onClick={onLogout}
                    className="ml-1 text-slate-300 hover:text-red-300 transition p-0.5 rounded hover:bg-white/10"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition flex items-center gap-1 border border-white/20"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Đăng Nhập</span>
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold transition flex items-center gap-1 shadow-md shadow-blue-600/30"
                >
                  <span>Đăng Ký (5 Lượt Free)</span>
                </button>
              </div>
            )}

            {/* Hotline Thầy Thành */}
            <a
              href="https://zalo.me/0915213717"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl font-semibold transition flex items-center gap-1.5 border border-blue-400/30"
              title="Nhắn Zalo Thầy Đinh Văn Thành"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
              <span>Zalo: 0915.213.717</span>
            </a>

            {/* Nút Hướng Dẫn Cài Đặt API Key */}
            <button
              onClick={onOpenApiKeyGuide}
              className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-semibold transition flex items-center gap-1.5 shadow-sm border border-emerald-400/30"
              title="Hướng dẫn lấy và cài đặt Google Gemini API Key"
            >
              <Key className="w-3.5 h-3.5 text-amber-300" />
              <span>🔑 Hướng dẫn API Key</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 scrollbar-thin">
            {/* Tab 1: Tool Thầy Thành (Mặc định) */}
            <button
              onClick={() => setActiveTab('toolThanh')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap shadow-sm ${
                activeTab === 'toolThanh'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30 ring-2 ring-blue-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-amber-300" />
              <span>⚡ TÍCH HỢP GIÁO ÁN THCS (TOOL THẦY THÀNH)</span>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-bold ml-1">
                CV 5512
              </span>
            </button>

            {/* Tab 2: AI Suite */}
            <button
              onClick={() => setActiveTab('aiSuite')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shadow-sm ${
                activeTab === 'aiSuite'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/30 ring-2 ring-purple-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wand2 className="w-4 h-4 text-pink-300" />
              <span>🤖 TÍCH HỢP AI CHUYÊN SÂU & TRỢ LÝ</span>
              <span className="bg-purple-400/20 text-purple-300 text-[10px] px-1.5 py-0.5 rounded font-bold ml-1">
                Gemini AI
              </span>
            </button>

            {/* Tab 3: Giới thiệu & Lợi ích */}
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shadow-sm ${
                activeTab === 'about'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>🌟 GIỚI THIỆU & LỢI ÍCH ỨNG DỤNG</span>
            </button>

            {/* Tab 4: Kho Phụ lục III & Tài liệu gốc (CHỈ ADMIN MỚI THẤY) */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('library')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap shadow-sm border border-purple-500/40 ${
                  activeTab === 'library'
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-purple-600/30 ring-2 ring-purple-400/50'
                    : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
                }`}
              >
                <Library className="w-4 h-4 text-amber-300" />
                <span>📚 KHO PHỤ LỤC III & TÀI LIỆU GỐC</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.5 rounded-full font-black ml-1">
                  ADMIN ONLY
                </span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
