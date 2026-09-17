import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Lock,
  Phone,
  School,
  MapPin,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  Crown,
  HelpCircle,
  PhoneCall,
} from 'lucide-react';
import { loginUser, registerMember } from '../utils/authManager';
import { isDeviceTrialUsed, getOrCreateDeviceId } from '../utils/deviceFingerprint';
import { User } from '../types/authTypes';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'login',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Trạng thái kiểm tra thiết bị đã dùng thử
  const [isTrialUsedOnDevice, setIsTrialUsedOnDevice] = useState<boolean>(false);

  // Form đăng nhập
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Form đăng ký
  const [regFullName, setRegFullName] = useState<string>('');
  const [regSchool, setRegSchool] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regProvince, setRegProvince] = useState<string>('Tuyên Quang');
  const [regSubject, setRegSubject] = useState<string>('Tiếng Anh THPT');
  const [regGradeLevel, setRegGradeLevel] = useState<string>('THPT (Lớp 10, 11, 12)');

  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsTrialUsedOnDevice(isDeviceTrialUsed());
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  // Xử lý điền nhanh mẫu thành viên ví dụ cho người dùng kiểm tra chức năng đăng ký
  const handleFillSampleMember = () => {
    setRegFullName('Nguyễn Thị Lan');
    setRegSchool('Trường THPT Chu Văn An');
    setRegPhone('0988123456');
    setRegUsername('giaovien_lan');
    setRegPassword('Giaovien123@');
    setRegConfirmPassword('Giaovien123@');
    setRegProvince('Hà Nội');
    setRegSubject('Tiếng Anh');
    setRegGradeLevel('THPT (Lớp 10-12)');
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginUser(loginUsername, loginPassword);
      if (res.success && res.user) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onSuccess(res.user!);
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Đã có lỗi xảy ra khi xử lý đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regFullName.trim() || !regSchool.trim() || !regPhone.trim() || !regUsername.trim() || !regPassword.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Mật khẩu cần tối thiểu 6 ký tự để đảm bảo an toàn.');
      return;
    }

    // Kiểm tra số điện thoại cơ bản
    const cleanPhone = regPhone.replace(/\D/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 11) {
      setErrorMsg('Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await registerMember({
        fullName: regFullName,
        school: regSchool,
        phone: regPhone,
        username: regUsername,
        password: regPassword,
        province: regProvince,
        subject: regSubject,
        gradeLevel: regGradeLevel,
      });

      if (res.success && res.user) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onSuccess(res.user!);
          onClose();
        }, 1000);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Đã có lỗi xảy ra khi xử lý đăng ký.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header gradient */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 text-white p-6 pb-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Hệ Thống Thành Viên & Bản Quyền</h2>
              <p className="text-xs text-blue-100">Global Success Test 2026 • Thầy Đinh Văn Thành</p>
            </div>
          </div>

          {/* Tab selector */}
          <div className="flex bg-black/20 p-1 rounded-xl mt-4 backdrop-blur-sm">
            <button
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'login'
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Đăng Nhập
            </button>
            <button
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'register'
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Đăng Ký Dùng Thử (5 Lượt)
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6">
          {/* Thông báo lỗi */}
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Thông báo thành công */}
          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
              <div className="leading-relaxed font-medium">{successMsg}</div>
            </div>
          )}

          {/* ================= TAB ĐĂNG NHẬP ================= */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={e => setLoginUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập hoặc Admin..."
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>



              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserIcon className="w-4 h-4" />
                    Đăng Nhập Vào Hệ Thống
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setTab('register');
                      setErrorMsg(null);
                    }}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Đăng ký ngay nhận 5 lượt dùng thử
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ================= TAB ĐĂNG KÝ ================= */}
          {tab === 'register' && (
            <div>
              {/* Cảnh báo thiết bị nếu đã từng đăng ký dùng thử */}
              {isTrialUsedOnDevice ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs mb-4">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-800 text-sm mb-1">
                        Thiết bị này đã sử dụng lượt dùng thử trước đó!
                      </h4>
                      <p className="leading-relaxed mb-3">
                        Hệ thống quy định mỗi máy tính/thiết bị chỉ được kích hoạt 01 lần dùng thử miễn phí. Quý thầy cô vui lòng đăng nhập tài khoản đã tạo trước đó hoặc liên hệ Admin để nâng cấp gói VIP.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTab('login')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm"
                        >
                          Chuyển sang Đăng Nhập
                        </button>
                        <a
                          href="https://zalo.me/0915213717"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 font-semibold rounded-lg flex items-center gap-1.5"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                          Zalo: 0915.213.717
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mỗi thiết bị được tặng <strong>5 lượt dùng thử đầy đủ tính năng</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillSampleMember}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline decoration-emerald-300 shrink-0"
                  >
                    Điền mẫu
                  </button>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      placeholder="VD: Đinh Văn Thành"
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Trường / Đơn vị <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={regSchool}
                      onChange={e => setRegSchool(e.target.value)}
                      placeholder="VD: THPT Đồng Yên"
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="VD: 0915213717"
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tỉnh / Thành phố
                    </label>
                    <input
                      type="text"
                      value={regProvince}
                      onChange={e => setRegProvince(e.target.value)}
                      placeholder="VD: Tuyên Quang"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Môn giảng dạy
                    </label>
                    <input
                      type="text"
                      value={regSubject}
                      onChange={e => setRegSubject(e.target.value)}
                      placeholder="VD: Tiếng Anh"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cấp học
                    </label>
                    <input
                      type="text"
                      value={regGradeLevel}
                      onChange={e => setRegGradeLevel(e.target.value)}
                      placeholder="VD: THPT Lớp 10-12"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <hr className="my-2 border-slate-100" />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên đăng nhập mong muốn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="VD: Thanhvip"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mật khẩu <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Xác nhận mật khẩu <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Đăng Ký & Nhận 5 Lượt Dùng Thử
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Footer liên hệ bản quyền */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tác giả: Thầy Đinh Văn Thành • Tuyên Quang</span>
            <a
              href="https://zalo.me/0915213717"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
            >
              <Phone className="w-3 h-3" /> 0915.213.717
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
