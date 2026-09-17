import { User, UsageRecord, LessonPlanRecord, SystemSettings, AdminMetrics, SubscriptionType } from '../types/authTypes';
import { getOrCreateDeviceId, isDeviceTrialUsed, markDeviceTrialUsed } from './deviceFingerprint';

const USERS_STORAGE_KEY = 'GST_USERS_DB_2026';
const USAGE_RECORDS_KEY = 'GST_USAGE_RECORDS_2026';
const LESSON_PLANS_KEY = 'GST_LESSON_PLANS_2026';
const CURRENT_USER_KEY = 'GST_CURRENT_USER_SESSION_2026';
const SETTINGS_STORAGE_KEY = 'GST_SYSTEM_SETTINGS_2026';

const HASH_SALT = '_GST_AUTH_SALT_2026_THANH_DONG_YEN_';

// Hàm băm mật khẩu SHA-256 thuần chuẩn Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + HASH_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Cài đặt hệ thống mặc định theo thông tin của Thầy Đinh Văn Thành
const DEFAULT_SETTINGS: SystemSettings = {
  adminPhone: '0915213717',
  adminName: 'Đinh Văn Thành',
  adminZalo: '0915213717',
  schoolInfo: 'Trường THPT Đồng Yên, tỉnh Tuyên Quang',
  trialMaxUses: 5,
  vip1YearPrice: 200000,
  vip2YearPrice: 300000,
  systemNotice: 'Ứng dụng hỗ trợ giáo viên THPT soạn đề thi & tích hợp năng lực số chuẩn Bộ GD&ĐT 2026.',
};

/**
 * Khởi tạo dữ liệu và tài khoản Admin mặc định nếu chưa có
 */
export async function initAuthDatabase(): Promise<void> {
  const users = getAllUsers();
  const adminExists = users.some(u => u.username.toLowerCase() === 'admin');

  if (!adminExists) {
    const adminHash = await hashPassword('Admin123@');
    const defaultAdmin: User = {
      id: 'admin-root-001',
      username: 'Admin',
      passwordHash: adminHash,
      fullName: 'Thầy Đinh Văn Thành (Admin)',
      school: 'Trường THPT Đồng Yên, Tuyên Quang',
      phone: '0915213717',
      email: 'dinhthanhdongyen@gmail.com',
      province: 'Tuyên Quang',
      subject: 'Tiếng Anh',
      gradeLevel: 'THPT (Lớp 10, 11, 12)',
      teachingYears: 15,
      role: 'admin',
      subscription: 'vip_2y',
      trialCountRemaining: 999999,
      trialCountUsed: 0,
      createdAt: new Date().toISOString(),
      vipActivatedAt: new Date().toISOString(),
      vipExpiresAt: '2099-12-31T23:59:59.000Z', // Vĩnh viễn
      isLocked: false,
      deviceId: 'ROOT_ADMIN_DEVICE',
    };
    users.unshift(defaultAdmin);
    saveUsers(users);
  }

  // Khởi tạo settings nếu chưa có
  if (!localStorage.getItem(SETTINGS_STORAGE_KEY)) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
  }
}

// Lấy danh sách toàn bộ người dùng
export function getAllUsers(): User[] {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Lưu danh sách người dùng
function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Lấy cài đặt hệ thống
export function getSystemSettings(): SystemSettings {
  try {
    const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Cập nhật cài đặt hệ thống
export function updateSystemSettings(settings: Partial<SystemSettings>): void {
  const current = getSystemSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
}

// Lấy người dùng đang đăng nhập
export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) return null;
    const user: User = JSON.parse(data);

    // Đồng bộ lại từ Database để luôn có thông tin mới nhất (ví dụ sau khi Admin kích hoạt VIP)
    const freshUsers = getAllUsers();
    const freshUser = freshUsers.find(u => u.id === user.id);
    if (freshUser) {
      // Kiểm tra thời hạn VIP nếu có
      if (freshUser.role !== 'admin' && (freshUser.subscription === 'vip_1y' || freshUser.subscription === 'vip_2y')) {
        if (freshUser.vipExpiresAt && new Date(freshUser.vipExpiresAt).getTime() < Date.now()) {
          freshUser.subscription = 'expired';
          saveUsers(freshUsers);
        }
      }
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(freshUser));
      return freshUser;
    }
    return user;
  } catch {
    return null;
  }
}

// Lưu phiên đăng nhập
export function setCurrentUser(user: User | null): void {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

/**
 * Đăng ký tài khoản thành viên mới
 */
export async function registerMember(formData: {
  fullName: string;
  school: string;
  phone: string;
  username: string;
  password: string;
  email?: string;
  province?: string;
  subject?: string;
  gradeLevel?: string;
  teachingYears?: string | number;
}): Promise<{ success: boolean; message: string; user?: User }> {
  await initAuthDatabase();
  const users = getAllUsers();
  const currentDeviceId = getOrCreateDeviceId();

  // 1. Kiểm tra username trùng
  const cleanUsername = formData.username.trim();
  if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
    return { success: false, message: `Tên đăng nhập "${cleanUsername}" đã được sử dụng. Vui lòng chọn tên khác.` };
  }

  // 2. Kiểm tra số điện thoại trùng
  const cleanPhone = formData.phone.trim();
  if (users.some(u => u.phone === cleanPhone)) {
    return { success: false, message: `Số điện thoại ${cleanPhone} đã được đăng ký tài khoản trước đó. Vui lòng đăng nhập.` };
  }

  // 3. Kiểm tra thiết bị đã từng dùng thử hay chưa
  if (isDeviceTrialUsed(currentDeviceId)) {
    return {
      success: false,
      message: 'Thiết bị này đã được sử dụng lượt dùng thử trước đó. Vui lòng đăng nhập tài khoản đã đăng ký hoặc liên hệ Admin để được hỗ trợ.',
    };
  }

  // 4. Băm mật khẩu an toàn
  const passwordHash = await hashPassword(formData.password);

  // 5. Cấp tài khoản dùng thử 5 lượt
  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: cleanUsername,
    passwordHash,
    fullName: formData.fullName.trim(),
    school: formData.school.trim(),
    phone: cleanPhone,
    email: formData.email?.trim(),
    province: formData.province?.trim() || 'Tuyên Quang',
    subject: formData.subject?.trim() || 'Tiếng Anh',
    gradeLevel: formData.gradeLevel?.trim() || 'THPT',
    teachingYears: formData.teachingYears || 1,
    role: 'member',
    subscription: 'trial',
    trialCountRemaining: 5,
    trialCountUsed: 0,
    createdAt: new Date().toISOString(),
    isLocked: false,
    deviceId: currentDeviceId,
  };

  users.push(newUser);
  saveUsers(users);

  // Ghi nhận thiết bị đã nhận dùng thử
  markDeviceTrialUsed(currentDeviceId, cleanUsername);

  // Tự động đăng nhập luôn
  setCurrentUser(newUser);

  return {
    success: true,
    message: 'Đăng ký tài khoản thành công! Bạn được cấp 5 lượt dùng thử đầy đủ tính năng.',
    user: newUser,
  };
}

/**
 * Đăng nhập hệ thống
 */
export async function loginUser(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; message: string; user?: User }> {
  await initAuthDatabase();
  const users = getAllUsers();
  const cleanUsername = usernameInput.trim();

  const user = users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
  if (!user) {
    return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' };
  }

  if (user.isLocked) {
    return { success: false, message: 'Tài khoản của bạn đang bị tạm khóa. Vui lòng liên hệ Admin (0915213717).' };
  }

  const inputHash = await hashPassword(passwordInput);
  if (user.passwordHash !== inputHash) {
    return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' };
  }

  // Kiểm tra thời hạn VIP nếu có
  if (user.role !== 'admin' && (user.subscription === 'vip_1y' || user.subscription === 'vip_2y')) {
    if (user.vipExpiresAt && new Date(user.vipExpiresAt).getTime() < Date.now()) {
      user.subscription = 'expired';
      saveUsers(users);
    }
  }

  user.lastLoginAt = new Date().toISOString();
  saveUsers(users);
  setCurrentUser(user);

  return { success: true, message: 'Đăng nhập thành công!', user };
}

/**
 * Đăng xuất
 */
export function logoutUser(): void {
  setCurrentUser(null);
}

/**
 * Khấu trừ lượt dùng thử và lưu nhật ký hoạt động
 */
export function recordUsage(
  action: string,
  details: string,
  grade?: string | number,
  unit?: string | number
): { success: boolean; remaining: number; isVipOrAdmin: boolean; message?: string } {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, remaining: 0, isVipOrAdmin: false, message: 'Vui lòng đăng nhập để sử dụng tính năng này.' };
  }

  // 1. Nếu là Admin hoặc VIP hợp lệ: không giới hạn lượt
  const isVip = (currentUser.subscription === 'vip_1y' || currentUser.subscription === 'vip_2y') &&
                (!currentUser.vipExpiresAt || new Date(currentUser.vipExpiresAt).getTime() > Date.now());
  const isVipOrAdmin = currentUser.role === 'admin' || isVip;

  if (isVipOrAdmin) {
    // Vẫn ghi nhận nhật ký sử dụng vào hệ thống
    addUsageRecord({
      userId: currentUser.id,
      username: currentUser.username,
      fullName: currentUser.fullName,
      school: currentUser.school,
      action,
      details,
      grade,
      unit,
    });
    return { success: true, remaining: 999999, isVipOrAdmin: true };
  }

  // 2. Tài khoản dùng thử: Kiểm tra số lượt còn lại
  if (currentUser.trialCountRemaining <= 0 || currentUser.subscription === 'expired') {
    return {
      success: false,
      remaining: 0,
      isVipOrAdmin: false,
      message: 'Bạn đã hết lượt dùng thử. Vui lòng kích hoạt gói VIP để tiếp tục sử dụng.',
    };
  }

  // Khấu trừ 1 lượt
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx !== -1) {
    users[idx].trialCountRemaining -= 1;
    users[idx].trialCountUsed += 1;
    if (users[idx].trialCountRemaining <= 0) {
      users[idx].subscription = 'expired';
    }
    saveUsers(users);
    setCurrentUser(users[idx]);

    // Ghi nhận lịch sử
    addUsageRecord({
      userId: currentUser.id,
      username: currentUser.username,
      fullName: currentUser.fullName,
      school: currentUser.school,
      action,
      details,
      grade,
      unit,
    });

    return {
      success: true,
      remaining: users[idx].trialCountRemaining,
      isVipOrAdmin: false,
      message: `Bạn còn ${users[idx].trialCountRemaining}/5 lượt dùng thử.`,
    };
  }

  return { success: false, remaining: 0, isVipOrAdmin: false, message: 'Không tìm thấy thông tin tài khoản.' };
}

// Lưu lịch sử sử dụng
function addUsageRecord(record: Omit<UsageRecord, 'id' | 'timestamp'>): void {
  try {
    const records = getUsageRecords();
    const newRecord: UsageRecord = {
      ...record,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    records.unshift(newRecord);
    // Giới hạn lưu 500 bản ghi gần nhất để tối ưu dung lượng
    if (records.length > 500) records.length = 500;
    localStorage.setItem(USAGE_RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Lỗi khi lưu lịch sử sử dụng:', e);
  }
}

export function getUsageRecords(): UsageRecord[] {
  try {
    const data = localStorage.getItem(USAGE_RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Lưu trữ hồ sơ giáo án / tài liệu tải lên
export function addLessonPlanRecord(plan: {
  userId: string;
  fullName: string;
  school: string;
  title: string;
  fileName: string;
  fileSize: number;
  status: 'uploaded' | 'edited' | 'integrated';
  notes?: string;
  contentSnippet?: string;
}): LessonPlanRecord {
  const plans = getLessonPlans();
  const newPlan: LessonPlanRecord = {
    ...plan,
    id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    uploadedAt: new Date().toISOString(),
  };
  plans.unshift(newPlan);
  if (plans.length > 300) plans.length = 300;
  localStorage.setItem(LESSON_PLANS_KEY, JSON.stringify(plans));
  return newPlan;
}

export function getLessonPlans(): LessonPlanRecord[] {
  try {
    const data = localStorage.getItem(LESSON_PLANS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// ==================== CÁC HÀM DÀNH CHO ADMIN ====================

/**
 * Kích hoạt hoặc gia hạn VIP cho thành viên
 */
export function activateUserVip(userId: string, packageType: 'vip_1y' | 'vip_2y'): boolean {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return false;

  const now = new Date();
  let expireDate = new Date();

  // Nếu tài khoản đang còn hạn VIP thì cộng dồn ngày
  if (user.vipExpiresAt && new Date(user.vipExpiresAt).getTime() > now.getTime()) {
    expireDate = new Date(user.vipExpiresAt);
  }

  const months = packageType === 'vip_1y' ? 12 : 24;
  expireDate.setMonth(expireDate.getMonth() + months);

  user.subscription = packageType;
  user.vipActivatedAt = now.toISOString();
  user.vipExpiresAt = expireDate.toISOString();
  user.trialCountRemaining = 999999;

  saveUsers(users);

  // Nếu là tài khoản đang đăng nhập, cập nhật session
  const cur = getCurrentUser();
  if (cur && cur.id === userId) {
    setCurrentUser(user);
  }

  return true;
}

/**
 * Khóa hoặc Mở khóa tài khoản thành viên
 */
export function toggleLockUser(userId: string): boolean {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (!user || user.role === 'admin') return false; // Không khóa root admin

  user.isLocked = !user.isLocked;
  saveUsers(users);
  return true;
}

/**
 * Reset mật khẩu thành viên
 */
export async function resetUserPassword(userId: string, newPass: string): Promise<boolean> {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return false;

  user.passwordHash = await hashPassword(newPass);
  saveUsers(users);
  return true;
}

/**
 * Đổi mật khẩu Admin an toàn
 */
export async function changeAdminPassword(
  oldPass: string,
  newPass: string
): Promise<{ success: boolean; error?: string }> {
  const users = getAllUsers();
  const admin = users.find(u => u.role === 'admin');
  if (!admin) return { success: false, error: 'Không tìm thấy tài khoản Admin.' };

  const oldHash = await hashPassword(oldPass);
  if (admin.passwordHash !== oldHash) {
    return { success: false, error: 'Mật khẩu Admin hiện tại không đúng.' };
  }

  admin.passwordHash = await hashPassword(newPass);
  saveUsers(users);

  const cur = getCurrentUser();
  if (cur && cur.role === 'admin') {
    cur.passwordHash = admin.passwordHash;
    setCurrentUser(cur);
  }

  return { success: true };
}

/**
 * Lấy các chỉ số thống kê tổng quan cho Admin
 */
export function getAdminMetrics(): AdminMetrics {
  const users = getAllUsers();
  const records = getUsageRecords();
  const plans = getLessonPlans();

  const members = users.filter(u => u.role !== 'admin');
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const thisMonthStr = now.toISOString().slice(0, 7);

  let trialMembers = 0;
  let vipMembers = 0;
  let expiredMembers = 0;

  members.forEach(m => {
    if (m.subscription === 'trial') {
      trialMembers++;
    } else if (m.subscription === 'vip_1y' || m.subscription === 'vip_2y') {
      if (m.vipExpiresAt && new Date(m.vipExpiresAt).getTime() < now.getTime()) {
        expiredMembers++;
      } else {
        vipMembers++;
      }
    } else if (m.subscription === 'expired') {
      expiredMembers++;
    }
  });

  const usagesToday = records.filter(r => r.timestamp.startsWith(todayStr)).length;
  const usagesThisMonth = records.filter(r => r.timestamp.startsWith(thisMonthStr)).length;

  return {
    totalMembers: members.length,
    trialMembers,
    vipMembers,
    expiredMembers,
    totalUsages: records.length,
    usagesToday,
    usagesThisMonth,
    totalLessonPlans: plans.length,
  };
}

/**
 * Xuất dữ liệu hệ thống thành chuỗi JSON (Sao lưu cho Thầy Đinh Văn Thành)
 */
export function exportDatabase(): string {
  const exportData = {
    app: 'Global Success THPT Test 2026',
    author: 'Thầy Đinh Văn Thành - Tuyên Quang',
    exportedAt: new Date().toISOString(),
    users: getAllUsers(),
    usageRecords: getUsageRecords(),
    lessonPlans: getLessonPlans(),
    settings: getSystemSettings(),
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Phục hồi dữ liệu từ file JSON sao lưu
 */
export function importDatabase(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.users || !Array.isArray(data.users)) {
      return { success: false, message: 'File dữ liệu không đúng định dạng sao lưu của ứng dụng.' };
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data.users));
    if (data.usageRecords && Array.isArray(data.usageRecords)) {
      localStorage.setItem(USAGE_RECORDS_KEY, JSON.stringify(data.usageRecords));
    }
    if (data.lessonPlans && Array.isArray(data.lessonPlans)) {
      localStorage.setItem(LESSON_PLANS_KEY, JSON.stringify(data.lessonPlans));
    }
    if (data.settings) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data.settings));
    }
    return { success: true, message: `Phục hồi thành công ${data.users.length} tài khoản thành viên!` };
  } catch (err: any) {
    return { success: false, message: `Lỗi đọc file: ${err.message || 'Dữ liệu không hợp lệ'}` };
  }
}
