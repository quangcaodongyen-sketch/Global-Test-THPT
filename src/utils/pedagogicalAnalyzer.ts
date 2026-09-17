import { AnnexIntegrationItem, PedagogicalAnalysisResult } from '../types/annexTypes';

export class PedagogicalAnalyzer {
  public static readonly SUBJECTS: Record<string, string[]> = {
    'Toán': ['toán', 'toan', 'toán học', 'số học', 'hình học', 'đại số', 'xác suất', 'thống kê', 'toán 6', 'toán 7', 'toán 8', 'toán 9'],
    'Ngữ văn': ['ngữ văn', 'ngu van', 'văn học', 'văn', 'đọc hiểu', 'tiếng việt', 'thực hành tiếng việt', 'viết', 'nói và nghe', 'ngữ văn 6', 'ngữ văn 7', 'ngữ văn 8', 'ngữ văn 9'],
    'Khoa học tự nhiên': ['khoa học tự nhiên', 'khtn', 'vật lí', 'hóa học', 'sinh học', 'vật lý', 'khtn 6', 'khtn 7', 'khtn 8', 'khtn 9'],
    'Lịch sử và Địa lí': ['lịch sử và địa lí', 'lịch sử', 'địa lí', 'ls&đl', 'lsdl', 'lịch sử - địa lí', 'địa lý', 'sử', 'địa', 'lịch sử 6', 'địa lí 6', 'lịch sử 7', 'địa lí 7', 'lịch sử 8', 'địa lí 8', 'lịch sử 9', 'địa lí 9'],
    'Giáo dục công dân': ['giáo dục công dân', 'gdcd', 'đạo đức', 'pháp luật', 'kinh tế và pháp luật', 'gdcd 6', 'gdcd 7', 'gdcd 8', 'gdcd 9'],
    'Tin học': ['tin học', 'tin hoc', 'cntt', 'tin', 'khoa học máy tính', 'tin học 6', 'tin học 7', 'tin học 8', 'tin học 9'],
    'Công nghệ': ['công nghệ', 'cong nghe', 'công nghệ công nghiệp', 'công nghệ nông nghiệp', 'công nghệ 6', 'công nghệ 7', 'công nghệ 8', 'công nghệ 9'],
    'Tiếng Anh': ['tiếng anh', 'tieng anh', 'english', 'anh văn', 'unit ', 'lesson ', 'phonics', 'vocabulary', 'grammar', 'english 6', 'english 7', 'english 8', 'english 9'],
    'Nghệ thuật': ['nghệ thuật', 'âm nhạc', 'mĩ thuật', 'mỹ thuật', 'nghệ thuật 6', 'nghệ thuật 7', 'nghệ thuật 8', 'nghệ thuật 9'],
    'Giáo dục thể chất': ['giáo dục thể chất', 'gdtc', 'thể dục', 'gdtc 6', 'gdtc 7', 'gdtc 8', 'gdtc 9'],
    'Hoạt động trải nghiệm': ['hoạt động trải nghiệm', 'hđtn', 'hướng nghiệp', 'hđtn, hn', 'hdtn', 'hđtn-hn', 'hđtn 6', 'hđtn 7', 'hđtn 8', 'hđtn 9'],
    'Giáo dục địa phương': ['giáo dục địa phương', 'gdđp', 'gddp', 'lịch sử địa phương', 'địa lí địa phương', 'gdđp 6', 'gdđp 7', 'gdđp 8', 'gdđp 9']
  };

  /**
   * Nhận diện Môn học, Khối lớp (6, 7, 8, 9) và Tên bài học từ văn bản giáo án
   */
  public static detectSubjectAndGrade(textCorpus: string): { subject: string; grade: string; lessonTitle: string } {
    const lowerText = textCorpus.slice(0, 3500).toLowerCase();

    // 1. Nhận diện môn học
    let detectedSubject = 'Chung';
    for (const [subj, keywords] of Object.entries(this.SUBJECTS)) {
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(lowerText)) {
          detectedSubject = subj;
          break;
        }
      }
      if (detectedSubject !== 'Chung') break;
    }

    // 2. Nhận diện khối lớp
    let detectedGrade = 'Chung';
    const gradeMatch = lowerText.match(/(?:lớp|khối|grade)\s*([6-9]|1[0-2]|[1-5])\b/i);
    if (gradeMatch) {
      detectedGrade = gradeMatch[1];
    } else {
      const subjGrade = lowerText.match(
        /(?:toán|ngữ văn|văn|tiếng anh|english|khtn|khoa học tự nhiên|vật lí|hóa học|sinh học|lịch sử|địa lí|gdcd|tin học|công nghệ|hđtn|nghệ thuật|gdtc|gdđp)\s*([6-9]|1[0-2]|[1-5])\b/i
      );
      if (subjGrade) {
        detectedGrade = subjGrade[1];
      }
    }

    // 3. Nhận diện tên bài học
    let lessonTitle = '';
    const lines = textCorpus.split('\n');

    for (const rawLine of lines.slice(0, 35)) {
      const cleanL = rawLine.trim();
      if (!cleanL) continue;
      const cleanLow = cleanL.toLowerCase();

      if (['kế hoạch bài dạy', 'giáo án', 'tuần', 'cộng hòa', 'độc lập', 'trường', 'năm học', 'phòng gd', 'sở gd'].some((k) => cleanLow.includes(k))) {
        continue;
      }
      if (/^(?:chương|học\s+kỳ|phần|chủ\s+đề\s+lớn)\s+[iIvVxX\d]+/i.test(cleanLow)) {
        continue;
      }
      if (/^(?:bài|tiết|unit|lesson|chủ\s+đề)\s*[:.\s]?\s*\d+/i.test(cleanLow)) {
        lessonTitle = cleanL;
        break;
      }
    }

    if (!lessonTitle) {
      for (const rawLine of lines.slice(0, 30)) {
        const cleanL = rawLine.trim();
        if (!cleanL) continue;
        const cleanLow = cleanL.toLowerCase();
        if (['kế hoạch bài dạy', 'giáo án', 'tuần', 'cộng hòa', 'độc lập', 'trường', 'năm học', 'chương', 'học kỳ', 'i.', 'ii.', 'iii.'].some((k) => cleanLow.includes(k))) {
          continue;
        }
        if (cleanL === cleanL.toUpperCase() && cleanL.length > 6 && !cleanL.startsWith('UBND') && !cleanL.startsWith('PHÒNG')) {
          lessonTitle = cleanL;
          break;
        }
      }
    }

    if (!lessonTitle) {
      lessonTitle = 'Bài học tích hợp NLS, AI';
    }

    return { subject: detectedSubject, grade: detectedGrade, lessonTitle };
  }

  /**
   * Tạo nội dung tích hợp chuẩn mực cho Mục I và Mục III
   */
  public static generateIntegration(params: {
    subject: string;
    grade: string;
    lessonTitle: string;
    matchedAnnex?: AnnexIntegrationItem | null;
    mode: 'exact' | 'deep_analysis';
  }): PedagogicalAnalysisResult {
    const { subject, grade, lessonTitle, matchedAnnex, mode } = params;
    const sub = subject.toLowerCase();
    const isEnglish = sub.includes('tiếng anh') || sub.includes('english');

    // === CHẾ ĐỘ 1: TÍCH HỢP NGUYÊN VĂN PHỤ LỤC III ===
    if (mode === 'exact' && matchedAnnex) {
      const integrations = matchedAnnex.integrations || {};
      const objectivesList: string[] = [];

      for (const [key, val] of Object.entries(integrations)) {
        if (val && val.trim()) {
          let line = val.trim();
          if (!line.startsWith('*')) line = `* ${line}`;
          objectivesList.push(line);
        }
      }

      if (objectivesList.length === 0) {
        if (matchedAnnex.nls_content) objectivesList.push(matchedAnnex.nls_content);
        if (matchedAnnex.ai_content) objectivesList.push(matchedAnnex.ai_content);
        if (matchedAnnex.stem_content) objectivesList.push(matchedAnnex.stem_content);
        if (matchedAnnex.anqp_content) objectivesList.push(matchedAnnex.anqp_content);
        if (matchedAnnex.qcn_content) objectivesList.push(matchedAnnex.qcn_content);
        if (matchedAnnex.bvmt_content) objectivesList.push(matchedAnnex.bvmt_content);
      }

      const exactText = objectivesList.join('\n');
      const actAction = matchedAnnex.activity_action || exactText;
      const prodAction = matchedAnnex.product_action || '* Sản phẩm: Kết quả bài làm, lời giải, thao tác kiểm tra đối chiếu hoàn thành của học sinh.';

      return {
        subject,
        grade,
        lesson_title: lessonTitle,
        objectives_list: objectivesList,
        warmup_gv: actAction,
        warmup_hs: '* HS quan sát, lắng nghe và thực hiện theo hướng dẫn của giáo viên.',
        warmup_prod: '* Sản phẩm: Phản hồi, câu trả lời và tương tác ban đầu của học sinh.',
        discovery_gv: actAction,
        discovery_hs: '* HS khai thác học liệu, thảo luận nhóm và ghi nhận kết quả.',
        discovery_prod: prodAction,
        practice_gv: actAction,
        practice_hs: '* HS thực hành trên thiết bị/phiếu học tập, hoàn thành bài tập được giao.',
        practice_prod: prodAction,
        application_gv: actAction,
        application_hs: '* HS vận dụng kiến thức hoàn thành sản phẩm mở rộng.',
        application_prod: prodAction,
        is_english: isEnglish
      };
    }

    // === CHẾ ĐỘ 2: PHÂN TÍCH SƯ PHẠM AI CHI TIẾT KÈM MÃ CHỈ BÁO ===
    const topicKeys: string[] = [];
    const rawIntegrations = matchedAnnex?.integrations || {};

    for (const k of Object.keys(rawIntegrations)) {
      if (!k.startsWith('CUSTOM_') && !topicKeys.includes(k)) topicKeys.push(k);
    }
    if (topicKeys.length === 0) {
      topicKeys.push('NLS', 'AI');
    }

    // --- MÔN TIẾNG ANH (100% TIẾNG ANH CHUẨN QUỐC TẾ - BỎ CHỮ NLS, DÙNG DIGITAL COMPETENCE) ---
    if (isEnglish) {
      const hasNls = topicKeys.includes('NLS');
      const hasAi = topicKeys.includes('AI');
      const engObjectives: string[] = [];

      if (hasNls) {
        const raw = rawIntegrations['NLS'] || matchedAnnex?.nls_content || '';
        let clean = raw.replace(/^[*•-]?\s*(?:NLS|Digital\s+Competence)?[^:]*:\s*/i, '').trim();
        if (!clean) clean = 'Search digital multimedia flashcards and interactive English practice platforms (Wordwall, Quizlet, Liveworksheets).';
        engObjectives.push(`* Digital Competence (2.1.TC1a): ${clean}`);
      }

      if (hasAi) {
        const raw = rawIntegrations['AI'] || matchedAnnex?.ai_content || '';
        let clean = raw.replace(/^[*•-]?\s*AI[^:]*:\s*/i, '').trim();
        if (!clean) clean = 'Practice basic Prompt Engineering and use smart AI pronunciation & listening assistant to analyze speech feedback.';
        engObjectives.push(`* AI: ${clean}`);
      }

      if (engObjectives.length === 0) {
        engObjectives.push(
          '* Digital Competence (2.1.TC1a): Search digital multimedia flashcards and interactive English practice platforms (Wordwall, Quizlet, Liveworksheets).',
          '* AI: Practice basic Prompt Engineering and use smart AI pronunciation & listening assistant.'
        );
      }

      const engTag = hasNls && hasAi ? 'Digital Competence & AI' : hasNls ? 'Digital Competence' : 'AI';

      return {
        subject,
        grade,
        lesson_title: lessonTitle,
        objectives_list: engObjectives,
        warmup_gv: `* ${engTag} (Warm-up): T plays an authentic digital video/song on smart screen; conducts a quick interactive quiz (Wordwall/Kahoot) to activate prior knowledge.`,
        warmup_hs: `* ${engTag} (Warm-up): Ss watch the digital clip attentively, interact on smart board/mobile devices, and answer warm-up questions.`,
        warmup_prod: `* ${engTag} (Expected Product): Active student responses on interactive digital platform (Kahoot/Wordwall), readiness for the new lesson.`,
        discovery_gv: `* ${engTag} (Presentation): T presents digital interactive flashcards with audio; utilizes AI speech modeling tool to demonstrate natural intonation and stress patterns.`,
        discovery_hs: `* ${engTag} (Presentation): Ss listen carefully, observe phonetics and visual cues on screen, repeat new words, and check pronunciation accuracy.`,
        discovery_prod: `* ${engTag} (Expected Product): Correctly pronounced target vocabulary and accurate comprehension of key sentence structures.`,
        practice_gv: `* ${engTag} (Practice): T assigns digital interactive worksheets (Liveworksheets/Quizlet); guides Ss to record speaking samples for AI instant feedback scoring.`,
        practice_hs: `* ${engTag} (Practice): Ss work in pairs/groups, complete digital tasks, receive automated feedback, and self-correct pronunciation errors.`,
        practice_prod: `* ${engTag} (Expected Product): Completed digital worksheets with automated scoring, speech recordings evaluated and corrected.`,
        application_gv: `* ${engTag} (Production): T assigns a collaborative digital communicative task; instructs Ss to record a short vlog/podcast or create digital posters presenting their ideas.`,
        application_hs: `* ${engTag} (Production): Ss create digital media projects, present to class, and evaluate peer performances with rubric criteria.`,
        application_prod: `* ${engTag} (Expected Product): Collaborative digital communicative products (vlogs, podcasts, posters, slides) and peer evaluation rubrics.`,
        code_tag: engTag,
        is_english: true
      };
    }

    // --- CÁC MÔN TIẾNG VIỆT CẤP THCS (TOÁN, VĂN, KHTN, SỬ ĐỊA, TIN HỌC, GDCD...) ---
    const objectivesList: string[] = [];

    if (topicKeys.includes('ANQP')) {
      const raw = rawIntegrations['ANQP'] || matchedAnnex?.anqp_content || '';
      const clean = raw.replace(/^[*•-]?\s*ANQP[^:]*:\s*/i, '').trim() ||
        'Rèn luyện ý thức chấp hành kỷ cương, trật tự, nề nếp và bảo vệ tài sản trường lớp khi sử dụng các thiết bị học tập số.';
      objectivesList.push(`* ANQP [ANQP.1]: ${clean}`);
    }

    if (topicKeys.includes('AI')) {
      const raw = rawIntegrations['AI'] || matchedAnnex?.ai_content || '';
      const clean = raw.replace(/^[*•-]?\s*AI[^:]*:\s*/i, '').trim() ||
        'Ứng dụng trợ lý AI gợi ý tài liệu học tập, đối chiếu bước giải và rèn luyện tư duy phản biện kiểm chứng thông tin.';
      objectivesList.push(`* AI [AI.2 - AI.3]: ${clean}`);
    }

    if (topicKeys.includes('NLS')) {
      const raw = rawIntegrations['NLS'] || matchedAnnex?.nls_content || '';
      const clean = raw.replace(/^[*•-]?\s*NLS[^:]*:\s*/i, '').trim() ||
        'Sử dụng thiết bị số, học liệu trực quan 3D và phần mềm chuyên dụng để tra cứu, xử lý dữ liệu và tạo sản phẩm số.';
      objectivesList.push(`* NLS [NLS.1.2 - NLS.3.1]: ${clean}`);
    }

    if (topicKeys.includes('STEM')) {
      const raw = rawIntegrations['STEM'] || matchedAnnex?.stem_content || '';
      const clean = raw.replace(/^[*•-]?\s*STEM[^:]*:\s*/i, '').trim() ||
        'Vận dụng kiến thức liên môn để thiết kế mô hình/giải pháp kỹ thuật giải quyết vấn đề thực tiễn đời sống.';
      objectivesList.push(`* STEM [STEM.1]: ${clean}`);
    }

    if (topicKeys.includes('QCN') || topicKeys.includes('QCN/KNS')) {
      const raw = rawIntegrations['QCN'] || rawIntegrations['QCN/KNS'] || matchedAnnex?.qcn_content || '';
      const clean = raw.replace(/^[*•-]?\s*(?:QCN|QCN\/KNS)[^:]*:\s*/i, '').trim() ||
        'Tôn trọng sự khác biệt, bình đẳng, lắng nghe và hợp tác tích cực trong môi trường học tập số.';
      objectivesList.push(`* QCN [QCN.1]: ${clean}`);
    }

    if (topicKeys.includes('XBHTLH')) {
      const raw = rawIntegrations['XBHTLH'] || matchedAnnex?.xbhtlh_content || '';
      const clean = raw.replace(/^[*•-]?\s*XBHTLH[^:]*:\s*/i, '').trim() ||
        'Nhận diện và tuyên truyền xóa bỏ các hủ tục lạc hậu, mê tín dị đoan, xây dựng nếp sống văn minh số.';
      objectivesList.push(`* XBHTLH [XBHTLH.1]: ${clean}`);
    }

    if (topicKeys.includes('BVMT')) {
      const raw = rawIntegrations['BVMT'] || matchedAnnex?.bvmt_content || '';
      const clean = raw.replace(/^[*•-]?\s*BVMT[^:]*:\s*/i, '').trim() ||
        'Nâng cao ý thức bảo vệ môi trường, ứng phó biến đổi khí hậu và xử lý rác thải an toàn.';
      objectivesList.push(`* BVMT [BVMT.1]: ${clean}`);
    }

    if (topicKeys.includes('GDTC')) {
      const raw = rawIntegrations['GDTC'] || matchedAnnex?.gdtc_content || '';
      const clean = raw.replace(/^[*•-]?\s*GDTC[^:]*:\s*/i, '').trim() ||
        'Nhận thức về lập kế hoạch chi tiêu hợp lý và tính toán tối ưu chi phí trong học tập và sinh hoạt.';
      objectivesList.push(`* GDTC [GDTC.1]: ${clean}`);
    }

    if (topicKeys.includes('GDĐP')) {
      const raw = rawIntegrations['GDĐP'] || matchedAnnex?.gddp_content || '';
      const clean = raw.replace(/^[*•-]?\s*GDĐP[^:]*:\s*/i, '').trim() ||
        'Tìm hiểu, số hóa và quảng bá các nét đẹp văn hóa, di tích lịch sử và tiềm năng quê hương.';
      objectivesList.push(`* GDĐP [GDĐP.1]: ${clean}`);
    }

    if (objectivesList.length === 0) {
      objectivesList.push(
        '* NLS [NLS.1.2 - NLS.3.1]: Sử dụng thiết bị số, học liệu trực quan 3D và phần mềm chuyên dụng để tra cứu, xử lý dữ liệu và tạo sản phẩm số.',
        '* AI [AI.2 - AI.3]: Ứng dụng trợ lý AI gợi ý tài liệu học tập, đối chiếu bước giải và rèn luyện tư duy phản biện kiểm chứng thông tin.'
      );
    }

    const codeTag = topicKeys.join(' & ') || 'NLS & AI';
    const hasNls = topicKeys.includes('NLS');
    const hasAi = topicKeys.includes('AI');

    // TÙY BIẾN CHI TIẾT THEO TỪNG MÔN HỌC THCS
    let w_gv = `* ${codeTag} [NLS.1.1, AI.1] (Khởi động): GV trình chiếu video ngắn/học liệu số tương tác trên màn hình tivi; tổ chức trò chơi gợi mở (Quizizz/Wordwall) để tạo hứng thú và kích hoạt tư duy người học.`;
    let w_hs = `* ${codeTag} [NLS.1.1] (Khởi động): HS quan sát trực quan học liệu số, tích cực tham gia tương tác trả lời câu hỏi và kết nối nhanh vào vấn đề bài học mới.`;
    let w_prod = `* ${codeTag} [NLS.1.1] (Sản phẩm/Kết quả): Câu trả lời tương tác trên hệ thống số/bảng tương tác, tâm thế hào hứng tiếp nhận nhiệm vụ bài học mới.`;

    let d_gv = `* ${codeTag} [NLS.1.2, AI.2] (Khám phá): GV khai thác mô hình mô phỏng số 3D/học liệu số trực quan; hướng dẫn HS ứng dụng công cụ học tập tra cứu, phân tích dữ liệu và hình thành kiến thức trọng tâm.`;
    let d_hs = `* ${codeTag} [NLS.1.2, AI.3] (Khám phá): HS theo dõi học liệu số, thảo luận nhóm khai thác thông tin từ thiết bị công nghệ và rút ra nhận xét, quy luật bài học.`;
    let d_prod = `* ${codeTag} [NLS.1.2] (Sản phẩm/Kết quả): Bảng ghi chép số liệu, sơ đồ tư duy số hoặc kết quả tương tác mô phỏng 3D rút ra quy tắc/định luật bài học.`;

    let p_gv = `* ${codeTag} [NLS.3.1, AI.2] (Luyện tập): GV hướng dẫn HS sử dụng thiết bị số/phần mềm chuyên dụng để làm bài tập rèn luyện; đối chiếu kết quả và phân tích lỗi sai.`;
    let p_hs = `* ${codeTag} [NLS.3.1, AI.3] (Luyện tập): HS thao tác thực hành trên phiếu bài tập số/thiết bị tương tác; tự đánh giá kết quả qua phản hồi tức thì và hoàn thiện bài làm.`;
    let p_prod = `* ${codeTag} [NLS.3.1] (Sản phẩm/Kết quả): Phiếu bài tập số hoàn thành, bài làm được kiểm tra/đối chiếu kết quả chính xác, tự sửa các lỗi sai.`;

    let a_gv = `* ${codeTag} [NLS.5.2, STEM.1] (Vận dụng): GV giao nhiệm vụ tình huống thực tiễn gắn với kiến thức bài học; định hướng HS sáng tạo sản phẩm hoặc liên hệ giải quyết các vấn đề trong đời sống.`;
    let a_hs = `* ${codeTag} [NLS.5.2, STEM.1] (Vận dụng): HS làm việc cá nhân/nhóm, vận dụng kiến thức bài học để đề xuất giải pháp, chia sẻ sản phẩm học tập trước lớp.`;
    let a_prod = `* ${codeTag} [NLS.5.2, STEM.1] (Sản phẩm/Kết quả): Sản phẩm số (poster, video, bài trình bày đa phương tiện, dự án STEM số) hoặc giải pháp giải quyết vấn đề thực tế.`;

    if (sub.includes('toán')) {
      w_gv = `* ${codeTag} [NLS.1.1, AI.1] (Khởi động): GV mở clip ứng dụng toán học số sinh động; tổ chức trò chơi đố vui tương tác nhanh trên màn hình cảm ứng để kích hoạt tư duy logic và liên hệ bài học.`;
      w_hs = `* ${codeTag} [NLS.1.1] (Khởi động): HS hào hứng theo dõi tình huống số, thao tác lựa chọn đáp án tương tác trên màn hình và kết nối vào chủ đề toán học.`;
      w_prod = `* ${codeTag} [NLS.1.1] (Sản phẩm/Kết quả): Đáp án câu hỏi trắc nghiệm số trên màn hình tương tác, nhận thức được vấn đề toán học cần tìm hiểu.`;
      d_gv = `* ${codeTag} [NLS.1.2, AI.2] (Khám phá): GV sử dụng phần mềm hình học động GeoGebra/bảng tính số; hướng dẫn HS quan sát trực quan sự biến thiên đồ thị/hình khối và phân tích mô hình bài toán.`;
      d_hs = `* ${codeTag} [NLS.1.2, AI.3] (Khám phá): HS quan sát mô phỏng số, ghi nhận quy luật toán học, thảo luận nhóm xây dựng công thức/định lý trọng tâm.`;
      d_prod = `* ${codeTag} [NLS.1.2] (Sản phẩm/Kết quả): Bảng ghi chép quy luật toán học, kết quả thao tác trên mô hình GeoGebra/bảng tính và công thức/định lý trọng tâm.`;
      p_gv = `* ${codeTag} [NLS.3.1, AI.2] (Luyện tập): GV hướng dẫn HS sử dụng máy tính cầm tay/công cụ tính toán số${hasAi ? ' và trợ lý AI' : ''} đối chiếu bước giải; rèn luyện kỹ năng phân tích sai lầm thường gặp.`;
      p_hs = `* ${codeTag} [NLS.3.1, AI.3] (Luyện tập): HS thực hành giải bài tập trên phiếu số, đối chiếu kết quả với hệ thống phản hồi tự động và rèn luyện kỹ năng tự sửa sai.`;
      p_prod = `* ${codeTag} [NLS.3.1] (Sản phẩm/Kết quả): Lời giải bài tập trên phiếu số, bài làm được kiểm tra đối chiếu qua máy tính/AI và các bước sửa sai chính xác.`;
      a_gv = `* ${codeTag} [NLS.5.2, STEM.1] (Vận dụng): GV giao bài toán mô hình hóa thực tế (tính toán chi phí, tối ưu diện tích, dự đoán xu thế); hướng dẫn HS dùng bảng tính số để giải quyết.`;
      a_hs = `* ${codeTag} [NLS.5.2, STEM.1] (Vận dụng): HS làm việc nhóm, ứng dụng công nghệ số xử lý số liệu thực tiễn và trình bày báo cáo toán học.`;
      a_prod = `* ${codeTag} [NLS.5.2, STEM.1] (Sản phẩm/Kết quả): Báo cáo giải pháp bài toán thực tiễn (tính toán chi phí, tối ưu diện tích...) được xử lý trên bảng tính số.`;
    } else if (sub.includes('văn')) {
      w_gv = `* ${codeTag} [NLS.1.1, AI.1] (Khởi động): GV trình chiếu video phóng sự/tranh ảnh nghệ thuật số hóa gợi mở bối cảnh văn học; dẫn dắt cảm xúc vào bài học.`;
      w_hs = `* ${codeTag} [NLS.1.1] (Khởi động): HS quan sát hình ảnh số, lắng nghe âm thanh và chia sẻ cảm xúc, ấn tượng ban đầu trước tập thể lớp.`;
      w_prod = `* ${codeTag} [NLS.1.1] (Sản phẩm/Kết quả): Ý kiến cảm nhận ban đầu của HS về bối cảnh văn học qua hình ảnh/video số hóa.`;
      d_gv = `* ${codeTag} [NLS.1.2, AI.2] (Khám phá): GV trình chiếu văn bản số hóa, sử dụng sơ đồ tư duy số (Mindmap/Canva) hướng dẫn HS phân tích nhân vật, chi tiết nghệ thuật và thông điệp tư tưởng.`;
      d_hs = `* ${codeTag} [NLS.1.2, AI.3] (Khám phá): HS theo dõi sơ đồ số, thảo luận nhóm tra cứu tư liệu bối cảnh lịch sử/văn hóa và rút ra ý nghĩa bài văn/bài thơ.`;
      d_prod = `* ${codeTag} [NLS.1.2] (Sản phẩm/Kết quả): Sơ đồ tư duy số (Mindmap/Canva) phân tích nhân vật, chi tiết nghệ thuật và thông điệp tư tưởng của tác phẩm.`;
      p_gv = `* ${codeTag} [NLS.3.1, AI.2] (Luyện tập): GV hướng dẫn HS${hasAi ? ' sử dụng công cụ AI kiểm tra chính tả/gợi ý từ vựng;' : ' tra cứu từ điển số/từ ngữ phong phú;'} hướng dẫn viết đoạn văn cảm nhận giàu cảm xúc.`;
      p_hs = `* ${codeTag} [NLS.3.1, AI.3] (Luyện tập): HS viết đoạn văn trên thiết bị số/phiếu học tập, tra cứu từ ngữ hay và tự hoàn thiện tác phẩm của mình.`;
      p_prod = `* ${codeTag} [NLS.3.1] (Sản phẩm/Kết quả): Đoạn văn hoàn chỉnh của học sinh, diễn đạt trong sáng, giàu hình ảnh cảm xúc và đúng chuẩn chính tả.`;
      a_gv = `* ${codeTag} [NLS.5.2, QCN.1] (Vận dụng): GV hướng dẫn HS sáng tạo sản phẩm số (podcast thu âm giọng đọc truyền cảm, thiết kế poster Canva) lan tỏa thông điệp nhân văn của bài học.`;
      a_hs = `* ${codeTag} [NLS.5.2, QCN.1] (Vận dụng): HS thiết kế sản phẩm truyền thông số, chia sẻ trên diễn đàn lớp học và đánh giá chéo giữa các nhóm.`;
      a_prod = `* ${codeTag} [NLS.5.2, QCN.1] (Sản phẩm/Kết quả): Bản thu âm podcast, poster số hoặc video giới thiệu tác phẩm văn học giàu tính sáng tạo.`;
    } else if (sub.includes('khoa học') || sub.includes('khtn') || sub.includes('vật lí') || sub.includes('hóa học') || sub.includes('sinh học')) {
      w_gv = `* ${codeTag} [NLS.1.1, AI.1] (Khởi động): GV trình chiếu video thí nghiệm hiện tượng thực tế giật gân; tổ chức khảo sát nhanh trên Padlet/Mentimeter thu thập dự đoán của học sinh.`;
      w_hs = `* ${codeTag} [NLS.1.1] (Khởi động): HS quan sát video clip, đưa ra các giả thuyết khoa học ban đầu trên thiết bị số.`;
      w_prod = `* ${codeTag} [NLS.1.1] (Sản phẩm/Kết quả): Các câu hỏi, giả thuyết khoa học của học sinh được ghi nhận trực tiếp trên bảng số liệu lớp học.`;
      d_gv = `* ${codeTag} [NLS.1.2, AI.2] (Khám phá): GV mở phòng thí nghiệm ảo tương tác 3D (PhET Interactive Simulations); hướng dẫn HS thay đổi các biến số và quan sát sự biến đổi hiện tượng.`;
      d_hs = `* ${codeTag} [NLS.1.2, AI.3] (Khám phá): HS thao tác trên mô phỏng thí nghiệm số, đo đạc thông số, ghi nhận bảng dữ liệu và thảo luận rút ra bản chất quy luật.`;
      d_prod = `* ${codeTag} [NLS.1.2] (Sản phẩm/Kết quả): Bảng số liệu thực nghiệm đo đạc từ thí nghiệm ảo PhET và kết luận khoa học chính xác.`;
      p_gv = `* ${codeTag} [NLS.3.1, AI.2] (Luyện tập): GV giao bài tập tình huống thực nghiệm; hướng dẫn HS ứng dụng phần mềm/công cụ tính toán kiểm tra kết quả và phân tích nguyên nhân sai số.`;
      p_hs = `* ${codeTag} [NLS.3.1, AI.3] (Luyện tập): HS giải bài toán khoa học, nhập dữ liệu vào biểu mẫu số tự động chấm điểm và chữa bài.`;
      p_prod = `* ${codeTag} [NLS.3.1] (Sản phẩm/Kết quả): Kết quả giải bài tập thực nghiệm chính xác, nắm vững công thức và phương pháp xử lý số liệu.`;
      a_gv = `* ${codeTag} [NLS.5.2, STEM.1, BVMT.1] (Vận dụng): GV hướng dẫn dự án STEM mini (chế tạo thiết bị, giải pháp bảo vệ môi trường); hướng dẫn quay video báo cáo tiến độ.`;
      a_hs = `* ${codeTag} [NLS.5.2, STEM.1, BVMT.1] (Vận dụng): HS thiết kế mô hình thực tế, chụp ảnh/quay video quá trình vận hành và báo cáo sản phẩm.`;
      a_prod = `* ${codeTag} [NLS.5.2, STEM.1, BVMT.1] (Sản phẩm/Kết quả): Mô hình sản phẩm STEM hoặc video báo cáo giải pháp khoa học ứng dụng bảo vệ môi trường.`;
    } else if (sub.includes('lịch sử') || sub.includes('địa lí') || sub.includes('lsdl')) {
      w_gv = `* ${codeTag} [NLS.1.1, AI.1] (Khởi động): GV trình chiếu clip tư liệu lịch sử/hình ảnh vệ tinh địa lí độ phân giải cao; tổ chức đố vui địa danh số trên Quizizz.`;
      w_hs = `* ${codeTag} [NLS.1.1] (Khởi động): HS theo dõi tư liệu số, hào hứng trả lời câu hỏi tương tác xác định vị trí và sự kiện.`;
      w_prod = `* ${codeTag} [NLS.1.1] (Sản phẩm/Kết quả): Bảng điểm trò chơi khởi động, tâm thế sẵn sàng tìm hiểu không gian/thời gian lịch sử - địa lí.`;
      d_gv = `* ${codeTag} [NLS.1.2, AI.2] (Khám phá): GV hướng dẫn khai thác bản đồ số GIS / Google Earth và bảo tàng thực tế ảo 3D; dẫn dắt HS phân tích diễn biến và đặc điểm địa hình.`;
      d_hs = `* ${codeTag} [NLS.1.2, AI.3] (Khám phá): HS tra cứu bản đồ số, đánh dấu các tọa độ quan trọng, thu thập số liệu khí hậu/dân cư và tổng hợp kiến thức.`;
      d_prod = `* ${codeTag} [NLS.1.2] (Sản phẩm/Kết quả): Lược đồ số hóa hoặc bảng tổng hợp sự kiện lịch sử, đặc điểm địa lí hoàn chỉnh.`;
      p_gv = `* ${codeTag} [NLS.3.1, AI.2] (Luyện tập): GV giao phiếu bài tập trắc nghiệm số và bài tập vẽ biểu đồ/xác định tọa độ trên bản đồ số; hướng dẫn đối chiếu đáp án.`;
      p_hs = `* ${codeTag} [NLS.3.1, AI.3] (Luyện tập): HS hoàn thành bài tập tương tác, kiểm tra kiến thức và sửa chữa các sai sót về mốc thời gian/địa danh.`;
      p_prod = `* ${codeTag} [NLS.3.1] (Sản phẩm/Kết quả): Bài tập thực hành bản đồ/biểu đồ số hoàn thành chính xác.`;
      a_gv = `* ${codeTag} [NLS.5.2, ANQP.1, GDĐP.1] (Vận dụng): GV hướng dẫn HS xây dựng cẩm nang số du lịch địa phương hoặc infographic tuyên truyền bảo vệ chủ quyền biên giới, biển đảo.`;
      a_hs = `* ${codeTag} [NLS.5.2, ANQP.1, GDĐP.1] (Vận dụng): HS thiết kế infographic trên Canva hoặc video ngắn quảng bá di tích lịch sử quê hương.`;
      a_prod = `* ${codeTag} [NLS.5.2, ANQP.1, GDĐP.1] (Sản phẩm/Kết quả): Infographic, cẩm nang du lịch số hoặc video clip tuyên truyền chủ quyền biển đảo quê hương.`;
    }

    return {
      subject,
      grade,
      lesson_title: lessonTitle,
      objectives_list: objectivesList,
      warmup_gv: w_gv,
      warmup_hs: w_hs,
      warmup_prod: w_prod,
      discovery_gv: d_gv,
      discovery_hs: d_hs,
      discovery_prod: d_prod,
      practice_gv: p_gv,
      practice_hs: p_hs,
      practice_prod: p_prod,
      application_gv: a_gv,
      application_hs: a_hs,
      application_prod: a_prod,
      code_tag: codeTag,
      is_english: false
    };
  }
}
