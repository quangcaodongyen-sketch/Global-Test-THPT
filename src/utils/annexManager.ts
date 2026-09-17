import { AnnexIntegrationItem } from '../types/annexTypes';
import { DEFAULT_ANNEX_ITEMS } from '../data/defaultAnnexData';

const STORAGE_KEY = 'nls_ai_thcs_saved_annex_2026_v1';

export class AnnexManager {
  private static cachedItems: AnnexIntegrationItem[] | null = null;

  /**
   * Tải toàn bộ danh sách Phụ lục 3 từ bộ nhớ vĩnh viễn (LocalStorage)
   * Nếu chưa có, nạp kho dữ liệu chuẩn mặc định của Thầy Đinh Văn Thành
   */
  public static getItems(): AnnexIntegrationItem[] {
    if (this.cachedItems) {
      return this.cachedItems;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.cachedItems = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.error('Lỗi đọc dữ liệu Phụ lục III từ localStorage:', e);
    }

    // Nạp mặc định
    this.cachedItems = [...DEFAULT_ANNEX_ITEMS];
    this.saveItems(this.cachedItems);
    return this.cachedItems;
  }

  /**
   * Lưu danh sách Phụ lục 3 vào bộ nhớ vĩnh viễn
   */
  public static saveItems(items: AnnexIntegrationItem[]): void {
    this.cachedItems = items;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Lỗi ghi dữ liệu Phụ lục III vào localStorage:', e);
    }
  }

  /**
   * Thêm hoặc cập nhật một bài học vào kho Phụ lục 3
   */
  public static addOrUpdateItem(item: AnnexIntegrationItem): void {
    const items = [...this.getItems()];
    if (!item.id) {
      item.id = `ITEM_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    const idx = items.findIndex(
      (x) =>
        x.id === item.id ||
        (x.lesson_title.trim().toLowerCase() === item.lesson_title.trim().toLowerCase() &&
          x.subject.trim().toLowerCase() === item.subject.trim().toLowerCase())
    );

    if (idx >= 0) {
      items[idx] = { ...items[idx], ...item };
    } else {
      items.unshift(item);
    }

    this.saveItems(items);
  }

  /**
   * Xóa một bài học khỏi kho Phụ lục 3
   */
  public static deleteItem(id: string): boolean {
    const items = this.getItems();
    const filtered = items.filter((x) => x.id !== id);
    if (filtered.length !== items.length) {
      this.saveItems(filtered);
      return true;
    }
    return false;
  }

  /**
   * Xóa toàn bộ kho Phụ lục 3
   */
  public static clearAll(): void {
    this.saveItems([]);
  }

  /**
   * Khôi phục kho Phụ lục 3 chuẩn mặc định của Thầy Thành
   */
  public static resetToDefault(): AnnexIntegrationItem[] {
    this.saveItems([...DEFAULT_ANNEX_ITEMS]);
    return this.getItems();
  }

  /**
   * Tìm kiếm bài học theo từ khóa, môn học, khối lớp
   */
  public static search(query: string, subject?: string, grade?: string): AnnexIntegrationItem[] {
    const items = this.getItems();
    const q = query.trim().toLowerCase();
    const s = subject?.trim().toLowerCase();
    const g = grade?.trim().toLowerCase();

    return items.filter((item) => {
      if (s && s !== 'tất cả' && s !== 'chung' && !item.subject.toLowerCase().includes(s)) {
        return false;
      }
      if (g && g !== 'tất cả' && g !== 'chung' && item.grade.toLowerCase() !== g) {
        return false;
      }
      if (!q) return true;

      const titleMatch = item.lesson_title.toLowerCase().includes(q);
      const subjMatch = item.subject.toLowerCase().includes(q);
      const nlsMatch = item.nls_content?.toLowerCase().includes(q) || false;
      const aiMatch = item.ai_content?.toLowerCase().includes(q) || false;
      const integMatch = item.integrations ? Object.values(item.integrations).some((v) => v.toLowerCase().includes(q)) : false;

      return titleMatch || subjMatch || nlsMatch || aiMatch || integMatch;
    });
  }

  /**
   * Đối soát bài dạy từ tiêu đề giáo án với kho Phụ lục III
   */
  public static findMatchingAnnex(
    lessonTitle: string,
    subject?: string,
    grade?: string
  ): AnnexIntegrationItem | null {
    const items = this.getItems();
    if (items.length === 0) return null;

    const cleanTitle = lessonTitle
      .toLowerCase()
      .replace(/^(bài|tiết|unit|lesson|chủ đề)\s*[:.\s]?\s*\d+[:.\s-]*/gi, '')
      .trim();

    if (!cleanTitle && !lessonTitle.trim()) return null;

    // 1. Khớp chính xác hoàn toàn (Cả tiêu đề, môn, lớp)
    for (const item of items) {
      const itTitle = item.lesson_title
        .toLowerCase()
        .replace(/^(bài|tiết|unit|lesson|chủ đề)\s*[:.\s]?\s*\d+[:.\s-]*/gi, '')
        .trim();

      if (itTitle === cleanTitle || item.lesson_title.toLowerCase().trim() === lessonTitle.toLowerCase().trim()) {
        if (!subject || subject === 'Chung' || item.subject === 'Chung' || item.subject.toLowerCase() === subject.toLowerCase()) {
          return item;
        }
      }
    }

    // 2. Khớp chuỗi con (substring) có độ dài > 5 ký tự
    if (cleanTitle.length >= 5) {
      for (const item of items) {
        const itTitle = item.lesson_title.toLowerCase();
        if (itTitle.includes(cleanTitle) || cleanTitle.includes(itTitle)) {
          if (!subject || subject === 'Chung' || item.subject === 'Chung' || item.subject.toLowerCase() === subject.toLowerCase()) {
            return item;
          }
        }
      }
    }

    // 3. Khớp số bài học (Ví dụ: "Bài 1", "Bài 14", "Unit 2")
    const lessonNumMatch = lessonTitle.match(/(?:bài|tiết|unit|lesson)\s*[:.\s]?\s*(\d+)/i);
    if (lessonNumMatch) {
      const num = lessonNumMatch[1];
      for (const item of items) {
        const itMatch = item.lesson_title.match(/(?:bài|tiết|unit|lesson)\s*[:.\s]?\s*(\d+)/i);
        if (itMatch && itMatch[1] === num) {
          if (subject && item.subject.toLowerCase() === subject.toLowerCase()) {
            return item;
          }
        }
      }
    }

    return null;
  }

  /**
   * Nhập dữ liệu từ file JSON hoặc văn bản
   */
  public static importFromJson(jsonString: string): number {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        throw new Error('Dữ liệu JSON phải là danh sách mảng các bài học');
      }

      let count = 0;
      for (const item of parsed) {
        if (item.lesson_title) {
          this.addOrUpdateItem(item);
          count++;
        }
      }
      return count;
    } catch (e: any) {
      throw new Error(`Lỗi phân tích JSON: ${e.message}`);
    }
  }

  /**
   * Nhập dữ liệu từ văn bản Text / Phụ lục III
   */
  public static importFromText(text: string): number {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    let count = 0;
    let currentItem: Partial<AnnexIntegrationItem> | null = null;

    for (const line of lines) {
      if (line.match(/^(?:bài|tiết|unit|lesson|chủ đề)\s*[:.\s]?\s*\d+/i) || line.startsWith('#') || line.match(/^[A-Z0-9\s]{6,}:/)) {
        if (currentItem && currentItem.lesson_title) {
          this.addOrUpdateItem(currentItem as AnnexIntegrationItem);
          count++;
        }
        currentItem = {
          id: `IMP_${Date.now()}_${count}`,
          subject: 'Chung',
          grade: 'THCS',
          lesson_title: line.replace(/^#+\s*/, '').trim(),
          integrations: {}
        };
      } else if (currentItem) {
        if (line.startsWith('*')) {
          const colonIdx = line.indexOf(':');
          if (colonIdx > 0) {
            const tag = line.slice(1, colonIdx).trim().toUpperCase();
            if (!currentItem.integrations) currentItem.integrations = {};
            currentItem.integrations[tag] = line;

            if (tag.includes('NLS')) currentItem.nls_content = line;
            if (tag.includes('AI')) currentItem.ai_content = line;
            if (tag.includes('STEM')) currentItem.stem_content = line;
            if (tag.includes('ANQP')) currentItem.anqp_content = line;
            if (tag.includes('QCN')) currentItem.qcn_content = line;
            if (tag.includes('XBHTLH')) currentItem.xbhtlh_content = line;
            if (tag.includes('BVMT')) currentItem.bvmt_content = line;
            if (tag.includes('GDTC')) currentItem.gdtc_content = line;
            if (tag.includes('GDĐP')) currentItem.gddp_content = line;
          }
        }
      }
    }

    if (currentItem && currentItem.lesson_title) {
      this.addOrUpdateItem(currentItem as AnnexIntegrationItem);
      count++;
    }

    return count;
  }

  /**
   * Xuất toàn bộ kho dữ liệu Phụ lục III thành file JSON
   */
  public static exportToJson(): string {
    return JSON.stringify(this.getItems(), null, 2);
  }
}
