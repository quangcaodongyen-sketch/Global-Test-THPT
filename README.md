# CÔNG CỤ TÍCH HỢP NĂNG LỰC SỐ, AI VÀ CÁC NỘI DUNG GIÁO DỤC CẤP THCS (NLS-AI THCS PRO 2026)

> **Phần mềm Thương mại Chuẩn Sư Phạm Chuyển Đổi Số Giáo Dục Cấp THCS**  
> **Tác giả & Bản quyền:** Thầy giáo **Đinh Văn Thành** – Trường THCS Đồng Yên, tỉnh Tuyên Quang  
> **Hotline / Zalo hỗ trợ & Kích hoạt VIP:** **0915.213.717**  
> **Khung pháp lý áp dụng:**  
> - Công văn số **5512/BGDĐT-GDTrH** (Quy chuẩn cấu trúc Kế hoạch bài dạy)  
> - Thông tư số **02/2025/TT-BGDĐT** (Quy định Khung năng lực số cho người học)  
> - Thông tư số **18/2026/TT-BGDĐT** (Quy định Khung năng lực số cho giáo viên)  
> - Quyết định số **2422/QĐ-BGDĐT** (Định hướng ứng dụng Trí tuệ nhân tạo trong giáo dục)  
> - Công văn số **5588/BGDĐT-GDTrH** (Triển khai tích hợp giáo dục lý tưởng, đạo đức, lối sống, kỹ năng sống)  
> - Thông tư số **08/2024/TT-BGDĐT** (Tích hợp giáo dục quốc phòng và an ninh)  
> - Công văn số **3089/BGDĐT-GDTrH** (Tích hợp giáo dục STEM cấp THCS)

---

## 🌟 1. TỔNG QUAN HỆ THỐNG & 8 TRỤ CỘT CHUẨN HÓA

Ứng dụng được chuyển đổi toàn diện theo quy trình **SKILL_TOOL_TO_STANDARD_APP**, nâng cấp từ công cụ Desktop thành giải pháp Web App thương mại chất lượng cao, chạy mượt mà trên mọi trình duyệt:

### 💎 Trụ cột 1: Bản quyền Tác giả Bất Biến
- Tác giả duy nhất: **Thầy giáo Đinh Văn Thành** – Trường THCS Đồng Yên, tỉnh Tuyên Quang.
- Số điện thoại / Zalo: **0915.213.717**.
- Nhận diện thương hiệu trang trọng: Ảnh chân dung Thầy Thành được bo tròn viền vàng, xuất hiện tại Header, Footer, Admin Dashboard, Tab Giới Thiệu và Popup kích hoạt VIP.

### 💎 Trụ cột 2: Exact Template Injection (Động Cơ OpenXML JSZip Chuẩn Xác)
- Nạp trực tiếp file giáo án `.docx` của thầy cô bằng thư viện **JSZip** trực tiếp tại trình duyệt (100% xử lý an toàn nội bộ trên máy khách, bảo mật tuyệt đối giáo án của giáo viên).
- Bảo toàn nguyên vẹn 1000% thể thức:
  - Giữ nguyên toàn bộ căn lề, tiêu đề trường/phòng/tổ bộ môn.
  - Giữ nguyên công thức toán học (`m:oMath`, `m:oMathPara`), hình vẽ, sơ đồ và bảng biểu phức tạp.
- Chèn chuẩn xác đoạn văn tích hợp theo quy chuẩn Bộ GD&ĐT:
  - Font chữ: **Times New Roman 13pt**.
  - Màu sắc: **Màu ĐỎ `#FF0000`** nổi bật theo đúng hướng dẫn tập huấn của Sở/Phòng GD&ĐT.
  - Thụt đầu dòng: **1.27 cm (First line indent = 720 twips)**.
  - Căn lề: **Căn đều hai bên (Both justified)**.
  - Vị trí: Chèn tự động vào Mục tiêu phẩm chất (Phần I.3) và Hoạt động Vận dụng / Hướng dẫn tự học (Phần III).

### 💎 Trụ cột 3: Super Admin Toàn Năng & Bảo Mật Tuyệt Đối
- Thông tin đăng nhập Admin: `Admin` / `Admin123@`.
- Mã hóa mật khẩu một chiều chuẩn **SHA-256 + Salt** qua Web Crypto API.
- **Bảo mật tuyệt đối thông tin Admin:** Không hiển thị bất kỳ gợi ý, placeholder hay nút điền nhanh tài khoản Admin trên giao diện công khai để đảm bảo quyền riêng tư.
- 5 Phân hệ Quản trị Chuyên sâu (`AdminDashboard`):
  1. *Tổng quan KPIs thời gian thực:* Theo dõi số lượng thành viên, dùng thử, VIP, doanh thu và nhật ký hoạt động.
  2. *Quản lý thành viên:* Tìm kiếm, lọc, kích hoạt `[VIP 1N]` (+12 tháng), `[VIP 2N]` (+24 tháng), khóa/mở khóa tài khoản và đổi mật khẩu.
  3. *Quản lý hồ sơ giáo án:* Quản lý tên file, dung lượng và trạng thái giáo án được tải lên.
  4. *Thống kê sử dụng:* Cơ cấu thành viên và tỷ lệ sử dụng các chuyên đề NLS, AI, STEM, ANQP...
  5. *Cài đặt hệ thống & Sao lưu an toàn:* Xuất file `Export JSON` lưu về máy và nạp lại qua `Import JSON`.

### 💎 Trụ cột 4: Đăng Ký Thành Viên Chuẩn Sư Phạm & Dùng Thử 5 Lượt
- Form đăng ký đầy đủ các trường sư phạm: Họ tên, Trường, SĐT, Tên đăng nhập, Mật khẩu, Tỉnh/TP, Môn học, Cấp học.
- Có nút **"Điền mẫu giáo viên"** (*Cô Nguyễn Thị Lan – THCS Chu Văn An*) giúp trải nghiệm nhanh chóng mà không làm lộ tài khoản Admin.
- Mỗi thiết bị mới được cấp đúng **5 lượt dùng thử đầy đủ tính năng**.

### 💎 Trụ cột 5: Chống Gian Lận Bằng Dấu Vân Tay Phần Cứng (Device Fingerprinting)
- Nhận diện máy qua thuật toán tổ hợp: **Canvas 2D Hash + Độ phân giải màn hình (Screen) + Hệ điều hành & Múi giờ**.
- Cơ chế lưu trữ đa tầng (Triple-tier storage: `localStorage` + `sessionStorage` + `Cookie`).
- **TUYỆT ĐỐI KHÔNG KHÓA IP:** Đảm bảo toàn bộ giáo viên trong một trường dùng chung mạng Wi-Fi/LAN của trường không bị khóa oan lẫn nhau.
- Chặn máy cũ cố tình tạo thêm tài khoản để gian lận lượt dùng thử.

### 💎 Trụ cột 6: Báo Giá Thương Mại VIP & Contextual Paywall
- **Ẩn tab báo giá công khai** trên thanh Menu để giữ tính trang trọng, hàn lâm trong môi trường giáo dục.
- Bảng giá chỉ hiển thị trong popup hết lượt (`OutOfTrialsModal`):
  - **Gói VIP 1 Năm (12 tháng):** **200.000 VNĐ** *(~16.000đ/tháng)*.
  - **Gói VIP 2 Năm (24 tháng):** **300.000 VNĐ** *(~12.000đ/tháng - Tiết kiệm 100k, Khuyên dùng)*.
- Tích hợp nút hành động trực tiếp dẫn đến Zalo Thầy Thành: `https://zalo.me/0915213717`.
- Cú pháp thanh toán chuyển khoản quét mã QR tự động: `VIP [Tên_Đăng_Nhập] [Số_Điện_Thoại]`.

### 💎 Trụ cột 7: Cấu Trúc 4 Tab Điều Hướng Chuẩn Mực
1. **Tab 1: ⚡ TÍCH HỢP GIÁO ÁN THCS (TOOL THẦY THÀNH) - Mặc định:**
   - Hỗ trợ tải file `.docx` giáo án từ máy tính hoặc bấm chọn **"Dùng giáo án mẫu Toán 9"**.
   - Phân định rõ 2 chế độ:
     - *Chế độ 1: Chọn bài có sẵn trong Phụ lục III (Tốc độ tức thì, 0 đồng phí API).*
     - *Chế độ 2: Tự động phân tích sâu & sinh mã chỉ báo chuẩn hóa (Khuyến nghị cho giáo án mới).*
   - Tùy chọn vị trí chèn: Mục I (Phẩm chất) và Mục III (Hoạt động học tập / Vận dụng).
   - Thanh tiến trình thực thi 6 bước và Bảng nhật ký xử lý chi tiết.
   - Thẻ kết quả tải về file `.docx` đã hoàn thiện và bảng đối soát minh chứng.
2. **Tab 2: 🤖 TÍCH HỢP AI CHUYÊN SÂU & TRỢ LÝ SOẠN BÀI:**
   - Kết nối trực tiếp mô hình **Google Gemini 2.5 Flash**.
   - Hỗ trợ đa chuyên đề: NLS (TT 02/2025), AI (QĐ 2422), STEM (CV 3089), ANQP (TT 08/2024), Quyền con người, Môi trường, Tài chính, Địa phương.
   - Cơ chế dự phòng thông minh (Offline Fallback) tự động phản hồi trọn vẹn ngữ liệu khi chưa có mạng hoặc hết quota.
   - Xuất nhanh file `.docx` đoạn tích hợp hoặc sao chép vào khay nhớ tạm.
3. **Tab 3: 🌟 GIỚI THIỆU & LỢI ÍCH ỨNG DỤNG (`AboutView`):**
   - Hero banner tôn vinh tác giả Thầy Đinh Văn Thành.
   - **6 Lợi ích vàng:** Tiết kiệm 95% thời gian, Chuẩn 100% CV 5512 & TT 02/2025, Động cơ OpenXML nguyên vẹn công thức Toán, Đầy đủ 12 bộ môn THCS, Đa chuyên đề giáo dục, Hỗ trợ kỹ thuật 24/7.
   - **Bảng so sánh:** Soạn tích hợp thủ công vs Dùng NLS-AI THCS PRO.
   - **Quy trình 3 bước:** Thao tác trực quan, thân thiện cho mọi giáo viên.
   - Lời ngỏ tâm huyết của Thầy Thành.
4. **Tab 4: 📚 KHO PHỤ LỤC III & TÀI LIỆU GỐC (CHỈ DÀNH CHO ADMIN):**
   - **Ẩn hoàn toàn với khách và thành viên thường**.
   - Chỉ hiển thị trên thanh Header khi tài khoản `Admin` đăng nhập.
   - Lưu trữ 54 bài mẫu Phụ lục III THCS chuẩn, Giáo án mẫu Toán 9 đã tích hợp, tài liệu hướng dẫn và phần mềm Desktop gốc.

### 💎 Trụ cột 8: Hướng Dẫn Cài Đặt API Key Chuẩn Giáo Viên
- Modal hướng dẫn 6 bước chi tiết cho giáo viên không chuyên công nghệ.
- Đủ 4 nút bấm: `[🔑 Lấy API Key]`, `[📋 Sao chép hướng dẫn]`, `[💾 Lưu API Key]`, `[🔍 Kiểm tra API Key]`.
- Ô nhập mã được che an toàn (`••••••••`), lưu trữ tại `localStorage` trình duyệt máy cá nhân, tuyệt đối không lộ lên mạng.

---

## 💻 2. CÔNG NGHỆ ÁP DỤNG

- **Frontend Core:** React 19, TypeScript, Tailwind CSS.
- **Biểu tượng giao diện:** Lucide React.
- **Động cơ OpenXML:** JSZip (phân tích, chỉnh sửa và đóng gói file Word trực tiếp trên Client-side).
- **Trí tuệ nhân tạo:** Google GenAI SDK (`@google/genai` - Gemini 2.5 Flash).
- **Bảo mật & Mã hóa:** Web Crypto API (SHA-256), Canvas 2D Device Fingerprint.
- **Kiến trúc dữ liệu:** Khung lưu trữ Phụ lục III chuẩn 12 môn THCS, hỗ trợ import/export JSON.

---

## 🚀 3. HƯỚNG DẪN TRIỂN KHAI LÊN GITHUB & VERCEL

Dự án được cấu trúc chuẩn hóa sẵn sàng đưa lên GitHub và Vercel:

### Bước 1: Đẩy mã nguồn lên GitHub
```bash
git init
git add .
git commit -m "feat: release NLS-AI THCS PRO 2026 - Chuẩn CV 5512 & TT 02/2025"
git branch -M main
git remote add origin https://github.com/<tai-khoan-cua-ban>/nls-ai-thcs-pro.git
git push -u origin main
```

### Bước 2: Triển khai lên Vercel
1. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
2. Chọn **"Add New"** → **"Project"** → Chọn repository `nls-ai-thcs-pro`.
3. Cấu hình triển khai:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. File `vercel.json` có sẵn trong dự án đã cấu hình định tuyến SPA:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
5. Nhấn **"Deploy"** và ứng dụng sẽ hoạt động online trong vòng 1 phút!

---

## 📞 4. THÔNG TIN LIÊN HỆ & BẢN QUYỀN

- **Chủ nhiệm dự án & Tác giả phần mềm:** Thầy giáo **Đinh Văn Thành**
- **Đơn vị công tác:** Trường THCS Đồng Yên, huyện Bắc Quang, tỉnh Hà Giang (nay thuộc địa bàn tỉnh Tuyên Quang)
- **Số điện thoại / Hotline / Zalo:** [0915.213.717](https://zalo.me/0915213717)
- **Email:** dinhthanhdongyen@gmail.com
- © 2026 - 2027 Bản quyền thuộc về Thầy Đinh Văn Thành. Mọi hành vi sao chép trái phép không qua sự đồng ý của tác giả đều vi phạm bản quyền phần mềm giáo dục.
