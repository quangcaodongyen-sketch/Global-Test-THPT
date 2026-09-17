import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  BarChart3,
  BookOpen,
  Settings,
  Search,
  Filter,
  Crown,
  Lock,
  Unlock,
  Key,
  RefreshCw,
  Download,
  Upload,
  Clock,
  Calendar,
  Phone,
  School,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  TrendingUp,
  Sparkles,
  Save,
  Check,
  Eye,
} from 'lucide-react';
import {
  getAllUsers,
  getUsageRecords,
  getLessonPlans,
  getAdminMetrics,
  getSystemSettings,
  updateSystemSettings,
  activateUserVip,
  toggleLockUser,
  resetUserPassword,
  changeAdminPassword,
  exportDatabase,
  importDatabase,
} from '../utils/authManager';
import { User, UsageRecord, LessonPlanRecord, AdminMetrics, SystemSettings } from '../types/authTypes';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenLibrary?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenLibrary,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'lessonPlans' | 'analytics' | 'settings'>('overview');

  // Dữ liệu thời gian thực
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlanRecord[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(getSystemSettings());

  // Bộ lọc thành viên
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal phụ: Reset mật khẩu thành viên
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');

  // Form đổi mật khẩu Admin
  const [oldAdminPass, setOldAdminPass] = useState<string>('');
  const [newAdminPass, setNewAdminPass] = useState<string>('');
  const [confirmAdminPass, setConfirmAdminPass] = useState<string>('');
  const [adminPassNotice, setAdminPassNotice] = useState<{ success: boolean; message: string } | null>(null);

  // Thông báo chung
  const [toastMessage, setToastMessage] = useState<{ success: boolean; text: string } | null>(null);

  const showToast = (text: string, success = true) => {
    setToastMessage({ success, text });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshData = () => {
    setMetrics(getAdminMetrics());
    setUsers(getAllUsers());
    setUsageRecords(getUsageRecords());
    setLessonPlans(getLessonPlans());
    setSettings(getSystemSettings());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      setAdminPassNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Lọc danh sách thành viên
  const filteredUsers = users.filter(u => {
    if (u.role === 'admin') return false; // Không hiển thị root admin trong danh sách sửa
    const matchSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);

    if (!matchSearch) return false;

    if (filterStatus === 'trial') return u.subscription === 'trial';
    if (filterStatus === 'vip') return (u.subscription === 'vip_1y' || u.subscription === 'vip_2y');
    if (filterStatus === 'expired') return u.subscription === 'expired';
    if (filterStatus === 'locked') return u.isLocked;

    return true;
  });

  // Kích hoạt VIP
  const handleActivateVip = (userId: string, pkg: 'vip_1y' | 'vip_2y') => {
    const success = activateUserVip(userId, pkg);
    if (success) {
      showToast(`Đã kích hoạt thành công gói ${pkg === 'vip_1y' ? 'VIP 1 Năm' : 'VIP 2 Năm'}!`);
      refreshData();
    } else {
      showToast('Kích hoạt thất bại. Vui lòng thử lại.', false);
    }
  };

  // Khóa / mở khóa
  const handleToggleLock = (userId: string) => {
    const success = toggleLockUser(userId);
    if (success) {
      showToast('Đã cập nhật trạng thái khóa/mở khóa tài khoản!');
      refreshData();
    }
  };

  // Reset mật khẩu
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset || !newPasswordInput.trim()) return;

    const success = await resetUserPassword(selectedUserForReset.id, newPasswordInput.trim());
    if (success) {
      showToast(`Đã đổi mật khẩu cho ${selectedUserForReset.username} thành công!`);
      setSelectedUserForReset(null);
      setNewPasswordInput('');
      refreshData();
    } else {
      showToast('Lỗi khi đổi mật khẩu.', false);
    }
  };

  // Đổi mật khẩu Admin
  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldAdminPass || !newAdminPass) {
      setAdminPassNotice({ success: false, message: 'Vui lòng điền đủ mật khẩu cũ và mới!' });
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      setAdminPassNotice({ success: false, message: 'Mật khẩu mới xác nhận không khớp!' });
      return;
    }
    if (newAdminPass.length < 6) {
      setAdminPassNotice({ success: false, message: 'Mật khẩu mới phải từ 6 ký tự trở lên!' });
      return;
    }

    const res = await changeAdminPassword(oldAdminPass, newAdminPass);
    if (res.success) {
      setAdminPassNotice({ success: true, message: '✅ Đã đổi mật khẩu Admin an toàn thành công!' });
      setOldAdminPass('');
      setNewAdminPass('');
      setConfirmAdminPass('');
    } else {
      setAdminPassNotice({ success: false, message: res.error || 'Đổi mật khẩu thất bại.' });
    }
  };

  // Lưu cài đặt hệ thống
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings(settings);
    showToast('Đã lưu cấu hình hệ thống thành công!');
  };

  // Export JSON
  const handleExportData = () => {
    const dataStr = exportDatabase();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_he_thong_gst2026_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống file sao lưu hệ thống!');
  };

  // Import JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const res = importDatabase(content);
      if (res.success) {
        showToast(res.message);
        refreshData();
      } else {
        showToast(res.message, false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-900/80 backdrop-blur-md overflow-hidden">
      <div className="relative w-full h-full flex flex-col bg-slate-50 text-slate-800">
        {/* Top Navbar Admin */}
        <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white px-6 py-4 flex items-center justify-between shadow-xl border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight">HỆ THỐNG QUẢN TRỊ ADMIN TOÀN DIỆN</h1>
                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30">
                  Thầy Đinh Văn Thành
                </span>
              </div>
              <p className="text-xs text-blue-200">
                THCS Đồng Yên, Tuyên Quang • Hotline/Zalo: 0915213717
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenLibrary && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLibrary();
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-600/30 text-white border border-purple-400/40 transition"
                title="Mở kho lưu trữ 20 bộ đề và 4 đề cương gốc chuẩn"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Mở Kho Phụ Lục III & Tài Liệu Gốc</span>
                <span className="sm:hidden">Kho Phụ Lục III</span>
              </button>
            )}
            <button
              onClick={refreshData}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Làm Mới
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              title="Đóng trang Admin"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Toast thông báo */}
        {toastMessage && (
          <div
            className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border animate-in slide-in-from-top duration-200 ${
              toastMessage.success
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-rose-600 text-white border-rose-400'
            }`}
          >
            {toastMessage.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toastMessage.text}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-slate-200 px-6 flex gap-2 shrink-0 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Tổng quan', icon: BarChart3 },
            { id: 'members', label: `👥 Quản lý thành viên (${users.length - 1})`, icon: Users },
            { id: 'lessonPlans', label: `📚 Hồ sơ giáo án & tài liệu (${lessonPlans.length})`, icon: BookOpen },
            { id: 'analytics', label: '📈 Thống kê sử dụng', icon: TrendingUp },
            { id: 'settings', label: '⚙️ Cài đặt hệ thống', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Body View */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {/* ================= TAB 1: TỔNG QUAN ================= */}
          {activeTab === 'overview' && metrics && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Thẻ thống kê 6 chỉ số chính */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Tổng thành viên
                  </span>
                  <div className="text-2xl font-black text-slate-800 mt-1">{metrics.totalMembers}</div>
                  <span className="text-[11px] text-blue-600 font-medium">Đã đăng ký</span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Dùng thử (5 lượt)
                  </span>
                  <div className="text-2xl font-black text-amber-600 mt-1">{metrics.trialMembers}</div>
                  <span className="text-[11px] text-amber-600 font-medium">Đang trải nghiệm</span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Thành viên VIP
                  </span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.vipMembers}</div>
                  <span className="text-[11px] text-emerald-600 font-medium">Đang hoạt động</span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Hết hạn / Khóa
                  </span>
                  <div className="text-2xl font-black text-rose-600 mt-1">{metrics.expiredMembers}</div>
                  <span className="text-[11px] text-rose-600 font-medium">Cần gia hạn</span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Lượt dùng hôm nay
                  </span>
                  <div className="text-2xl font-black text-indigo-600 mt-1">{metrics.usagesToday}</div>
                  <span className="text-[11px] text-indigo-600 font-medium">Tạo đề thi</span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Lượt trong tháng
                  </span>
                  <div className="text-2xl font-black text-purple-600 mt-1">{metrics.usagesThisMonth}</div>
                  <span className="text-[11px] text-purple-600 font-medium">Tổng tích lũy: {metrics.totalUsages}</span>
                </div>
              </div>

              {/* Bảng hoạt động gần nhất */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lịch sử sử dụng mới nhất */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Nhật ký sử dụng mới nhất
                    </h3>
                    <span className="text-xs text-slate-400">Thời gian thực</span>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {usageRecords.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8">Chưa có nhật ký hoạt động nào.</p>
                    ) : (
                      usageRecords.slice(0, 8).map(rec => (
                        <div
                          key={rec.id}
                          className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                        >
                          <div>
                            <div className="font-bold text-slate-800">
                              {rec.fullName} <span className="text-slate-400 font-normal">({rec.school})</span>
                            </div>
                            <div className="text-blue-700 font-medium mt-0.5">
                              {rec.action}: <span className="text-slate-600 font-normal">{rec.details}</span>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400 whitespace-nowrap">
                            {new Date(rec.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Thành viên mới đăng ký gần nhất */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Thành viên mới gia nhập
                    </h3>
                    <button
                      onClick={() => setActiveTab('members')}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Xem tất cả
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {users.filter(u => u.role !== 'admin').length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8">Chưa có thành viên nào đăng ký.</p>
                    ) : (
                      users
                        .filter(u => u.role !== 'admin')
                        .slice(0, 8)
                        .map(u => (
                          <div
                            key={u.id}
                            className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                          >
                            <div>
                              <div className="font-bold text-slate-800 flex items-center gap-2">
                                {u.fullName}
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    u.subscription.startsWith('vip')
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {u.subscription.startsWith('vip') ? 'VIP' : `Dùng thử (${u.trialCountRemaining}/5)`}
                                </span>
                              </div>
                              <div className="text-slate-500 text-[11px] mt-0.5">
                                {u.school} • SĐT: {u.phone}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleActivateVip(u.id, 'vip_1y')}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold"
                                title="Kích hoạt VIP 1 năm"
                              >
                                +1 Năm
                              </button>
                              <button
                                onClick={() => handleActivateVip(u.id, 'vip_2y')}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-semibold"
                                title="Kích hoạt VIP 2 năm"
                              >
                                +2 Năm
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: QUẢN LÝ THÀNH VIÊN ================= */}
          {activeTab === 'members' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              {/* Thanh công cụ tìm kiếm và lọc */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên, trường, SĐT, username..."
                    className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-700"
                  >
                    <option value="all">Tất cả thành viên</option>
                    <option value="trial">Tài khoản Dùng thử</option>
                    <option value="vip">Tài khoản VIP</option>
                    <option value="expired">Hết hạn lượt / ngày</option>
                    <option value="locked">Tài khoản bị khóa</option>
                  </select>
                </div>
              </div>

              {/* Bảng danh sách thành viên */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="py-3 px-4">Họ và Tên / Trường</th>
                        <th className="py-3 px-4">Tên đăng nhập & SĐT</th>
                        <th className="py-3 px-4">Môn & Tỉnh</th>
                        <th className="py-3 px-4">Trạng thái gói</th>
                        <th className="py-3 px-4">Hạn sử dụng / Lượt</th>
                        <th className="py-3 px-4 text-center">Thao tác Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                            Không tìm thấy thành viên nào phù hợp với bộ lọc.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{u.fullName}</div>
                              <div className="text-slate-500 text-[11px]">{u.school}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-mono font-semibold text-blue-700">{u.username}</div>
                              <div className="text-slate-500 text-[11px]">{u.phone}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              <div>{u.subject || 'Tiếng Anh'}</div>
                              <div className="text-slate-400 text-[11px]">{u.province || 'Tuyên Quang'}</div>
                            </td>
                            <td className="py-3 px-4">
                              {u.isLocked ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px]">
                                  Đã khóa
                                </span>
                              ) : u.subscription === 'vip_1y' ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 w-fit">
                                  <Crown className="w-3 h-3 text-amber-500" /> VIP 1 Năm
                                </span>
                              ) : u.subscription === 'vip_2y' ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] flex items-center gap-1 w-fit">
                                  <Crown className="w-3 h-3 text-amber-500" /> VIP 2 Năm
                                </span>
                              ) : u.subscription === 'expired' ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold text-[11px] border border-rose-200">
                                  Hết hạn
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px]">
                                  Dùng thử ({u.trialCountRemaining}/5)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-[11px] text-slate-600">
                              {u.subscription.startsWith('vip') && u.vipExpiresAt ? (
                                <div>
                                  <span className="font-semibold text-slate-800">
                                    {new Date(u.vipExpiresAt).toLocaleDateString('vi-VN')}
                                  </span>
                                  <span className="text-slate-400 block">
                                    (Kích hoạt: {new Date(u.vipActivatedAt || '').toLocaleDateString('vi-VN')})
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  Còn <strong>{u.trialCountRemaining}</strong> / 5 lượt
                                  <span className="text-slate-400 block">Đã dùng: {u.trialCountUsed} lần</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Kích hoạt VIP 1 năm */}
                                <button
                                  onClick={() => handleActivateVip(u.id, 'vip_1y')}
                                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] shadow-sm"
                                  title="Kích hoạt VIP 1 Năm (200k)"
                                >
                                  VIP 1N
                                </button>
                                {/* Kích hoạt VIP 2 năm */}
                                <button
                                  onClick={() => handleActivateVip(u.id, 'vip_2y')}
                                  className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[10px] shadow-sm"
                                  title="Kích hoạt VIP 2 Năm (300k)"
                                >
                                  VIP 2N
                                </button>
                                {/* Khóa / Mở khóa */}
                                <button
                                  onClick={() => handleToggleLock(u.id)}
                                  className={`p-1.5 rounded-lg text-xs font-semibold ${
                                    u.isLocked
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                  }`}
                                  title={u.isLocked ? 'Mở khóa tài khoản' : 'Tạm khóa tài khoản'}
                                >
                                  {u.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                </button>
                                {/* Reset mật khẩu */}
                                <button
                                  onClick={() => {
                                    setSelectedUserForReset(u);
                                    setNewPasswordInput('123456');
                                  }}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                                  title="Đặt lại mật khẩu cho thành viên"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Reset Mật khẩu cho Thành viên */}
              {selectedUserForReset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 space-y-4">
                    <h4 className="font-bold text-slate-800 text-sm">
                      Đặt lại mật khẩu cho: <span className="text-blue-600">{selectedUserForReset.username}</span>
                    </h4>
                    <form onSubmit={handleResetPassword} className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-600 font-semibold block mb-1">
                          Mật khẩu mới:
                        </label>
                        <input
                          type="text"
                          value={newPasswordInput}
                          onChange={e => setNewPasswordInput(e.target.value)}
                          className="w-full px-3 py-2 text-xs border rounded-xl font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUserForReset(null)}
                          className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                        >
                          Xác nhận đổi
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: HỒ SƠ GIÁO ÁN & TÀI LIỆU ================= */}
          {activeTab === 'lessonPlans' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    Lưu trữ hồ sơ giáo án & tài liệu tải lên của thành viên
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quản lý tài liệu thành viên đã tải lên để chỉnh sửa, soạn thảo hoặc tích hợp năng lực số
                  </p>
                </div>
                <div className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                  Tổng số: {lessonPlans.length} tài liệu
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="py-3 px-4">Tên tài liệu / Giáo án</th>
                        <th className="py-3 px-4">Thành viên tải lên</th>
                        <th className="py-3 px-4">Trường / Đơn vị</th>
                        <th className="py-3 px-4">Trạng thái xử lý</th>
                        <th className="py-3 px-4">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lessonPlans.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                            Chưa có hồ sơ giáo án nào được lưu trữ trên hệ thống.
                          </td>
                        </tr>
                      ) : (
                        lessonPlans.map(lp => (
                          <tr key={lp.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                {lp.title || lp.fileName}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                Dung lượng: {(lp.fileSize / 1024).toFixed(1)} KB
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-800">{lp.fullName}</td>
                            <td className="py-3 px-4 text-slate-600">{lp.school}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                                {lp.status === 'integrated' ? 'Đã tích hợp năng lực số' : 'Đã tải lên'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-[11px]">
                              {new Date(lp.uploadedAt).toLocaleString('vi-VN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: THỐNG KÊ SỬ DỤNG ================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phân loại tài khoản */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    Cơ cấu tài khoản hệ thống
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Tài khoản VIP (1N & 2N)</span>
                        <span className="text-emerald-600">{metrics?.vipMembers || 0}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${((metrics?.vipMembers || 0) / Math.max(1, metrics?.totalMembers || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Tài khoản Dùng thử (5 lượt)</span>
                        <span className="text-blue-600">{metrics?.trialMembers || 0}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${((metrics?.trialMembers || 0) / Math.max(1, metrics?.totalMembers || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Tài khoản hết hạn</span>
                        <span className="text-rose-600">{metrics?.expiredMembers || 0}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{
                            width: `${((metrics?.expiredMembers || 0) / Math.max(1, metrics?.totalMembers || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tính năng sử dụng nhiều nhất */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Tính năng được sử dụng nhiều nhất
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="font-medium text-slate-700">Tạo đề thi tự động chuẩn CV 7991</span>
                      <span className="font-bold text-blue-600">65% lượt dùng</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="font-medium text-slate-700">Tải bộ đề chuẩn THCS (Lớp 6, 7, 8, 9)</span>
                      <span className="font-bold text-indigo-600">22% lượt dùng</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="font-medium text-slate-700">Tích hợp năng lực số & Xuất bản đặc tả</span>
                      <span className="font-bold text-emerald-600">13% lượt dùng</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: CÀI ĐẶT HỆ THỐNG ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Form Cấu hình thông tin liên hệ & Gói VIP */}
              <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
                  <Settings className="w-4 h-4 text-blue-600" />
                  Cấu hình hiển thị và mức giá VIP
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Họ tên Admin hiển thị:
                    </label>
                    <input
                      type="text"
                      value={settings.adminName}
                      onChange={e => setSettings({ ...settings, adminName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Số điện thoại / Hotline:
                    </label>
                    <input
                      type="text"
                      value={settings.adminPhone}
                      onChange={e => setSettings({ ...settings, adminPhone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Số lượt dùng thử:
                    </label>
                    <input
                      type="number"
                      value={settings.trialMaxUses}
                      onChange={e => setSettings({ ...settings, trialMaxUses: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Giá Gói VIP 1 Năm (VNĐ):
                    </label>
                    <input
                      type="number"
                      value={settings.vip1YearPrice}
                      onChange={e => setSettings({ ...settings, vip1YearPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Giá Gói VIP 2 Năm (VNĐ):
                    </label>
                    <input
                      type="number"
                      value={settings.vip2YearPrice}
                      onChange={e => setSettings({ ...settings, vip2YearPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Thông tin đơn vị / Bản quyền chân trang:
                  </label>
                  <input
                    type="text"
                    value={settings.schoolInfo}
                    onChange={e => setSettings({ ...settings, schoolInfo: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    Lưu Thay Đổi Cấu Hình
                  </button>
                </div>
              </form>

              {/* Form Đổi mật khẩu Admin an toàn */}
              <form onSubmit={handleChangeAdminPassword} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
                  <Lock className="w-4 h-4 text-rose-600" />
                  Bảo mật: Đổi mật khẩu quản trị Admin
                </h3>

                {adminPassNotice && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      adminPassNotice.success
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {adminPassNotice.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {adminPassNotice.message}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Mật khẩu Admin hiện tại:
                    </label>
                    <input
                      type="password"
                      value={oldAdminPass}
                      onChange={e => setOldAdminPass(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại..."
                      className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Mật khẩu Admin mới:
                    </label>
                    <input
                      type="password"
                      value={newAdminPass}
                      onChange={e => setNewAdminPass(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Xác nhận mật khẩu mới:
                    </label>
                    <input
                      type="password"
                      value={confirmAdminPass}
                      onChange={e => setConfirmAdminPass(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <Key className="w-4 h-4" />
                    Cập Nhật Mật Khẩu Admin
                  </button>
                </div>
              </form>

              {/* Sao lưu & Phục hồi cơ sở dữ liệu */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
                  <Download className="w-4 h-4 text-emerald-600" />
                  Sao lưu & Phục hồi cơ sở dữ liệu (Backup & Restore)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Quý thầy cô có thể xuất toàn bộ danh sách thành viên, lịch sử kích hoạt VIP và nhật ký hệ thống ra file JSON để lưu về máy tính hoặc chuyển đổi giữa các máy.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Tải File Sao Lưu Hệ Thống (Export JSON)
                  </button>

                  <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-2 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    Phục Hồi Dữ Liệu Từ File (Import JSON)
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
