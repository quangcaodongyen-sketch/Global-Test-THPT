import JSZip from 'jszip';
import { AnnexIntegrationItem, IntegrationMode, PedagogicalAnalysisResult } from '../types/annexTypes';
import { AnnexManager } from './annexManager';
import { PedagogicalAnalyzer } from './pedagogicalAnalyzer';

export interface IntegrationExecutionOptions {
  file: File;
  mode: IntegrationMode;
  injectSection1: boolean;
  injectSection3: boolean;
  selectedAnnexItem?: AnnexIntegrationItem | null;
  onProgress?: (step: number, total: number, message: string) => void;
}

export interface IntegrationExecutionResult {
  blob: Blob;
  fileName: string;
  detectedSubject: string;
  detectedGrade: string;
  detectedTitle: string;
  totalLessons: number;
  analysis: PedagogicalAnalysisResult;
}

export class ExactLessonPlanEngine {
  private static readonly W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

  /**
   * Tạo XML element cho một đoạn văn bản chuẩn mẫu Thầy Đinh Văn Thành:
   * - Phông: Times New Roman
   * - Cỡ: 13 pt (sz="26")
   * - Màu: ĐỎ #FF0000
   * - In thường (regular)
   * - Căn đều 2 bên (both)
   * - Thụt lề đầu dòng 1.27cm (720 dxa) khi ở ngoài bảng
   */
  public static createStandardParagraphXml(
    doc: Document,
    text: string,
    inTableCell: boolean = false
  ): Element {
    const p = doc.createElementNS(this.W_NS, 'w:p');
    const pPr = doc.createElementNS(this.W_NS, 'w:pPr');

    // Giãn cách dòng và đoạn
    const spacing = doc.createElementNS(this.W_NS, 'w:spacing');
    spacing.setAttributeNS(this.W_NS, 'w:before', '60');
    spacing.setAttributeNS(this.W_NS, 'w:after', '60');
    spacing.setAttributeNS(this.W_NS, 'w:line', '240');
    spacing.setAttributeNS(this.W_NS, 'w:lineRule', 'auto');
    pPr.appendChild(spacing);

    // Căn đều hai bên
    const jc = doc.createElementNS(this.W_NS, 'w:jc');
    jc.setAttributeNS(this.W_NS, 'w:val', 'both');
    pPr.appendChild(jc);

    // Thụt đầu dòng 1.27 cm (720 dxa) ngoài bảng
    if (!inTableCell) {
      const ind = doc.createElementNS(this.W_NS, 'w:ind');
      ind.setAttributeNS(this.W_NS, 'w:firstLine', '720');
      pPr.appendChild(ind);
    }

    p.appendChild(pPr);

    // Tạo Run chứa văn bản
    const r = doc.createElementNS(this.W_NS, 'w:r');
    const rPr = doc.createElementNS(this.W_NS, 'w:rPr');

    // Phông chữ Times New Roman
    const rFonts = doc.createElementNS(this.W_NS, 'w:rFonts');
    rFonts.setAttributeNS(this.W_NS, 'w:ascii', 'Times New Roman');
    rFonts.setAttributeNS(this.W_NS, 'w:hAnsi', 'Times New Roman');
    rFonts.setAttributeNS(this.W_NS, 'w:cs', 'Times New Roman');
    rPr.appendChild(rFonts);

    // Màu ĐỎ chuẩn #FF0000
    const color = doc.createElementNS(this.W_NS, 'w:color');
    color.setAttributeNS(this.W_NS, 'w:val', 'FF0000');
    rPr.appendChild(color);

    // Cỡ chữ 13pt (26 half-points)
    const sz = doc.createElementNS(this.W_NS, 'w:sz');
    sz.setAttributeNS(this.W_NS, 'w:val', '26');
    rPr.appendChild(sz);

    const szCs = doc.createElementNS(this.W_NS, 'w:szCs');
    szCs.setAttributeNS(this.W_NS, 'w:val', '26');
    rPr.appendChild(szCs);

    r.appendChild(rPr);

    // Nội dung văn bản
    const t = doc.createElementNS(this.W_NS, 'w:t');
    t.setAttribute('xml:space', 'preserve');
    t.textContent = text;
    r.appendChild(t);

    p.appendChild(r);
    return p;
  }

  /**
   * Thực hiện tích hợp toàn diện trực tiếp trên file Word .docx
   */
  public static async processLessonPlanDocx(
    options: IntegrationExecutionOptions
  ): Promise<IntegrationExecutionResult> {
    const { file, mode, injectSection1, injectSection3, selectedAnnexItem, onProgress } = options;

    // BƯỚC 1: Đọc tệp Docx
    onProgress?.(1, 6, 'Đang giải mã cấu trúc OpenXML của file giáo án Word...');
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const docXmlFile = zip.file('word/document.xml');
    if (!docXmlFile) {
      throw new Error('Tệp không đúng định dạng Word OpenXML chuẩn (thiếu word/document.xml).');
    }

    const docXmlText = await docXmlFile.async('string');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(docXmlText, 'application/xml');

    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error(`Lỗi phân tích cú pháp XML trong file Word: ${parserError.textContent}`);
    }

    // BƯỚC 2: Trích xuất nội dung xem trước và nhận diện sư phạm
    onProgress?.(2, 6, 'AI đang nhận diện môn học THCS, khối lớp và tên bài dạy...');
    const body = xmlDoc.getElementsByTagNameNS(this.W_NS, 'body')[0];
    if (!body) {
      throw new Error('Không tìm thấy thẻ body trong document.xml.');
    }

    const allParagraphs = Array.from(body.getElementsByTagNameNS(this.W_NS, 'p'));
    const previewText = allParagraphs
      .slice(0, 45)
      .map((p) => p.textContent || '')
      .join('\n');

    const detected = PedagogicalAnalyzer.detectSubjectAndGrade(previewText);

    // BƯỚC 3: Đối soát Phụ lục III
    onProgress?.(3, 6, 'Tra cứu đối chiếu trong kho Phụ lục III (Kế hoạch giáo dục)...');
    let matchedItem = selectedAnnexItem;
    if (!matchedItem) {
      matchedItem = AnnexManager.findMatchingAnnex(detected.lessonTitle, detected.subject, detected.grade);
    }

    // BƯỚC 4: Phân tích Sư phạm theo Chế độ đã chọn
    onProgress?.(4, 6, `Đang phân tích sư phạm (${mode === 'exact' ? 'Tích hợp Nguyên văn' : 'Phân tích AI Chi tiết'})...`);
    const analysis = PedagogicalAnalyzer.generateIntegration({
      subject: detected.subject,
      grade: detected.grade,
      lessonTitle: detected.lessonTitle,
      matchedAnnex: matchedItem,
      mode
    });

    // BƯỚC 5: Tiêm các đoạn văn bản màu ĐỎ vào OpenXML
    onProgress?.(5, 6, 'Đang chèn chuẩn hóa Times New Roman 13pt ĐỎ #FF0000 vào Mục I & Mục III...');
    const lessonsCount = this.injectIntegrationIntoDoc(xmlDoc, body, analysis, injectSection1, injectSection3);

    // BƯỚC 6: Đóng gói và xuất bản
    onProgress?.(6, 6, 'Đang hoàn tất đóng gói file Word bảo toàn 100% tài liệu gốc...');
    const serializer = new XMLSerializer();
    const updatedXmlText = serializer.serializeToString(xmlDoc);

    zip.file('word/document.xml', updatedXmlText);

    const outputBlob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const baseName = file.name.replace(/\.(docx|doc)$/i, '');
    const outputFileName = `${baseName}_TichHop_NLS_AI_THCS.docx`;

    return {
      blob: outputBlob,
      fileName: outputFileName,
      detectedSubject: detected.subject,
      detectedGrade: detected.grade,
      detectedTitle: detected.lessonTitle,
      totalLessons: lessonsCount,
      analysis
    };
  }

  /**
   * Quét và tiêm nội dung tích hợp vào đúng các vị trí Mục I và Mục III
   */
  private static injectIntegrationIntoDoc(
    doc: Document,
    body: Element,
    analysis: PedagogicalAnalysisResult,
    injectSection1: boolean,
    injectSection3: boolean
  ): number {
    const childNodes = Array.from(body.childNodes).filter(
      (n) => n.nodeType === Node.ELEMENT_NODE
    ) as Element[];

    // Tìm các điểm mốc Mục I, Mục II, Mục III
    let sec1Element: Element | null = null;
    let sec2Element: Element | null = null;
    let sec3Element: Element | null = null;

    for (const el of childNodes) {
      const text = el.textContent?.trim().toLowerCase() || '';
      if (!sec1Element && /^(?:i|1)[\.\s:]+\s*(?:mục tiêu|yêu cầu cần đạt|objectives|aims)/i.test(text)) {
        sec1Element = el;
      } else if (!sec2Element && /^(?:ii|2)[\.\s:]+\s*(?:thiết bị dạy học|thiết bị|đồ dùng|chuẩn bị|teaching aids)/i.test(text)) {
        sec2Element = el;
      } else if (!sec3Element && /^(?:iii|3)[\.\s:]+\s*(?:tiến trình dạy học|tiến trình|các hoạt động|hoạt động|activities|procedure)/i.test(text)) {
        sec3Element = el;
      }
    }

    // 1. Chèn vào Mục I (Mục tiêu)
    if (injectSection1 && analysis.objectives_list.length > 0) {
      // Tìm vị trí chèn: Ngay trước Mục II nếu có, hoặc sau các đoạn Mục I
      const targetBefore = sec2Element || (sec1Element?.nextSibling as Element | null);

      if (targetBefore && targetBefore.parentNode) {
        for (const objText of analysis.objectives_list) {
          const p = this.createStandardParagraphXml(doc, objText, false);
          targetBefore.parentNode.insertBefore(p, targetBefore);
        }
      } else if (sec1Element && sec1Element.parentNode) {
        let currentRef: Node = sec1Element;
        for (const objText of analysis.objectives_list) {
          const p = this.createStandardParagraphXml(doc, objText, false);
          if (currentRef.nextSibling) {
            currentRef.parentNode?.insertBefore(p, currentRef.nextSibling);
            currentRef = p;
          } else {
            currentRef.parentNode?.appendChild(p);
            currentRef = p;
          }
        }
      }
    }

    // 2. Chèn vào Mục III (Tiến trình dạy học)
    if (injectSection3) {
      this.injectIntoActivities(doc, body, analysis, sec3Element);
    }

    return 1;
  }

  /**
   * Chèn nội dung tích hợp vào các hoạt động trong Mục III (bảng hoặc đoạn văn)
   */
  private static injectIntoActivities(
    doc: Document,
    body: Element,
    analysis: PedagogicalAnalysisResult,
    sec3Element: Element | null
  ): void {
    const tables = Array.from(body.getElementsByTagNameNS(this.W_NS, 'tbl'));

    // Các giai đoạn cần chèn
    const phases = [
      {
        id: 'warmup',
        keywords: ['khởi động', 'mở đầu', 'warm-up', 'warm up', 'lead-in', 'hoạt động 1', 'hđ 1'],
        gv: analysis.warmup_gv,
        hs: analysis.warmup_hs,
        prod: analysis.warmup_prod,
        done: false
      },
      {
        id: 'discovery',
        keywords: ['khám phá', 'hình thành kiến thức', 'bài học mới', 'presentation', 'discovery', 'hoạt động 2', 'hđ 2'],
        gv: analysis.discovery_gv,
        hs: analysis.discovery_hs,
        prod: analysis.discovery_prod,
        done: false
      },
      {
        id: 'practice',
        keywords: ['luyện tập', 'thực hành', 'bài tập', 'practice', 'hoạt động 3', 'hđ 3'],
        gv: analysis.practice_gv,
        hs: analysis.practice_hs,
        prod: analysis.practice_prod,
        done: false
      },
      {
        id: 'application',
        keywords: ['vận dụng', 'mở rộng', 'trải nghiệm', 'production', 'application', 'hoạt động 4', 'hđ 4'],
        gv: analysis.application_gv,
        hs: analysis.application_hs,
        prod: analysis.application_prod,
        done: false
      }
    ];

    // Duyệt qua các bảng để tìm hàng hoạt động
    for (const tbl of tables) {
      const rows = Array.from(tbl.getElementsByTagNameNS(this.W_NS, 'tr'));
      for (const row of rows) {
        const cells = Array.from(row.getElementsByTagNameNS(this.W_NS, 'tc'));
        if (cells.length < 1) continue;

        const rowText = row.textContent?.toLowerCase() || '';

        for (const phase of phases) {
          if (phase.done || !phase.gv) continue;

          // Kiểm tra xem hàng này có phải là của phase này không
          const isMatch = phase.keywords.some((kw) => rowText.includes(kw));
          if (isMatch) {
            // Xác định ô GV, HS, Sản phẩm dựa vào số cột
            if (cells.length >= 3) {
              // Bảng 3 cột hoặc 4 cột
              const gvCell = cells[cells.length >= 4 ? 1 : 0];
              const hsCell = cells[cells.length >= 4 ? 2 : 1];
              const prodCell = cells[cells.length >= 4 ? 3 : 2];

              if (gvCell && phase.gv) {
                const p = this.createStandardParagraphXml(doc, phase.gv, true);
                gvCell.appendChild(p);
              }
              if (hsCell && phase.hs) {
                const p = this.createStandardParagraphXml(doc, phase.hs, true);
                hsCell.appendChild(p);
              }
              if (prodCell && phase.prod) {
                const p = this.createStandardParagraphXml(doc, phase.prod, true);
                prodCell.appendChild(p);
              }
              phase.done = true;
            } else if (cells.length === 2) {
              // Bảng 2 cột (Cột GV | Cột HS)
              const gvCell = cells[0];
              const hsCell = cells[1];

              if (gvCell && phase.gv) {
                const p = this.createStandardParagraphXml(doc, phase.gv, true);
                gvCell.appendChild(p);
              }
              if (hsCell && phase.hs) {
                const p = this.createStandardParagraphXml(doc, phase.hs, true);
                hsCell.appendChild(p);
              }
              phase.done = true;
            }
          }
        }
      }
    }

    // Nếu chưa chèn hết vào bảng (hoặc giáo án viết dưới dạng văn bản đoạn), chèn vào các đoạn văn bản
    const allP = Array.from(body.getElementsByTagNameNS(this.W_NS, 'p'));
    for (const p of allP) {
      const pText = p.textContent?.toLowerCase() || '';
      for (const phase of phases) {
        if (!phase.done && phase.keywords.some((kw) => pText.includes(kw))) {
          const newGvP = this.createStandardParagraphXml(doc, phase.gv, false);
          if (p.nextSibling) {
            p.parentNode?.insertBefore(newGvP, p.nextSibling);
          } else {
            p.parentNode?.appendChild(newGvP);
          }
          phase.done = true;
        }
      }
    }
  }

  /**
   * Kích hoạt tải trực tiếp file Blob về máy tính người dùng
   */
  public static triggerDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}
