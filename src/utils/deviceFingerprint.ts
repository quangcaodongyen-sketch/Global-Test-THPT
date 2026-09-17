/**
 * Module nhận diện thiết bị (Device Fingerprinting)
 * Kết hợp Canvas Fingerprint, Screen params, Storage token và Cookie
 * KHÔNG khóa IP (đảm bảo giáo viên chung mạng trường học không bị khóa nhầm)
 */

const STORAGE_DEVICE_KEY = 'GST_DEVICE_ID_2026';
const STORAGE_TRIAL_REGISTRY = 'GST_DEVICE_TRIAL_REGISTRY';
const COOKIE_DEVICE_KEY = 'gst_did_track';

// Sinh chuỗi băm đơn giản FNV-1a 32-bit (nhanh, nhẹ, thuần client)
function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return ('0000000' + (hash >>> 0).toString(16)).substr(-8);
}

// Lấy canvas fingerprint
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'nocanvas';

    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('GlobalSuccess2026-TeacherApp', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('GlobalSuccess2026-TeacherApp', 4, 17);

    return fnv1a(canvas.toDataURL());
  } catch {
    return 'canvaserr';
  }
}

// Cookie helper
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Lấy hoặc tạo mã Device ID độc nhất của thiết bị
 */
export function getOrCreateDeviceId(): string {
  // 1. Kiểm tra localStorage
  let storedId = localStorage.getItem(STORAGE_DEVICE_KEY);
  if (storedId) {
    // Đảm bảo đồng bộ sang cookie
    setCookie(COOKIE_DEVICE_KEY, storedId);
    return storedId;
  }

  // 2. Kiểm tra Cookie nếu localStorage bị xóa
  const cookieId = getCookie(COOKIE_DEVICE_KEY);
  if (cookieId) {
    localStorage.setItem(STORAGE_DEVICE_KEY, cookieId);
    return cookieId;
  }

  // 3. Tạo mới dựa trên đặc trưng phần cứng & canvas
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const lang = navigator.language || '';
  const cores = navigator.hardwareConcurrency || 2;
  const canvasFp = getCanvasFingerprint();
  const randomSalt = Math.random().toString(36).substring(2, 10);

  const rawFingerprint = `DEV-${screenInfo}-${tz}-${lang}-${cores}-${canvasFp}-${randomSalt}`;
  const generatedId = `DEVICE_${fnv1a(rawFingerprint).toUpperCase()}_${Date.now().toString(36).toUpperCase()}`;

  // Lưu lại cả 2 nơi
  localStorage.setItem(STORAGE_DEVICE_KEY, generatedId);
  setCookie(COOKIE_DEVICE_KEY, generatedId);

  return generatedId;
}

/**
 * Kiểm tra xem thiết bị này đã từng đăng ký dùng thử hay chưa
 */
export function isDeviceTrialUsed(deviceId?: string): boolean {
  const did = deviceId || getOrCreateDeviceId();
  try {
    const registry = JSON.parse(localStorage.getItem(STORAGE_TRIAL_REGISTRY) || '{}');
    return !!registry[did];
  } catch {
    return false;
  }
}

/**
 * Đánh dấu thiết bị đã kích hoạt tài khoản dùng thử
 */
export function markDeviceTrialUsed(deviceId: string, username: string): void {
  try {
    const registry = JSON.parse(localStorage.getItem(STORAGE_TRIAL_REGISTRY) || '{}');
    registry[deviceId] = {
      username,
      registeredAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_TRIAL_REGISTRY, JSON.stringify(registry));
  } catch (e) {
    console.error('Lỗi khi ghi nhận thiết bị dùng thử:', e);
  }
}
