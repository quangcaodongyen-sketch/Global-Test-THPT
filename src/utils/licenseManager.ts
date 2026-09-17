/**
 * MODULE QUẢN LÝ BẢN QUYỀN & DÙNG THỬ 5 LẦN (LICENSE & TRIAL MANAGER)
 * Tương thích 100% với Tool Tạo Key của Thầy Đinh Văn Thành - THCS Đồng Yên (0915.213.717)
 * Tiêu chuẩn mã hóa: SHA-256
 */

export const SECRET_SALT = 'THANH_DONG_YEN_0915213717_2026_PRO_KEY';
export const MAX_TRIAL_EXAMS = 5;

const STORAGE_KEYS = {
  DEVICE_ID: 'eng_device_id',
  TRIAL_COUNT: 'eng_trial_count',
  LICENSE_INFO: 'eng_license_info',
  PARENT_AGENCY: 'cfg_parent_agency',
  SCHOOL_NAME: 'cfg_school_name',
};

export interface LicenseState {
  deviceId: string;
  isActivated: boolean;
  packageType: 'TRIAL' | 'Y1' | 'Y2' | 'LT' | 'CU';
  packageName: string;
  expDate: string;
  expiryTs: number;
  trialCount: number;
  maxTrial: number;
  remainingTrials: number;
  isLocked: boolean;
}

// Hàm băm SHA-256 chuẩn Web Crypto API
async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Lấy hoặc sinh Mã Định Danh Thiết Bị / Trình Duyệt (Device ID)
 * Định dạng: ENG-XXXX-XXXX-XXXX
 */
export function getOrCreateDeviceId(): string {
  let existing = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (existing && existing.startsWith('ENG-') && existing.length >= 15) {
    return existing;
  }

  // Sinh seed ngẫu nhiên dựa trên trình duyệt + thời gian
  const screenInfo = `${window.screen.width}x${window.screen.height}_${window.navigator.userAgent}`;
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timePart = Date.now().toString(36);
  const seed = `${screenInfo}_${randomPart}_${timePart}`;

  // Mã hóa đơn giản để tạo 12 ký tự hex viết hoa
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0') + Math.abs(Date.now()).toString(16).padStart(8, '0');
  const cleanHex = hex.toUpperCase().replace(/[^A-Z0-9]/g, 'F');
  
  const p1 = cleanHex.slice(0, 4).padEnd(4, '7');
  const p2 = cleanHex.slice(4, 8).padEnd(4, '1');
  const p3 = cleanHex.slice(8, 12).padEnd(4, '7');
  const deviceId = `ENG-${p1}-${p2}-${p3}`;

  localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  return deviceId;
}

/**
 * Xác thực License Key khớp 100% với license_manager.py và Tool_Tao_Key_Ban_Quyen_Thanh.py
 */
export async function verifyLicenseKey(
  deviceId: string,
  inputKey: string
): Promise<{
  isValid: boolean;
  packageType: 'Y1' | 'Y2' | 'LT' | 'CU' | 'INVALID';
  packageName: string;
  expDate: string;
  expiryTs: number;
  message: string;
}> {
  const cleanId = deviceId.trim().toUpperCase();
  const cleanKey = inputKey.trim().toUpperCase();

  if (!cleanId || !cleanKey) {
    return {
      isValid: false,
      packageType: 'INVALID',
      packageName: 'Không hợp lệ',
      expDate: '',
      expiryTs: 0,
      message: 'Vui lòng nhập đầy đủ Mã Thiết Bị và Mã Kích Hoạt.',
    };
  }

  // 1. Kiểm tra định dạng gói mới: ENG-[PREFIX]-[EXP_HEX]-[SIG]
  if (cleanKey.startsWith('ENG-')) {
    const parts = cleanKey.split('-');
    if (parts.length === 4) {
      const prefix = parts[1] as 'Y1' | 'Y2' | 'LT' | 'CU';
      const expHex = parts[2];
      const sig = parts[3];

      const expiryTs = parseInt(expHex, 16);
      if (isNaN(expiryTs)) {
        return {
          isValid: false,
          packageType: 'INVALID',
          packageName: 'Không hợp lệ',
          expDate: '',
          expiryTs: 0,
          message: 'Mã kích hoạt có định dạng thời hạn không hợp lệ.',
        };
      }

      const rawSig = `${cleanId}|${prefix}|${expHex}|${SECRET_SALT}`;
      const fullHash = await sha256Hex(rawSig);
      const expectedSig = fullHash.slice(0, 8);

      if (sig === expectedSig) {
        const nowTs = Math.floor(Date.now() / 1000);
        if (expiryTs < nowTs) {
          const expDate = new Date(expiryTs * 1000).toLocaleDateString('vi-VN');
          return {
            isValid: false,
            packageType: 'INVALID',
            packageName: 'Đã hết hạn',
            expDate,
            expiryTs,
            message: `Gói bản quyền đã hết hạn vào ngày ${expDate}. Vui lòng liên hệ gia hạn.`,
          };
        }

        let pkgName = 'Gói Vĩnh Viễn / Trọn Đời';
        let expDate = 'Vĩnh viễn (Trọn đời)';
        if (prefix === 'Y1') {
          pkgName = 'Gói 1 Năm (200.000đ)';
          expDate = new Date(expiryTs * 1000).toLocaleDateString('vi-VN');
        } else if (prefix === 'Y2') {
          pkgName = 'Gói 2 Năm (300.000đ)';
          expDate = new Date(expiryTs * 1000).toLocaleDateString('vi-VN');
        } else if (prefix === 'CU') {
          pkgName = 'Gói Tùy Chỉnh';
          expDate = new Date(expiryTs * 1000).toLocaleDateString('vi-VN');
        }

        return {
          isValid: true,
          packageType: prefix,
          packageName: pkgName,
          expDate,
          expiryTs,
          message: `Kích hoạt thành công ${pkgName}!`,
        };
      }
    }
  }

  // 2. Kiểm tra định dạng cũ: KEY-XXXX-XXXX-XXXX-XXXX
  const combined = `${cleanId}_${SECRET_SALT}`;
  const h = await sha256Hex(combined);
  const legacyKey = `KEY-${h.slice(2, 6)}-${h.slice(10, 14)}-${h.slice(18, 22)}-${h.slice(26, 30)}`;
  if (cleanKey === legacyKey) {
    return {
      isValid: true,
      packageType: 'LT',
      packageName: 'Gói Vĩnh Viễn / Trọn Đời',
      expDate: 'Vĩnh viễn (Trọn đời)',
      expiryTs: 9999999999,
      message: 'Kích hoạt thành công Gói Vĩnh Viễn (Legacy Key)!',
    };
  }

  return {
    isValid: false,
    packageType: 'INVALID',
    packageName: 'Không hợp lệ',
    expDate: '',
    expiryTs: 0,
    message: 'Mã kích hoạt không chính xác cho thiết bị này. Vui lòng kiểm tra lại!',
  };
}

/**
 * Đọc trạng thái bản quyền hiện tại
 */
export function getLicenseState(): LicenseState {
  const deviceId = getOrCreateDeviceId();
  const trialCount = parseInt(localStorage.getItem(STORAGE_KEYS.TRIAL_COUNT) || '0', 10);
  const licenseRaw = localStorage.getItem(STORAGE_KEYS.LICENSE_INFO);

  if (licenseRaw) {
    try {
      const parsed = JSON.parse(licenseRaw);
      const nowTs = Math.floor(Date.now() / 1000);
      if (parsed.expiryTs && parsed.expiryTs < nowTs) {
        // Hết hạn
        return {
          deviceId,
          isActivated: false,
          packageType: 'TRIAL',
          packageName: 'Bản quyền đã hết hạn',
          expDate: parsed.expDate,
          expiryTs: parsed.expiryTs,
          trialCount,
          maxTrial: MAX_TRIAL_EXAMS,
          remainingTrials: Math.max(0, MAX_TRIAL_EXAMS - trialCount),
          isLocked: false,
        };
      }

      return {
        deviceId,
        isActivated: true,
        packageType: parsed.packageType || 'LT',
        packageName: parsed.packageName || 'Gói Vĩnh Viễn',
        expDate: parsed.expDate || 'Vĩnh viễn',
        expiryTs: parsed.expiryTs || 9999999999,
        trialCount,
        maxTrial: MAX_TRIAL_EXAMS,
        remainingTrials: 999999,
        isLocked: false,
      };
    } catch {
      // JSON parse error
    }
  }

  // Đồng bộ với tài khoản người dùng đăng nhập hiện tại nếu có
  try {
    const curRaw = localStorage.getItem('GST_CURRENT_USER_SESSION_2026');
    if (curRaw) {
      const curUser = JSON.parse(curRaw);
      if (curUser.role === 'admin') {
        return {
          deviceId,
          isActivated: true,
          packageType: 'LT',
          packageName: 'Admin Thầy Thành (Toàn Quyền)',
          expDate: 'Vĩnh viễn',
          expiryTs: 9999999999,
          trialCount: 0,
          maxTrial: MAX_TRIAL_EXAMS,
          remainingTrials: 999999,
          isLocked: false,
        };
      }
      if (curUser.subscription === 'vip_1y' || curUser.subscription === 'vip_2y') {
        const isExp = curUser.vipExpiresAt && new Date(curUser.vipExpiresAt).getTime() < Date.now();
        if (!isExp) {
          return {
            deviceId,
            isActivated: true,
            packageType: curUser.subscription === 'vip_1y' ? 'Y1' : 'Y2',
            packageName: curUser.subscription === 'vip_1y' ? 'Gói VIP 1 Năm' : 'Gói VIP 2 Năm',
            expDate: curUser.vipExpiresAt ? new Date(curUser.vipExpiresAt).toLocaleDateString('vi-VN') : 'Còn hạn',
            expiryTs: curUser.vipExpiresAt ? Math.floor(new Date(curUser.vipExpiresAt).getTime() / 1000) : 9999999999,
            trialCount: 0,
            maxTrial: MAX_TRIAL_EXAMS,
            remainingTrials: 999999,
            isLocked: curUser.isLocked,
          };
        }
      }
      // Người dùng dùng thử
      const remain = typeof curUser.trialCountRemaining === 'number' ? curUser.trialCountRemaining : 5;
      const used = typeof curUser.trialCountUsed === 'number' ? curUser.trialCountUsed : 0;
      return {
        deviceId,
        isActivated: false,
        packageType: 'TRIAL',
        packageName: 'Dùng Thử',
        expDate: '5 Lượt Miễn Phí',
        expiryTs: 0,
        trialCount: used,
        maxTrial: MAX_TRIAL_EXAMS,
        remainingTrials: remain,
        isLocked: curUser.isLocked,
      };
    }
  } catch {
    //
  }

  return {
    deviceId,
    isActivated: false,
    packageType: 'TRIAL',
    packageName: 'Dùng Thử',
    expDate: '5 Lượt Miễn Phí',
    expiryTs: 0,
    trialCount,
    maxTrial: MAX_TRIAL_EXAMS,
    remainingTrials: Math.max(0, MAX_TRIAL_EXAMS - trialCount),
    isLocked: false,
  };
}

/**
 * Trừ 1 lượt dùng thử và lưu đồng bộ
 */
export function consumeTrial(): { allowed: boolean; remaining: number } {
  const state = getLicenseState();
  if (state.isActivated) {
    return { allowed: true, remaining: 999999 };
  }

  if (state.remainingTrials <= 0) {
    return { allowed: false, remaining: 0 };
  }

  const newCount = state.trialCount + 1;
  localStorage.setItem(STORAGE_KEYS.TRIAL_COUNT, newCount.toString());
  const newRemaining = Math.max(0, MAX_TRIAL_EXAMS - newCount);

  // Đồng bộ sang currentUser nếu có
  try {
    const curRaw = localStorage.getItem('GST_CURRENT_USER_SESSION_2026');
    if (curRaw) {
      const curUser = JSON.parse(curRaw);
      curUser.trialCountRemaining = newRemaining;
      curUser.trialCountUsed = newCount;
      if (newRemaining <= 0) {
        curUser.subscription = 'expired';
      }
      localStorage.setItem('GST_CURRENT_USER_SESSION_2026', JSON.stringify(curUser));

      // Cập nhật lại vào USERS_STORAGE_KEY
      const usersRaw = localStorage.getItem('GST_USERS_DB_2026');
      if (usersRaw) {
        const users = JSON.parse(usersRaw);
        const idx = users.findIndex((u: any) => u.id === curUser.id);
        if (idx !== -1) {
          users[idx].trialCountRemaining = newRemaining;
          users[idx].trialCountUsed = newCount;
          if (newRemaining <= 0) users[idx].subscription = 'expired';
          localStorage.setItem('GST_USERS_DB_2026', JSON.stringify(users));
        }
      }
    }
  } catch {
    //
  }

  return { allowed: true, remaining: newRemaining };
}

/**
 * Lưu kích hoạt bản quyền
 */
export function saveActivation(info: {
  packageType: 'Y1' | 'Y2' | 'LT' | 'CU';
  packageName: string;
  expDate: string;
  expiryTs: number;
  key: string;
}): void {
  localStorage.setItem(STORAGE_KEYS.LICENSE_INFO, JSON.stringify(info));
}

export const DEFAULT_SCHOOL_NAME = 'THPT Đồng Yên';
export const DEFAULT_PARENT_AGENCY = 'SỞ GD&ĐT TUYÊN QUANG';

/**
 * Lấy cấu hình trường học (Ưu tiên theo tài khoản người dùng đang đăng nhập)
 */
export function getSchoolConfig(): { parentAgency: string; schoolName: string } {
  let userSchool = '';
  try {
    const userJson = localStorage.getItem('GST_CURRENT_USER_SESSION_2026');
    if (userJson) {
      const u = JSON.parse(userJson);
      if (u && u.school && u.school.trim()) {
        userSchool = u.school.trim();
      }
    }
  } catch {}

  const parent = localStorage.getItem(STORAGE_KEYS.PARENT_AGENCY) || DEFAULT_PARENT_AGENCY;
  const savedSchool = localStorage.getItem(STORAGE_KEYS.SCHOOL_NAME);
  const school = userSchool || savedSchool || DEFAULT_SCHOOL_NAME;

  return { parentAgency: parent, schoolName: school };
}

/**
 * Lưu cấu hình trường học & tự động đồng bộ theo tài khoản người dùng
 */
export function saveSchoolConfig(parentAgency: string, schoolName: string): void {
  const cleanParent = (parentAgency || DEFAULT_PARENT_AGENCY).trim().toUpperCase();
  const cleanSchool = (schoolName || DEFAULT_SCHOOL_NAME).trim();

  localStorage.setItem(STORAGE_KEYS.PARENT_AGENCY, cleanParent);
  localStorage.setItem(STORAGE_KEYS.SCHOOL_NAME, cleanSchool);

  // Tự động đồng bộ vào tài khoản người dùng đang đăng nhập & CSDL người dùng
  try {
    const userJson = localStorage.getItem('GST_CURRENT_USER_SESSION_2026');
    if (userJson) {
      const user = JSON.parse(userJson);
      if (user && user.id) {
        user.school = cleanSchool;
        localStorage.setItem('GST_CURRENT_USER_SESSION_2026', JSON.stringify(user));

        const usersJson = localStorage.getItem('GST_USERS_DB_2026');
        if (usersJson) {
          const users = JSON.parse(usersJson);
          const idx = users.findIndex((u: any) => u.id === user.id);
          if (idx !== -1) {
            users[idx].school = cleanSchool;
            localStorage.setItem('GST_USERS_DB_2026', JSON.stringify(users));
          }
        }
      }
    }
  } catch (e) {
    console.error('Lỗi khi tự động lưu tên trường vào tài khoản người dùng:', e);
  }
}
