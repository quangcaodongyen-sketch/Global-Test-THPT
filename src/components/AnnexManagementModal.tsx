import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Plus,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
} from 'lucide-react';
import { AnnexIntegrationItem } from '../types/annexTypes';
import { AnnexManager } from '../utils/annexManager';

interface AnnexManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemSelect?: (item: AnnexIntegrationItem) => void;
}

export const AnnexManagementModal: React.FC<AnnexManagementModalProps> = ({
  isOpen,
  onClose,
  onItemSelect,
}) => {
  const [items, setItems] = useState<AnnexIntegrationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');
  const [selectedGrade, setSelectedGrade] = useState('Tất cả');
  const [selectedItem, setSelectedItem] = useState<AnnexIntegrationItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AnnexIntegrationItem>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    const loaded = AnnexManager.getItems();
    setItems(loaded);
    if (loaded.length > 0 && !selectedItem) {
      setSelectedItem(loaded[0]);
    }
  };

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (selectedSubject !== 'Tất cả' && item.subject !== selectedSubject) return false;
    if (selectedGrade !== 'Tất cả' && item.grade !== selectedGrade) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.lesson_title.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      (item.nls_content && item.nls_content.toLowerCase().includes(q)) ||
      (item.ai_content && item.ai_content.toLowerCase().includes(q))
    );
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let count = 0;
        if (file.name.endsWith('.json')) {
          count = AnnexManager.importFromJson(content);
        } else {
          count = AnnexManager.importFromText(content);
        }
        loadData();
        showMsg(`Đã nạp thành công ${count} mục từ file: ${file.name}`);
      } catch (err: any) {
        showMsg(`Lỗi đọc file: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleExportJson = () => {
    const jsonStr = AnnexManager.exportToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Phu_Luc_III_THCS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMsg('Đã xuất file JSON sao lưu thành công!');
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Thầy/Cô có chắc chắn muốn xóa bài học này khỏi Phụ lục III không?')) {
      AnnexManager.deleteItem(id);
      loadData();
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      showMsg('Đã xóa bài học thành công!');
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Khôi phục lại kho Phụ lục III chuẩn mẫu 64 bài của Thầy Đinh Văn Thành?')) {
      const def = AnnexManager.resetToDefault();
      setItems(def);
      setSelectedItem(def[0] || null);
      showMsg('Đã khôi phục kho Phụ lục III chuẩn mặc định!');
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.lesson_title) {
      showMsg('Vui lòng nhập tên bài học!', 'error');
      return;
    }

    const itemToSave: AnnexIntegrationItem = {
      id: editForm.id || `ITEM_${Date.now()}`,
      subject: editForm.subject || 'Chung',
      grade: editForm.grade || 'THCS',
      lesson_title: editForm.lesson_title,
      nls_content: editForm.nls_content || '',
      ai_content: editForm.ai_content || '',
      stem_content: editForm.stem_content || '',
      anqp_content: editForm.anqp_content || '',
      qcn_content: editForm.qcn_content || '',
      bvmt_content: editForm.bvmt_content || '',
      gdtc_content: editForm.gdtc_content || '',
      gddp_content: editForm.gddp_content || '',
      integrations: {
        ...(editForm.nls_content ? { NLS: editForm.nls_content } : {}),
        ...(editForm.ai_content ? { AI: editForm.ai_content } : {}),
        ...(editForm.stem_content ? { STEM: editForm.stem_content } : {}),
        ...(editForm.anqp_content ? { ANQP: editForm.anqp_content } : {}),
        ...(editForm.qcn_content ? { QCN: editForm.qcn_content } : {}),
        ...(editForm.bvmt_content ? { BVMT: editForm.bvmt_content } : {})
      }
    };

    AnnexManager.addOrUpdateItem(itemToSave);
    loadData();
    setSelectedItem(itemToSave);
    setIsEditing(false);
    showMsg('Đã lưu thông tin bài học vào kho Phụ lục III vĩnh viễn!');
  };

  const startNewItem = () => {
    setEditForm({
      subject: 'Toán',
      grade: '6',
      lesson_title: '',
      nls_content: '* NLS [NLS.1.2 - NLS.3.1]: ',
      ai_content: '* AI [AI.2 - AI.3]: ',
      stem_content: '',
      anqp_content: '',
      qcn_content: '',
      bvmt_content: ''
    });
    setIsEditing(true);
  };

  const startEditItem = (item: AnnexIntegrationItem) => {
    setEditForm({ ...item });
    setIsEditing(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/50 rounded-xl border border-blue-400/30">
              <BookOpen className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>📚 QUẢN LÝ PHỤ LỤC III (KẾ HOẠCH GIÁO DỤC NĂM HỌC)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 font-bold">
                  CV 5512/BGDĐT
                </span>
              </h2>
              <p className="text-xs text-blue-200">
                Kho dữ liệu chuẩn tích hợp Năng lực số, AI, STEM, ANQP... • Tự động lưu trữ vĩnh viễn trên máy tính
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`px-4 py-2 text-xs font-bold flex items-center gap-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center flex-wrap gap-2">
            <label className="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              <span>📥 Tải lên file (.json / .txt)</span>
              <input type="file" accept=".json,.txt" className="hidden" onChange={handleFileUpload} />
            </label>

            <button
              onClick={startNewItem}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm bài mới</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sao lưu JSON</span>
            </button>

            <button
              onClick={handleResetDefault}
              className="px-3 py-2 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-amber-300 dark:border-amber-800"
              title="Khôi phục lại 64 bài chuẩn mặc định"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Khôi phục mẫu</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài học, từ khóa..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl w-44 sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="Tất cả">Môn: Tất cả</option>
              {Object.keys(AnnexManager.search('', '', '').reduce((acc, it) => ({ ...acc, [it.subject]: true }), {})).map(
                (subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                )
              )}
            </select>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="Tất cả">Lớp: Tất cả</option>
              <option value="6">Lớp 6</option>
              <option value="7">Lớp 7</option>
              <option value="8">Lớp 8</option>
              <option value="9">Lớp 9</option>
            </select>
          </div>
        </div>

        {/* Content Body: Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Table: 55% */}
          <div className="w-full lg:w-7/12 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 flex justify-between">
              <span>DANH SÁCH BÀI HỌC ({filteredItems.length} BÀI)</span>
              <span>Bấm vào dòng để xem chi tiết / chọn</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map((item, idx) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setIsEditing(false);
                    }}
                    className={`p-3 cursor-pointer transition flex items-start gap-2 text-xs ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="font-mono text-slate-400 w-6 shrink-0">{idx + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                          {item.subject}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                          Lớp {item.grade}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white mt-1 line-clamp-2">
                        {item.lesson_title}
                      </h4>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.nls_content || item.ai_content || Object.values(item.integrations || {})[0] || 'Chưa có nội dung'}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Không tìm thấy bài học phù hợp với từ khóa hoặc bộ lọc.
                </div>
              )}
            </div>
          </div>

          {/* Right Detail / Edit: 45% */}
          <div className="w-full lg:w-5/12 p-4 overflow-y-auto bg-white dark:bg-slate-900 flex flex-col">
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>{editForm.id ? 'Sửa bài học' : 'Thêm bài học mới'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Hủy
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Môn học</label>
                    <input
                      type="text"
                      value={editForm.subject || ''}
                      onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                      placeholder="Toán, Ngữ văn..."
                      className="w-full mt-1 p-2 text-xs border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Khối lớp</label>
                    <input
                      type="text"
                      value={editForm.grade || ''}
                      onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                      placeholder="6, 7, 8, 9..."
                      className="w-full mt-1 p-2 text-xs border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Tên bài học</label>
                  <input
                    type="text"
                    value={editForm.lesson_title || ''}
                    onChange={(e) => setEditForm({ ...editForm, lesson_title: e.target.value })}
                    placeholder="Bài 1: Khái niệm phương trình..."
                    className="w-full mt-1 p-2 text-xs border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    * Năng lực số (NLS) [Mã chỉ báo TT 02/2025]:
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.nls_content || ''}
                    onChange={(e) => setEditForm({ ...editForm, nls_content: e.target.value })}
                    placeholder="* NLS [NLS.1.2 - NLS.3.1]: Sử dụng phần mềm GeoGebra..."
                    className="w-full mt-1 p-2 text-xs border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                    * Trí tuệ nhân tạo (AI) [Mã QĐ 2422/QĐ-BGDĐT]:
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.ai_content || ''}
                    onChange={(e) => setEditForm({ ...editForm, ai_content: e.target.value })}
                    placeholder="* AI [AI.2 - AI.3]: Sử dụng trợ lý AI đối chiếu bước giải..."
                    className="w-full mt-1 p-2 text-xs border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    * STEM / Chuyên đề khác (ANQP, QCN, BVMT...):
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.stem_content || ''}
                    onChange={(e) => setEditForm({ ...editForm, stem_content: e.target.value })}
                    placeholder="* STEM [STEM.1]: Thiết kế mô hình..."
                    className="w-full mt-1 p-2 text-xs border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu bài học</span>
                  </button>
                </div>
              </form>
            ) : selectedItem ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs">
                        {selectedItem.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs">
                        Khối {selectedItem.grade}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1.5">
                      {selectedItem.lesson_title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditItem(selectedItem)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg text-xs font-bold"
                      title="Chỉnh sửa bài này"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteItem(selectedItem.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg text-xs"
                      title="Xóa bài này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Integration Details */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                    <h5 className="font-bold text-blue-700 dark:text-blue-300 mb-1">
                      💡 TÍCH HỢP NĂNG LỰC SỐ (NLS)
                    </h5>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {selectedItem.nls_content || selectedItem.integrations?.['NLS'] || '(Chưa cấu hình)'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40">
                    <h5 className="font-bold text-purple-700 dark:text-purple-300 mb-1">
                      🤖 TRÍ TUỆ NHÂN TẠO (AI)
                    </h5>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {selectedItem.ai_content || selectedItem.integrations?.['AI'] || '(Chưa cấu hình)'}
                    </p>
                  </div>

                  {selectedItem.stem_content && (
                    <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                      <h5 className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                        🌱 GIÁO DỤC STEM / STEAM
                      </h5>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {selectedItem.stem_content}
                      </p>
                    </div>
                  )}

                  {selectedItem.anqp_content && (
                    <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                      <h5 className="font-bold text-amber-700 dark:text-amber-300 mb-1">
                        🛡️ AN NINH QUỐC PHÒNG (TT 08/2024)
                      </h5>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {selectedItem.anqp_content}
                      </p>
                    </div>
                  )}

                  {selectedItem.qcn_content && (
                    <div className="p-3 rounded-xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/40">
                      <h5 className="font-bold text-pink-700 dark:text-pink-300 mb-1">
                        🕊️ QUYỀN CON NGƯỜI / KỸ NĂNG SỐNG
                      </h5>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {selectedItem.qcn_content}
                      </p>
                    </div>
                  )}
                </div>

                {onItemSelect && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => {
                        onItemSelect(selectedItem);
                        onClose();
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>CHỌN BÀI NÀY ĐỂ TÍCH HỢP VÀO GIÁO ÁN</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs">
                Chọn một bài học từ danh sách bên trái để xem nội dung chi tiết.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
