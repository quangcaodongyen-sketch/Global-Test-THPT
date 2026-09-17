import React, { useState } from 'react';
import {
  Download,
  FileText,
  BookOpen,
  CheckCircle2,
  Search,
  Layers,
  Award,
  Mic,
  Music,
  FileSpreadsheet,
  Key,
  ShieldCheck,
} from 'lucide-react';
import { consumeTrial, getSchoolConfig } from '../utils/licenseManager';
import { downloadCustomizedStandardDocx } from '../utils/exactExamTemplateEngine';

interface StandardExamsLibraryViewProps {
  onExamSuccess: (info: {
    fileName: string;
    examTitle: string;
    downloadUrl?: string;
  }) => void;
  onOpenActivationModal: () => void;
}

interface LibraryItem {
  id: string;
  grade: '10' | '11' | '12';
  termName: string;
  fileName: string;
  relPath: string;
  units: string;
  scoreType: string;
  hasSpeaking: boolean;
  matrixPath?: string;
  specPath?: string;
  answerPath?: string;
  speakingPath?: string;
  audioPath?: string;
}

const LIBRARY_DATA: LibraryItem[] = [
  // LỚP 10
  {
    id: '10_GK1',
    grade: '10',
    termName: 'Giữa Học Kỳ I',
    fileName: 'GK1 - Anh 10.docx',
    relPath: '/bo_de_chuan/Tieng_Anh_10/Giua_Ky_1/GK1 - Anh 10.docx',
    units: 'Unit 1, 2, 3 (Family Life, Humans and the Environment, Music)',
    scoreType: '10.0đ Viết (Listening, Language, Reading, Writing) • 60 phút',
    hasSpeaking: false,
    matrixPath: '/bo_de_chuan/Tieng_Anh_10/Giua_Ky_1/Ma tran - GK1 - Anh 10.docx',
    audioPath: '/bo_de_chuan/Tieng_Anh_10/Giua_Ky_1/Audio Task 1 - GK1 - Anh 10.mp3',
  },
  {
    id: '10_CK1',
    grade: '10',
    termName: 'Cuối Học Kỳ I',
    fileName: 'CK1 - Anh 10.docx',
    relPath: '/bo_de_chuan/Tieng_Anh_10/Cuoi_Ky_1/CK1 - Anh 10.docx',
    units: 'Unit 1 đến 5 (For a Better Community, Inventions)',
    scoreType: '8.0đ Viết + 2.0đ Speaking (Tổng 10.0 điểm) • 60 phút',
    hasSpeaking: true,
    matrixPath: '/bo_de_chuan/Tieng_Anh_10/Cuoi_Ky_1/Ma tran - CK1 - Anh 10.docx',
    answerPath: '/bo_de_chuan/Tieng_Anh_10/Cuoi_Ky_1/Dap an - CK1 - Anh 10.docx',
    speakingPath: '/bo_de_chuan/Tieng_Anh_10/Cuoi_Ky_1/Speaking - CK1 - Anh 10.docx',
    audioPath: '/bo_de_chuan/Tieng_Anh_10/Cuoi_Ky_1/Audio Task 1 - CK1 - Anh 10.wav',
  },
  {
    id: '10_GK2',
    grade: '10',
    termName: 'Giữa Học Kỳ II',
    fileName: 'GK2 - Anh 10.docx',
    relPath: '/bo_de_chuan/Tieng_Anh_10/Giua_Ky_2/GK2 - Anh 10.docx',
    units: 'Unit 6, 7, 8 (Gender Equality, Viet Nam & Int. Organisations, New Ways to Learn)',
    scoreType: '10.0đ Viết (Listening, Language, Reading, Writing) • 60 phút',
    hasSpeaking: false,
    matrixPath: '/bo_de_chuan/Tieng_Anh_10/Giua_Ky_2/Ma tran - GK2 - Anh 10.docx',
    specPath: '/bo_de_chuan/Tieng_Anh_10/Giua_Ky_2/Dac ta - GK2 - Anh 10.docx',
    audioPath: '/bo_de_chuan/Tieng_Anh_10/Giua_Ky_2/Audio Task 1 - GK2 - Anh 10.mp3',
  },
  {
    id: '10_CK2',
    grade: '10',
    termName: 'Cuối Học Kỳ II',
    fileName: 'CK2 - Anh 10.docx',
    relPath: '/bo_de_chuan/Tieng_Anh_10/Cuoi_Ky_2/CK2 - Anh 10.docx',
    units: 'Unit 6 đến 10 (Protecting the Environment, Ecotourism)',
    scoreType: '8.0đ Viết + 2.0đ Speaking (Tổng 10.0 điểm) • 60 phút',
    hasSpeaking: true,
    matrixPath: '/bo_de_chuan/Tieng_Anh_10/Cuoi_Ky_2/Ma tran - CK2 - Anh 10.docx',
    specPath: '/bo_de_chuan/Tieng_Anh_10/Cuoi_Ky_2/Dac ta - CK2 - Anh 10.docx',
    answerPath: '/bo_de_chuan/Tieng_Anh_10/Cuoi_Ky_2/Dap an - CK2 - Anh 10.docx',
    speakingPath: '/bo_de_chuan/Tieng_Anh_10/Cuoi_Ky_2/Speaking - CK2 - Anh 10.docx',
    audioPath: '/bo_de_chuan/Tieng_Anh_10/Cuoi_Ky_2/Audio Task 1 - CK2 - Anh 10.mp3',
  },

  // LỚP 11
  {
    id: '11_GK1',
    grade: '11',
    termName: 'Giữa Học Kỳ I',
    fileName: 'GK1 - Anh 11.docx',
    relPath: '/bo_de_chuan/Tieng_Anh_11/Giua_Ky_1/GK1 - Anh 11.docx',
    units: 'Unit 1, 2, 3 (A Long and Healthy Life, Generation Gap, Cities of the Future)',
    scoreType: '10.0đ Viết (Listening, Language, Reading, Writing) • 60 phút',
    hasSpeaking: false,
    matrixPath: '/bo_de_chuan/Tieng_Anh_11/Giua_Ky_1/Ma tran Dac ta - GK1 - Anh 11.docx',
    answerPath: '/bo_de_chuan/Tieng_Anh_11/Giua_Ky_1/Dap an - GK1 - Anh 11.docx',
    audioPath: '/bo_de_chuan/Tieng_Anh_11/Giua_Ky_1/Audio Task 1 - GK1 - Anh 11.mp3',
  },
  {
    id: '11_CK1',
    grade: '11',
    termName: 'Cuối Học Kỳ I',
    fileName: 'CK1 - Anh 11.docx',
    relPath: '/bo_de_chuan/Tieng_Anh_11/Cuoi_Ky_1/CK1 - Anh 11.docx',
    units: 'Unit 1 đến 5 (ASEAN and Viet Nam, Global Warming)',
    scoreType: '8.0đ Viết + 2.0đ Speaking (Tổng 10.0 điểm) • 60 phút',
    hasSpeaking: true,
    matrixPath: '/bo_de_chuan/Tieng_Anh_11/Cuoi_Ky_1/Ma tran Dac ta - CK1 - Anh 11.docx',
    answerPath: '/bo_de_chuan/Tieng_Anh_11/Cuoi_Ky_1/Dap an - CK1 - Anh 11.docx',
    audioPath: '/bo_de_chuan/Tieng_Anh_11/Cuoi_Ky_1/Audio Task 1 - CK1 - Anh 11.wav',
  },
  {
    id: '11_GK2',
    grade: '11',
    termName: 'Giữa Học Kỳ II',
    fileName: 'GK2 - Anh 11.docx',
    relPath: '/bo_de_chuan/Tieng_Anh_11/Giua_Ky_2/GK2 - Anh 11.docx',
    units: 'Unit 6, 7, 8 (Preserving Our Heritage, Education Options, Becoming Independent)',
    scoreType: '10.0đ Viết (Listening, Language, Reading, Writing) • 60 phút',
    hasSpeaking: false,
    matrixPath: '/bo_de_chuan/Tieng_Anh_11/Giua_Ky_2/Ma tran - GK2 - Anh 11.docx',
    specPath: '/bo_de_chuan/Tieng_Anh_11/Giua_Ky_2/Dac ta - GK2 - Anh 11.docx',
    answerPath: '/bo_de_chuan/Tieng_Anh_11/Giua_Ky_2/Dap an - GK2 - Anh 11.docx',
    audioPath: '/bo_de_chuan/Tieng_Anh_11/Giua_Ky_2/Audio Task 1 - GK2 - Anh 11.mp3',
  },
  {
    id: '11_CK2',
    grade: '11',
    termName: 'Cuối Học Kỳ II',
    fileName: 'CK2 - Anh 11.docx',
    relPath: '/bo_de_chuan/Tieng_Anh_11/Cuoi_Ky_2/CK2 - Anh 11.docx',
    units: 'Unit 6 đến 10 (Social Issues, The Ecosystem)',
    scoreType: '8.0đ Viết + 2.0đ Speaking (Tổng 10.0 điểm) • 60 phút',
    hasSpeaking: true,
    matrixPath: '/bo_de_chuan/Tieng_Anh_11/Cuoi_Ky_2/Ma tran - CK2 - Anh 11.xlsx',
    specPath: '/bo_de_chuan/Tieng_Anh_11/Cuoi_Ky_2/Dac ta - CK2 - Anh 11.docx',
    speakingPath: '/bo_de_chuan/Tieng_Anh_11/Cuoi_Ky_2/Speaking - CK2 - Anh 11.docx',
    audioPath: '/bo_de_chuan/Tieng_Anh_11/Cuoi_Ky_2/Audio - CK2 - Anh 11.m4a',
  },

  // LỚP 12
  {
    id: '12_GK1',
    grade: '12',
    termName: 'Giữa Học Kỳ I',
    fileName: 'GK1 - Anh 12.docx',
    relPath: '/bo_de_chuan/Tieng_Anh_12/Giua_Ky_1/GK1 - Anh 12.docx',
    units: 'Unit 1, 2, 3 (Life Stories We Admire, A Multicultural World, Green Living)',
    scoreType: '10.0đ Viết (Listening, Language, Reading, Writing) • 60 phút',
    hasSpeaking: false,
    matrixPath: '/bo_de_chuan/Tieng_Anh_12/Giua_Ky_1/Ma tran - GK1 - Anh 12.docx',
    answerPath: '/bo_de_chuan/Tieng_Anh_12/Giua_Ky_1/Dap an - GK1 - Anh 12.docx',
    audioPath: '/bo_de_chuan/Tieng_Anh_12/Giua_Ky_1/Audio - GK1 - Anh 12.wav',
  },
  {
    id: '12_CK1',
    grade: '12',
    termName: 'Cuối Học Kỳ I',
    fileName: 'CK1 - Anh 12.docx',
    relPath: '/bo_de_chuan/Tieng_Anh_12/Cuoi_Ky_1/CK1 - Anh 12.docx',
    units: 'Unit 1 đến 5 (Urbanisation, The World of Work)',
    scoreType: '8.0đ Viết + 2.0đ Speaking (Tổng 10.0 điểm) • 60 phút',
    hasSpeaking: true,
    matrixPath: '/bo_de_chuan/Tieng_Anh_12/Cuoi_Ky_1/Ma tran - CK1 - Anh 12.docx',
    specPath: '/bo_de_chuan/Tieng_Anh_12/Cuoi_Ky_1/Dac ta - CK1 - Anh 12.docx',
    answerPath: '/bo_de_chuan/Tieng_Anh_12/Cuoi_Ky_1/Dap an - CK1 - Anh 12.docx',
    speakingPath: '/bo_de_chuan/Tieng_Anh_12/Cuoi_Ky_1/Speaking 1 - CK1 - Anh 12.docx',
    audioPath: '/bo_de_chuan/Tieng_Anh_12/Cuoi_Ky_1/Audio - CK1 - Anh 12.mp3',
  },
  {
    id: '12_GK2',
    grade: '12',
    termName: 'Giữa Học Kỳ II',
    fileName: 'GK2 - Anh 12.docx',
    relPath: '/bo_de_chuan/Tieng_Anh_12/Giua_Ky_2/GK2 - Anh 12.docx',
    units: 'Unit 6, 7, 8 (Artificial Intelligence, Mass Media, Wildlife Conservation)',
    scoreType: '10.0đ Viết (Listening, Language, Reading, Writing) • 60 phút',
    hasSpeaking: false,
    matrixPath: '/bo_de_chuan/Tieng_Anh_12/Giua_Ky_2/Ma tran - GK2 - Anh 12.docx',
    answerPath: '/bo_de_chuan/Tieng_Anh_12/Giua_Ky_2/Dap an - GK2 - Anh 12.docx',
  },
  {
    id: '12_CK2',
    grade: '12',
    termName: 'Cuối Học Kỳ II',
    fileName: 'CK2 - Anh 12.docx',
    relPath: '/bo_de_chuan/Tieng_Anh_12/Cuoi_Ky_2/CK2 - Anh 12.docx',
    units: 'Unit 6 đến 10 (Career Paths, Lifelong Learning - Khảo thí THPT Chuyên)',
    scoreType: '8.0đ Viết + 2.0đ Speaking (Tổng 10.0 điểm) • 60 phút',
    hasSpeaking: true,
    matrixPath: '/bo_de_chuan/Tieng_Anh_12/Cuoi_Ky_2/Ma tran Dac ta - CK2 - Anh 12.xlsx',
    answerPath: '/bo_de_chuan/Tieng_Anh_12/Cuoi_Ky_2/Dap an - CK2 - Anh 12.docx',
    speakingPath: '/bo_de_chuan/Tieng_Anh_12/Cuoi_Ky_2/Speaking 1 - CK2 - Anh 12.docx',
    audioPath: '/bo_de_chuan/Tieng_Anh_12/Cuoi_Ky_2/Audio - CK2 - Anh 12.mp3',
  },
];

export const StandardExamsLibraryView: React.FC<StandardExamsLibraryViewProps> = ({
  onExamSuccess,
  onOpenActivationModal,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredItems = LIBRARY_DATA.filter((item) => {
    const matchesGrade = selectedGrade === 'ALL' || item.grade === selectedGrade;
    const matchesSearch =
      searchTerm === '' ||
      item.termName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.units.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const handleDownloadFile = async (urlPath: string, fileName: string, isExamMain = false, item?: LibraryItem) => {
    const trial = consumeTrial();
    if (!trial.allowed) {
      onOpenActivationModal();
      return;
    }

    try {
      const cfg = getSchoolConfig();
      if (isExamMain) {
        const result = await downloadCustomizedStandardDocx({
          relPath: urlPath,
          defaultFileName: fileName,
          parentAgency: cfg.parentAgency,
          schoolName: cfg.schoolName,
        });

        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);

        onExamSuccess({
          fileName: result.fileName,
          examTitle: `Đề Kiểm Tra Tiếng Anh ${item?.grade || 'THPT'} - ${item?.termName || ''}`,
          fileBlob: result.blob,
        });
        return;
      }

      // Tải trực tiếp các tệp phụ lục: ma trận, đáp án, audio
      const a = document.createElement('a');
      a.href = encodeURI(urlPath);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      onExamSuccess({
        fileName: fileName,
        examTitle: `Hồ sơ Khảo thí Tiếng Anh ${item?.grade || 'THPT'}`,
        downloadUrl: urlPath,
      });
    } catch {
      const a = document.createElement('a');
      a.href = encodeURI(urlPath);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Giới thiệu Thư viện THPT */}
      <div className="p-4 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 text-white rounded-2xl shadow-md border border-blue-500/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/40 border border-blue-400/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">KHO ĐỀ THI GỐC CHUẨN THPT (LỚP 10, 11, 12)</span>
              <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded text-[10px] font-bold">
                GDPT 2018
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Đầy đủ đề thi chính thức, ma trận, bản đặc tả, bảng đáp án, đề thi nói và tệp nghe Audio bài học SGK Global Success THPT.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 uppercase shrink-0">Khối Lớp:</span>
          {['ALL', '10', '11', '12'].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                selectedGrade === g
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {g === 'ALL' ? 'Tất cả khối lớp (10, 11, 12)' : `Lớp ${g}`}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm kỳ kiểm tra, bài học..."
            className="w-full pl-9 pr-4 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Grid Danh Sách Đề THPT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          return (
            <div
              key={item.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 text-[11px] font-black bg-blue-100 text-blue-800 rounded-md">
                    TIẾNG ANH {item.grade} THPT
                  </span>
                  {item.hasSpeaking ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md flex items-center gap-1">
                      <Mic className="w-3 h-3" /> CÓ SPEAKING
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-md">
                      100% VIẾT
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-black text-slate-900 mb-1">
                  {item.termName}
                </h3>

                <div className="text-[11.5px] text-blue-700 font-bold mb-2 break-all flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.fileName}</span>
                </div>

                <p className="text-xs text-slate-600 font-medium line-clamp-2 mb-2">
                  {item.units}
                </p>

                <div className="text-[11px] text-slate-500 font-semibold mb-3">
                  {item.scoreType}
                </div>

                {/* Danh sách các tài liệu kèm theo */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.matrixPath && (
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(item.matrixPath!, `MaTran_${item.grade}_${item.termName}.docx`, false, item)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-emerald-600" /> Ma trận & Đặc tả
                    </button>
                  )}
                  {item.answerPath && (
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(item.answerPath!, `DapAn_${item.grade}_${item.termName}.docx`, false, item)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold flex items-center gap-1"
                    >
                      <Key className="w-3 h-3 text-amber-600" /> Đáp án & HDC
                    </button>
                  )}
                  {item.speakingPath && (
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(item.speakingPath!, `Speaking_${item.grade}_${item.termName}.docx`, false, item)}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-[10px] font-bold flex items-center gap-1"
                    >
                      <Mic className="w-3 h-3 text-amber-600" /> Đề Nói Speaking
                    </button>
                  )}
                  {item.audioPath && (
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(item.audioPath!, `Audio_${item.grade}_${item.termName}.mp3`, false, item)}
                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded text-[10px] font-bold flex items-center gap-1"
                    >
                      <Music className="w-3 h-3 text-blue-600" /> Tệp Nghe Audio
                    </button>
                  )}
                </div>
              </div>

              {/* Nút Tải Đề Thi Chính */}
              <button
                type="button"
                onClick={() => handleDownloadFile(item.relPath, item.fileName, true, item)}
                className="w-full py-2.5 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>TẢI ĐỀ THI WORD (TỰ ĐIỀN TÊN TRƯỜNG)</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
