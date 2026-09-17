export type UserRole = 'admin' | 'member';

export type SubscriptionType = 'trial' | 'vip_1y' | 'vip_2y' | 'expired';

export interface User {
  id: string;
  username: string;
  passwordHash: string; // SHA-256 hashed password
  fullName: string;
  school: string;
  phone: string;
  email?: string;
  province?: string;
  subject?: string;
  gradeLevel?: string;
  teachingYears?: string | number;
  role: UserRole;
  subscription: SubscriptionType;
  trialCountRemaining: number; // Mặc định 5
  trialCountUsed: number;      // Mặc định 0
  createdAt: string;
  vipActivatedAt?: string;
  vipExpiresAt?: string;
  isLocked: boolean;
  deviceId: string;
  lastLoginAt?: string;
}

export interface UsageRecord {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  school: string;
  timestamp: string;
  action: string;       // e.g., 'Tạo đề kiểm tra', 'Xuất Word', 'Tích hợp năng lực số'
  details: string;      // e.g., 'Đề kiểm tra Unit 1-3 Lớp 7'
  grade?: string | number;
  unit?: string | number;
}

export interface LessonPlanRecord {
  id: string;
  userId: string;
  fullName: string;
  school: string;
  title: string;
  fileName: string;
  fileSize: number;     // in bytes
  uploadedAt: string;
  status: 'uploaded' | 'edited' | 'integrated';
  notes?: string;
  contentSnippet?: string;
}

export interface SystemSettings {
  adminPhone: string;
  adminName: string;
  adminZalo: string;
  schoolInfo: string;
  trialMaxUses: number;
  vip1YearPrice: number;
  vip2YearPrice: number;
  systemNotice: string;
}

export interface AdminMetrics {
  totalMembers: number;
  trialMembers: number;
  vipMembers: number;
  expiredMembers: number;
  totalUsages: number;
  usagesToday: number;
  usagesThisMonth: number;
  totalLessonPlans: number;
}
