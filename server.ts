import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI instance
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to execute Gemini API calls with exponential backoff on 429 / RESOURCE_EXHAUSTED rate limits
async function generateContentWithRetry(aiInstance: GoogleGenAI, model: string, requestParams: any, maxRetries = 3, initialDelayMs = 3000) {
  let delay = initialDelayMs;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await aiInstance.models.generateContent({
        model: model,
        ...requestParams
      });
    } catch (err: any) {
      const isQuotaError =
        err?.status === 'RESOURCE_EXHAUSTED' ||
        err?.code === 429 ||
        (err?.message && (err.message.includes('429') || err.message.includes('Quota exceeded') || err.message.includes('RESOURCE_EXHAUSTED')));

      if (isQuotaError && attempt < maxRetries) {
        console.warn(`[Gemini API] Quota/Rate limit reached (429/RESOURCE_EXHAUSTED). Retrying attempt ${attempt}/${maxRetries} after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 1.5;
      } else {
        throw err;
      }
    }
  }
  throw new Error('Đã thử lại nhiều lần nhưng không thể kết nối hệ thống AI do vượt quá giới hạn lượt dùng.');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Route: Generate complete English exam suite using Gemini with fallbacks
app.post('/api/generate-exam', async (req, res) => {
  try {
    const { grade, examType, selectedUnits, adminInfo, customPrompt, uploadedTemplates, model: selectedModel } = req.body;

    if (!grade || !examType || !selectedUnits || selectedUnits.length === 0) {
      return res.status(400).json({
        error: 'Vui lòng chọn khối lớp, loại bài kiểm tra và ít nhất một Unit kiến thức.',
      });
    }

    const apiKey = (req.headers['x-api-key'] as string) || req.body.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp API Key trong phần Cài đặt ở Header để sử dụng ứng dụng.',
      });
    }

    let templateContext = '';
    if (uploadedTemplates && Array.isArray(uploadedTemplates) && uploadedTemplates.length > 0) {
      templateContext = `
=====================================================
QUY TẮC BẮT BUỘC KHI CÓ MẪU ĐỀ TẢI LÊN (STRICT TEMPLATE ADHERENCE):
Người dùng đã tải lên các tệp mẫu dưới đây. Bạn BẮT BUỘC phải phân tích và tuân thủ tuyệt đối cấu trúc của mẫu này:

${uploadedTemplates
  .map(
    (t: any, idx: number) => {
      const raw = t.content || '';
      const truncated = raw.length > 5000 ? raw.slice(0, 5000) + '\n...[Nội dung tệp mẫu quá dài đã được tối ưu hóa]...' : raw;
      return `--- MẪU ${idx + 1}: ${t.name} (Loại: ${t.type}) ---\n${truncated}`;
    }
  )
  .join('\n\n')}

YÊU CẦU BẮT BUỘC KHI TẠO ĐỀ KIỂM TRA TỪ MẪU THPT:
1. ĐỦ CÁC PART / SECTION: Phải có đầy đủ tất cả các Part/Section như mẫu đưa lên (VD: LISTENING, LANGUAGE FOCUS, READING, WRITING hoặc SPEAKING...).
2. ĐỦ SỐ LƯỢNG CÂU HỎI TRONG MỖI PART: Đếm chính xác số câu hỏi ở từng Part trong mẫu và tạo ĐÚNG số lượng câu hỏi đó cho từng Part tương ứng trong đề kiểm tra mới.
3. ĐÁNH SỐ THỰC TẾ THEO MẪU: Đánh số câu hỏi liên tục (Question 1, Question 2...).
4. SỐ LƯỢNG ĐÁP ÁN MỖI CÂU THEO CHUẨN THPT:
   - Các câu hỏi trắc nghiệm khách quan (MCQs) chuẩn THPT có 4 phương án lựa chọn: A, B, C, D.
   - Các câu hỏi Đúng/Sai (True/False) có 2 phương án lựa chọn: A. True, B. False (hoặc T / F).
5. TỰ NHẬN DIỆN VÀ GHI ĐÚNG LOẠI BÀI KIỂM TRA: Tự nhận diện đúng loại bài kiểm tra (Kiểm tra 15 phút, Giữa kỳ 1, Giữa kỳ 2, Cuối kỳ 1, Cuối kỳ 2) từ tiêu đề tệp mẫu để ghi chính xác vào tiêu đề đề kiểm tra.
=====================================================
`;
    }

    const isFinalTerm = examType.includes('Cuối kỳ');
    const isMidTerm = examType.includes('Giữa kỳ');

    let wordCountRange = '120-150';
    if (grade.includes('10')) {
      wordCountRange = '120-150';
    } else if (grade.includes('11') || grade.includes('12')) {
      wordCountRange = '150-180';
    }

    let examStructureRules = '';
    if (isMidTerm) {
      examStructureRules = `
CẤU TRÚC ĐỀ KIỂM TRA GIỮA KỲ THPT (TỔNG ĐIỂM VIẾT: 10.0 ĐIỂM) - THỜI GIAN LÀM BÀI: 60 PHÚT:
- Section 1. LISTENING (2.0 pts):
  + Part 1: Listen and decide whether the statements are True (A) or False (B). (4 questions: 1-4, 0.25 pt each).
  + Part 2: Listen and choose the best answer A, B, C, or D. (4 questions: 5-8, 0.25 pt each).
- Section 2. LANGUAGE FOCUS & PHONETICS (3.0 pts):
  + Part 3: Pronunciation & Word Stress (4 questions: 9-12, 0.25 pt each). Đáp án: A, B, C, D.
  + Part 4: Lexico-Grammar multiple choice (6 questions: 13-18, 0.25 pt each). Đáp án: A, B, C, D.
  + Part 5: Dialogue / Utterance rearrangement (2 questions: 19-20, 0.25 pt each). Đáp án: A, B, C, D.
- Section 3. READING (3.0 pts):
  + Part 6: Cloze test - Read the passage and choose the best answer A, B, C, or D for each numbered blank (5 questions: 21-25, 0.2 pt each - 1.0 pt).
  + Part 7: Reading comprehension - Read the text and choose the best answer A, B, C, or D (7 questions: 26-32, 0.28-0.3 pt each - 2.0 pts).
- Section 4. WRITING (2.0 pts):
  + Part 8: Sentence transformation / combination (4 questions: 33-36, 0.25 pt each - 1.0 pt).
  + Part 9: Paragraph writing (${wordCountRange} words) on a given topic (1.0 pt). TRƯỜNG type BẮT BUỘC LÀ "ESSAY". Ghi yêu cầu rõ ràng, có 4 câu gợi ý gợi mở.
`;
    } else if (isFinalTerm) {
      examStructureRules = `
CẤU TRÚC ĐỀ KIỂM TRA CUỐI KỲ THPT (TỔNG ĐIỂM VIẾT: 8.0 ĐIỂM + BÀI THI NÓI: 2.0 ĐIỂM = 10.0 ĐIỂM) - THỜI GIAN: 60 PHÚT:
- Section 1. LISTENING (1.6 pts):
  + Part 1: True / False (4 questions, 0.2 pt each).
  + Part 2: MCQ 4 options A, B, C, D (4 questions, 0.2 pt each).
- Section 2. LANGUAGE FOCUS & PHONETICS (2.4 pts):
  + Part 3: Pronunciation & Word Stress (4 questions, 0.2 pt each).
  + Part 4: Lexico-Grammar MCQs (6 questions, 0.2 pt each).
  + Part 5: Utterance rearrangement (2 questions, 0.2 pt each).
- Section 3. READING (2.4 pts):
  + Part 6: Cloze test (5 questions, 0.16 pt each - 0.8 pt).
  + Part 7: Reading comprehension (7 questions, 0.23 pt each - 1.6 pts).
- Section 4. WRITING (1.6 pts):
  + Part 8: Sentence rewriting (3 questions, 0.2 pt each - 0.6 pt).
  + Part 9: Paragraph writing (${wordCountRange} words) on a given topic (1.0 pt). TRƯỜNG type BẮT BUỘC LÀ "ESSAY".
- Section 5. SPEAKING TEST (2.0 pts):
  + Cung cấp 3 chủ đề nói (speakingTopics) bám sát các Unit, có câu hỏi phỏng vấn và câu trả lời mẫu cho giáo viên chấm.
`;
    } else {
      examStructureRules = `
CẤU TRÚC ĐỀ KIỂM TRA 15 PHÚT THPT (TỔNG ĐIỂM: 10.0 ĐIỂM):
- Gồm 10 câu trắc nghiệm khách quan 4 lựa chọn (A, B, C, D), mỗi câu 1.0 điểm.
`;
    }

    const systemPrompt = `Bạn là một Chuyên gia Biên soạn Đề kiểm tra và Khảo thí Tiếng Anh THPT (Lớp 10, Lớp 11, Lớp 12) uy tín theo chương trình sách giáo khoa Global Success của Bộ Giáo dục và Đào tạo Việt Nam.
Nhiệm vụ của bạn là sinh BỘ ĐỀ KIỂM TRA CHUẨN ĐẦY ĐỦ gồm:
1. Bảng Ma trận đề kiểm tra (Matrix) phân bổ đúng các mức độ nhận thức: Nhận biết (40%), Thông hiểu (30%), Vận dụng (20%), Vận dụng cao (10%). Tổng điểm của ma trận phải khớp với tổng điểm viết của đề kiểm tra (${isFinalTerm ? '8.0' : '10.0'} điểm).
2. Bảng Bản đặc tả đề kiểm tra (Specifications) chi tiết chuẩn Bộ GDĐT.
3. Đề kiểm tra Mã đề 001 gồm đầy đủ các phần theo cấu trúc chi tiết bên dưới. Tuyệt đối KHÔNG đưa tiêu đề đề kiểm tra (như "ĐỀ KIỂM TRA CUỐI KỲ...") hay thông tin thời gian (như "Thời gian làm bài: 60 phút...") vào bất kỳ trường title hay instructions nào của sections. Sections chỉ chứa các Part nội dung.
4. Đáp án và Hướng dẫn chấm chi tiết kèm biểu điểm cho từng câu. Đặc biệt: đối với phần nghe phải có đầy đủ đáp án chuẩn trong bảng key; đối với phần tự luận viết đoạn văn (Writing paragraph) ở câu viết cuối cùng, bạn BẮT BUỘC phải viết một bài văn/đoạn văn mẫu (Sample Essay) hoàn chỉnh khoảng ${wordCountRange} từ và đặt trong trường 'explanation' của câu hỏi đó để làm đáp án mẫu cho học sinh tham khảo.
5. Luôn sinh ra 3 chủ đề nói (speakingTopics) bám sát các Unit học sinh đã học, mỗi chủ đề gồm: tên chủ đề (topicName), mô tả tình huống bằng tiếng Anh (description), 3 câu hỏi gợi ý bằng tiếng Anh (guideQuestions) và 3 câu trả lời mẫu gợi ý tương ứng (suggestedAnswers).

YÊU CẦU ĐỊNH DẠNG ĐÁP ÁN TRẮC NGHIỆM CHUẨN THPT:
- Các câu hỏi trắc nghiệm khách quan chuẩn THPT có 4 đáp án A, B, C, D.
- Đối với câu hỏi Đúng/Sai (True/False), hai lựa chọn đáp án: A. True, B. False (hoặc viết tắt A. T, B. F).

Yêu cầu cấu trúc và biểu điểm bắt buộc:
${examStructureRules}

Yêu cầu nội dung:
- Khối lớp: ${grade} (Global Success THPT)
- Loại đề: ${examType}
- Thời gian làm bài: ${adminInfo?.durationMinutes || 60} phút
- Phạm vi kiến thức kiểm tra (Units): ${selectedUnits.join(', ')}
- Trường: ${adminInfo?.schoolName || 'TRƯỜNG THPT ĐỒNG YÊN'}
- Giáo viên ra đề: ${adminInfo?.teacherName || 'Thầy giáo Đinh Văn Thành'}
${customPrompt ? `- Yêu cầu bổ sung của giáo viên: ${customPrompt}` : ''}
${templateContext}

Tất cả câu hỏi Tiếng Anh phải chuẩn ngữ pháp, tự nhiên, bám sát các từ vựng và chủ điểm ngữ pháp của các Unit được chọn. Hướng dẫn chấm bằng Tiếng Việt rõ ràng.`;

    // Response Schema Definition
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        matrix: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              skill: { type: Type.STRING },
              subSkill: { type: Type.STRING },
              cognitionLevel: { type: Type.STRING },
              questionType: { type: Type.STRING },
              questionCount: { type: Type.NUMBER },
              points: { type: Type.NUMBER },
            },
            required: ['id', 'skill', 'subSkill', 'cognitionLevel', 'questionType', 'questionCount', 'points'],
          },
        },
        specifications: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              skill: { type: Type.STRING },
              knowledgeUnit: { type: Type.STRING },
              performanceIndicator: { type: Type.STRING },
              recognitionCount: { type: Type.NUMBER },
              comprehensionCount: { type: Type.NUMBER },
              applicationCount: { type: Type.NUMBER },
              highApplicationCount: { type: Type.NUMBER },
              totalQuestions: { type: Type.NUMBER },
              totalPoints: { type: Type.NUMBER },
            },
            required: ['id', 'skill', 'knowledgeUnit', 'performanceIndicator', 'recognitionCount', 'comprehensionCount', 'applicationCount', 'highApplicationCount', 'totalQuestions', 'totalPoints'],
          },
        },
        audioScript: { type: Type.STRING },
        sections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              instructions: { type: Type.STRING },
              readingPassage: { type: Type.STRING },
              audioScript: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    section: { type: Type.STRING },
                    partTitle: { type: Type.STRING },
                    cognitionLevel: { type: Type.STRING },
                    type: { type: Type.STRING },
                    prompt: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          key: { type: Type.STRING },
                          text: { type: Type.STRING },
                        },
                        required: ['key', 'text'],
                      },
                    },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    points: { type: Type.NUMBER },
                  },
                  required: ['id', 'section', 'cognitionLevel', 'type', 'prompt', 'correctAnswer', 'explanation', 'points'],
                },
              },
            },
            required: ['title', 'instructions', 'questions'],
          },
        },
        writingMarkScheme: { type: Type.STRING },
        speakingTopics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              topicName: { type: Type.STRING },
              description: { type: Type.STRING },
              guideQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              suggestedAnswers: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['id', 'topicName', 'description', 'guideQuestions']
          }
        }
      },
      required: ['matrix', 'specifications', 'audioScript', 'sections', 'writingMarkScheme', 'speakingTopics'],
    };

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const preferredModel = selectedModel || 'gemini-3-flash-preview';
    const fallbackModels = [
      'gemini-2.5-flash',
      'gemini-3-flash-preview',
      'gemini-2.5-flash-lite',
      'gemini-2.5-pro'
    ];
    const modelsToTry = [preferredModel, ...fallbackModels.filter(m => m !== preferredModel)];

    let response = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Gemini] Attempting generation with model: ${modelName}`);
        response = await generateContentWithRetry(ai, modelName, {
          contents: systemPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            temperature: 0.2,
          },
        });
        if (response) {
          console.log(`[Gemini] Generation succeeded with model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.error(`[Gemini] Failed with model ${modelName}:`, err?.message || err);
        lastError = err;
      }
    }

    if (!response || !response.text) {
      const isQuotaError =
        lastError?.status === 'RESOURCE_EXHAUSTED' ||
        lastError?.code === 429 ||
        (lastError?.message && (lastError.message.includes('429') || lastError.message.includes('Quota exceeded') || lastError.message.includes('RESOURCE_EXHAUSTED')));

      let errMessage = lastError?.message || 'Không nhận được phản hồi từ hệ thống AI.';
      if (isQuotaError) {
        errMessage = 'API Key của bạn đã hết hạn ngạch (Quota Exceeded) hoặc bị giới hạn lượt dùng trong ngày. Vui lòng lấy một API key của tài khoản Gmail khác tại https://aistudio.google.com/api-keys để thay thế hoặc thử lại sau.';
      }
      return res.status(500).json({ success: false, error: errMessage });
    }

    const generatedData = JSON.parse(response.text);

    // Assemble Code 001 Exam Paper
    let qNum = 1;
    const answerKey = generatedData.sections.flatMap((sec: any) =>
      sec.questions.map((q: any) => ({
        questionNumber: qNum++,
        sectionTitle: sec.title,
        answer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
      }))
    );

    const paperCode001 = {
      code: '001',
      adminInfo: {
        schoolName: adminInfo?.schoolName || 'TRƯỜNG THCS NGUYỄN DU',
        className: adminInfo?.className || `${grade}A1`,
        academicYear: adminInfo?.academicYear || '2025 - 2026',
        teacherName: adminInfo?.teacherName || 'Giáo viên Tiếng Anh',
        durationMinutes: adminInfo?.durationMinutes || 45,
        examDate: adminInfo?.examDate || new Date().toLocaleDateString('vi-VN'),
      },
      grade,
      examType,
      selectedUnits,
      audioScript: generatedData.audioScript,
      sections: generatedData.sections,
      answerKey,
      writingMarkScheme: generatedData.writingMarkScheme,
      speakingTopics: generatedData.speakingTopics,
    };

    // Compute Summary Ratios
    const totalQuestions = answerKey.length;
    const totalPoints = generatedData.matrix.reduce((acc: number, m: any) => acc + (m.points || 0), 0) || 10.0;
    const mcqCount = answerKey.filter((a: any) => a.answer && a.answer.length <= 2).length;
    const essayCount = totalQuestions - mcqCount;

    const fullSuite = {
      matrix: generatedData.matrix,
      specifications: generatedData.specifications,
      papers: [paperCode001],
      summary: {
        totalQuestions,
        totalPoints: Number(totalPoints.toFixed(1)),
        mcqCount,
        essayCount,
        timeMinutes: adminInfo?.durationMinutes || 45,
        recognitionRatio: 40,
        comprehensionRatio: 30,
        applicationRatio: 20,
        highApplicationRatio: 10,
      },
    };

    return res.json({ success: true, data: fullSuite });
  } catch (error: any) {
    console.error('Error generating exam suite:', error);
    let errorMessage = error?.message || 'Lỗi khi tự động sinh bộ đề. Vui lòng thử lại.';
    if (
      error?.status === 'RESOURCE_EXHAUSTED' ||
      error?.code === 429 ||
      (typeof errorMessage === 'string' &&
        (errorMessage.includes('429') ||
          errorMessage.includes('Quota exceeded') ||
          errorMessage.includes('RESOURCE_EXHAUSTED') ||
          errorMessage.includes('limit: 250000')))
    ) {
      errorMessage = 'Hệ thống AI vừa đạt giới hạn tần suất yêu cầu tạm thời (429 Rate Limit). Hệ thống đã thử lại nhưng chưa đủ lượt. Vui lòng đợi 10-15 giây và nhấn lại nút "Tạo bộ đề".';
    }
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
