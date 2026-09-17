import React, { useState } from 'react';
import {
  Library,
  Download,
  FileText,
  Search,
  CheckCircle2,
  ShieldCheck,
  FolderOpen,
  Sparkles,
  Layers,
  BookOpen,
  ArrowDownToLine,
  ExternalLink,
} from 'lucide-react';
import { User } from '../types/authTypes';

interface StandardAnnexLibraryViewProps {
  currentUser: User | null;
}

export const StandardAnnexLibraryView: React.FC<StandardAnnexLibraryViewProps> = ({ currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'annex' | 'sample_plan' | 'guideline'>('all');

  const isAdmin = currentUser?.role === 'admin';

  const documents = [
    {
      id: 'DOC_01',
      title: 'Phụ lục III Chuẩn THCS (54 bài mẫu Toán & KHTN)',
      category: 'annex',
      fileType: 'JSON',
      size: '35.8 KB',
      filePath: '/tai_lieu_chuan/phu_luc_3_thcs_chuan.json',
      desc: 'Bộ ngữ liệu Phụ lục III chuẩn Công văn 5512 được trích xuất từ phần mềm chính thức của Thầy Đinh Văn Thành.'
    },
    {
      id: 'DOC_02',
      title: 'Giáo án Mẫu Toán 9 - Bài 1 (Đã tích hợp NLS, AI)',
      category: 'sample_plan',
      fileType: 'DOCX',
      size: '261 KB',
      filePath: '/tai_lieu_chuan/BAI 1. KHAI NI?M PT VA H? HAI PT B?C NH?T HAI ?N (ti?t 1,2) - g?c_TichHop_NLS_AI_THCS.docx',
      desc: 'Giáo án mẫu thẩm định chuẩn thể thức, có bảng điểm, công thức toán OMML và đoạn văn chữ ĐỎ #FF0000.'
    },
    {
      id: 'DOC_03',
      title: 'Giáo án Mẫu Toán 9 - Biến thể Hoạt động 2',
      category: 'sample_plan',
      fileType: 'DOCX',
      size: '262 KB',
      filePath: '/tai_lieu_chuan/BAI 1. KHAI NI?M PT VA H? HAI PT B?C NH?T HAI ?N (ti?t 1,2) - g?c_TichHop_NLS_AI_THCS_1.docx',
      desc: 'Mẫu giáo án tích hợp nâng cao mô hình hình học động GeoGebra và trợ lý AI giải phương trình.'
    },
    {
      id: 'DOC_04',
      title: 'Hướng Dẫn Sử Dụng & Quy Chuẩn Khảo Thí (CV 5512)',
      category: 'guideline',
      fileType: 'DOCX',
      size: '38.2 KB',
      filePath: '/tai_lieu_chuan/HUONG_DAN_SU_DUNG.docx',
      desc: 'Tài liệu hướng dẫn chuyên sâu cho giáo viên về thể thức văn bản, mã chỉ báo NLS theo Thông tư 02/2025.'
    }
  ];

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          KHO TÀI LIỆU GỐC NỘI BỘ (CHỈ DÀNH CHO ADMIN)
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Khu vực lưu trữ các bộ tài liệu gốc và hồ sơ giáo án mẫu độc quyền của Thầy Đinh Văn Thành. Vui lòng đăng nhập tài khoản <strong>Admin</strong> để mở quyền truy cập.
        </p>
      </div>
    );
  }

  const filteredDocs = documents.filter((doc) => {
    if (filterCategory !== 'all' && doc.category !== filterCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return doc.title.toLowerCase().includes(q) || doc.desc.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Title Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-600/40 rounded-2xl border border-purple-400/30 shrink-0">
            <Library className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SUPER ADMIN EXCLUSIVE</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight">
              📚 KHO PHỤ LỤC III & TÀI LIỆU GỐC CHUẨN
            </h1>
            <p className="text-xs text-purple-200 mt-0.5">
              Toàn bộ dữ liệu mẫu gốc chuẩn được Thầy Đinh Văn Thành lưu trữ và quản lý trực tiếp
            </p>
          </div>
        </div>

        <div className="text-xs text-purple-200 bg-purple-950/60 px-4 py-2 rounded-xl border border-purple-500/30 text-center shrink-0">
          <div>Trạng thái quản trị:</div>
          <strong className="text-amber-300 font-extrabold text-sm">Thầy Đinh Văn Thành (Admin)</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center flex-wrap gap-2">
          {[
            { id: 'all', label: 'Tất cả tài liệu' },
            { id: 'annex', label: 'Phụ lục III gốc' },
            { id: 'sample_plan', label: 'Giáo án mẫu tích hợp' },
            { id: 'guideline', label: 'Hướng dẫn & Công văn' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tài liệu gốc..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-mono font-bold text-[10px]">
                  {doc.fileType} • {doc.size}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{doc.id}</span>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                {doc.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {doc.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bản quyền Thầy Thành</span>
              </span>

              <a
                href={doc.filePath}
                download
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>Tải về tệp gốc</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
