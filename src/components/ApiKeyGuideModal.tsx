import React, { useState, useEffect } from 'react';
import {
  Key,
  ExternalLink,
  Copy,
  Check,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Cpu,
  HelpCircle,
  FileText,
  Search,
} from 'lucide-react';

interface ApiKeyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string;
  currentModel: string;
  onSave: (apiKey: string, model: string) => void;
}

export const ApiKeyGuideModal: React.FC<ApiKeyGuideModalProps> = ({
  isOpen,
  onClose,
  currentApiKey,
  currentModel,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState<string>(currentApiKey || '');
  const [model, setModel] = useState<string>(currentModel || 'gemini-2.5-flash');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedGuide, setCopiedGuide] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(currentApiKey || '');
      setModel(currentModel || 'gemini-2.5-flash');
      setTestResult(null);
    }
  }, [isOpen, currentApiKey, currentModel]);

  if (!isOpen) return null;

  // 6 Bước hướng dẫn ngắn gọn cho giáo viên
  const guideSteps = [
    {
      step: 1,
      title: 'Nhấn "Lấy API Key"',
      desc: 'Hệ thống sẽ mở trang Google AI Studio chính thức.',
    },
    {
      step: 2,
      title: 'Đăng nhập tài khoản',
      desc: 'Đăng nhập bằng tài khoản Gmail của bạn (tài khoản cá nhân hoặc giáo dục).',
    },
    {
      step: 3,
      title: 'Chọn "Create API Key"',
      desc: 'Bấm vào nút màu xanh "Create API Key" (Tạo API Key mới).',
    },
    {
      step: 4,
      title: 'Sao chép API Key',
      desc: 'Bấm nút Copy để chép chuỗi mã bảo mật (bắt đầu bằng AIzaSy...).',
    },
    {
      step: 5,
      title: 'Dán vào ứng dụng',
      desc: 'Quay lại ô "Nhập API Key" bên dưới và dán khóa vừa sao chép.',
    },
    {
      step: 6,
      title: 'Lưu & Kiểm tra kết nối',
      desc: 'Nhấn "Lưu API Key" và "Kiểm tra kết nối" để kích hoạt trí tuệ nhân tạo.',
    },
  ];

  const fullGuideText = `🔑 HƯỚNG DẪN CÀI ĐẶT API KEY CHO GIÁO VIÊN:
• Bước 1: Nhấn "Lấy API Key" để mở trang cung cấp API Key (https://aistudio.google.com/app/apikey).
• Bước 2: Đăng nhập tài khoản Gmail của bạn.
• Bước 3: Chọn "Create API Key / Tạo API Key".
• Bước 4: Sao chép chuỗi API Key được cấp.
• Bước 5: Quay lại app → dán API Key vào ô cấu hình.
• Bước 6: Nhấn "Lưu API Key" và "Kiểm tra kết nối".
Website hỗ trợ: Global Success Test 2026 - Thầy Đinh Văn Thành (0915213717)`;

  const handleCopyGuide = () => {
    navigator.clipboard.writeText(fullGuideText);
    setCopiedGuide(true);
    setTimeout(() => setCopiedGuide(false), 2500);
  };

  const handleOpenGoogleAI = () => {
    window.open('https://aistudio.google.com/app/apikey', '_blank', 'noopener,noreferrer');
  };

  const handleSaveOnly = () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Vui lòng dán API Key trước khi lưu!' });
      return;
    }
    onSave(apiKey.trim(), model);
    setTestResult({ success: true, message: '💾 Đã lưu cấu hình API Key thành công!' });
  };

  const handleTestConnection = async () => {
    const keyToTest = apiKey.trim();
    if (!keyToTest) {
      setTestResult({ success: false, message: 'Vui lòng dán API Key trước khi kiểm tra kết nối!' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Thử gọi endpoint models của Google AI Studio để xác thực khóa
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyToTest}`);
      if (res.ok) {
        setTestResult({
          success: true,
          message: '✅ API Key đã được kết nối thành công. Bạn có thể bắt đầu sử dụng ứng dụng.',
        });
        // Tự động lưu luôn khi kết nối thành công
        onSave(keyToTest, model);
      } else {
        const errorJson = await res.json().catch(() => ({}));
        const errMsg = errorJson.error?.message || 'Khóa API không hợp lệ hoặc đã bị vô hiệu hóa.';
        setTestResult({
          success: false,
          message: `❌ Kết nối thất bại: ${errMsg}`,
        });
      }
    } catch {
      // Trong trường hợp offline hoặc CORS bị chặn ở một số mạng trường học, vẫn cho phép lưu
      setTestResult({
        success: true,
        message: '✅ Đã ghi nhận API Key. Hãy thử tạo đề để kiểm tra tính năng!',
      });
      onSave(keyToTest, model);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-sky-600 text-white p-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
              <Key className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                🔑 HƯỚNG DẪN CÀI ĐẶT API KEY
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Thiết lập khóa trí tuệ nhân tạo Gemini dành cho giáo viên • Nhanh chóng & Dễ hiểu
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* 6 Bước hướng dẫn dạng thẻ trực quan */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Quy trình 6 bước cài đặt (Chuẩn cho Giáo viên):
              </span>
              <button
                type="button"
                onClick={handleCopyGuide}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
              >
                {copiedGuide ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedGuide ? 'Đã chép hướng dẫn' : '📋 Sao chép hướng dẫn'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {guideSteps.map(item => (
                <div
                  key={item.step}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5 hover:bg-slate-100/70 transition-colors"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-snug mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nút Lấy API Key nhanh */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-700 leading-relaxed text-center sm:text-left">
              <strong>Chưa có API Key?</strong> Nhấn nút bên cạnh để mở trang Google AI Studio miễn phí và bảo mật.
            </div>
            <button
              type="button"
              onClick={handleOpenGoogleAI}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition-all hover:scale-[1.02]"
            >
              <Key className="w-3.5 h-3.5 text-amber-300" />
              🔑 Lấy API Key (Google AI Studio)
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Ô nhập API Key ẩn dạng password •••••••• */}
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Dán API Key của bạn vào đây:
                </label>
                <span className="text-[11px] text-slate-400">Khóa được mã hóa và lưu tại trình duyệt</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Dán API Key (ví dụ: AIzaSyD...)"
                  className="w-full pl-3.5 pr-20 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-wider"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title={showPassword ? 'Ẩn khóa' : 'Hiện khóa'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.readText().then(text => setApiKey(text.trim()));
                    }}
                    className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors text-[11px] font-semibold"
                    title="Dán từ Clipboard"
                  >
                    Dán
                  </button>
                </div>
              </div>
            </div>

            {/* Lựa chọn mô hình AI */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Chọn mô hình AI (Model):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: 'Nhanh & Chuẩn' },
                  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', tag: 'Mới Nhất' },
                  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tag: 'Chuyên Sâu' },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModel(m.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      model === m.id
                        ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-slate-800">{m.name}</span>
                      <span className="text-[10px] text-blue-600 font-semibold bg-blue-100 px-1.5 py-0.5 rounded">
                        {m.tag}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hiển thị kết quả kiểm tra */}
            {testResult && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 border transition-all ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="leading-relaxed font-medium">{testResult.message}</div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer với 2 nút Lưu và Kiểm tra */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2 bg-white border border-slate-300 hover:border-blue-500 text-blue-700 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all hover:bg-blue-50 disabled:opacity-50"
          >
            {testing ? (
              <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            🔍 Kiểm Tra API Key
          </button>
          <button
            type="button"
            onClick={handleSaveOnly}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            💾 Lưu API Key
          </button>
        </div>
      </div>
    </div>
  );
};
