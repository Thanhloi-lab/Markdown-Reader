# Markdown Reader & Outline

> Trình đọc, định dạng tài liệu Markdown và cây thư mục hiện đại dành cho Web và Trình duyệt (Microsoft Edge / Google Chrome Extension). Tích hợp hiển thị công thức toán học KaTeX, sơ đồ Mermaid, mục lục tương tác (Live TOC), bộ xem tệp mã nguồn/JSON tự động format và hệ thống quét cây thư mục **0-Popup (Zero-Popup Native Host)**.

---

## 🌟 Tính Năng Nổi Bật

### 📑 1. Trình đọc Markdown chuyên nghiệp
- **Tự động nhận diện**: Tự động chuyển đổi giao diện khi mở bất kỳ tệp Markdown (`.md`, `.markdown`) trên web hoặc máy tính cục bộ (`file:///...`).
- **Mục lục trực tiếp (Live Table of Contents - TOC)**: Tự động trích xuất các tiêu đề từ `H1` đến `H6`, đánh dấu mục đang đọc theo thời gian thực khi cuộn trang, nhấp chuột để cuộn mượt mà đến phần tương ứng.
- **Hỗ trợ đầy đủ GitHub Flavored Markdown (GFM)**: Bảng biểu (Tables), danh sách công việc (Task lists), gạch ngang (Strikethrough), trích dẫn (Blockquotes lồng nhau), biểu tượng cảm xúc.
- **Công thức toán học KaTeX**: Hiển thị mượt mà các công thức toán nội dòng (`$...$`) và khối (`$$...$$`).
- **Sơ đồ Mermaid đa dạng**: Render tự động các biểu đồ Flowchart, Sequence, Class, State, ER, Gantt, GitGraph, PieChart, Mindmap,...

### 🌳 2. Cây thư mục Workspace 0-Popup (Zero-Popup Directory Tree)
- **Tích hợp Native Messaging Host (C# Win32)**: Cho phép quét đệ quy toàn bộ thư mục chứa hàng trăm tệp tin và các thư mục con chỉ trong **~30ms** mà **hoàn toàn không hiện bất kỳ popup hay hộp thoại xin quyền (`showDirectoryPicker`) nào**.
- **Header Breadcrumb Click**: Nhấp chuột trực tiếp vào bất kỳ cấp thư mục cha nào trên thanh breadcrumb ở đầu trang (ví dụ: `country=hk`, `ubo-details_results`) để nạp ngay cây thư mục cấp đó.
- **Tự động nạp thư mục dự án**: Tự động tìm kiếm và nạp thư mục cha phù hợp nhất ngay khi vừa mở tệp Markdown.
- **Hỗ trợ Kéo - Thả (Drag & Drop)**: Nắm thả thư mục trực tiếp từ Windows Explorer vào giao diện để mở toàn bộ tài liệu.
- **Ghim tệp (Pin files)**: Ghim các tệp quan trọng lên đầu danh sách để truy cập nhanh.

### 💻 3. Xem và tự động làm đẹp Code & Dữ liệu (JSON, XML, Code Viewer)
- **Duyệt đa định dạng trong cùng thư mục**: Hỗ trợ mở và xem các tệp tin đi kèm: `.json`, `.xml`, `.yaml`, `.yml`, `.txt`, `.ts`, `.js`, `.py`, `.sql`, `.cs`, `.html`, `.css`.
- **Tự động Pretty-Print JSON**: Khi nhấp vào tệp `.json`, tiện ích tự động phân tích và định dạng thụt lề chuẩn 2 khoảng trắng (`JSON.stringify(..., null, 2)`), kèm số dòng và tô màu cú pháp trực quan (thuộc tính, chuỗi, số, boolean, null).
- **Nút Format thông minh trên Topbar**: Nút **Format** trên thanh công cụ trên cùng tự động nhận diện tài liệu Markdown (định dạng theo chuẩn Prettier) hoặc dữ liệu JSON.

### 🧭 4. Điều hướng URL mượt mà & Lịch sử duyệt (History Navigation)
- **Cập nhật URL tự động**: Khi chọn tệp từ cây thư mục bên trái, thanh địa chỉ URL của trình duyệt (`window.history.replaceState`) và tiêu đề tab sẽ tự động đổi theo tệp đang xem mà không làm tải lại trang.
- **Hỗ trợ nút Back / Forward**: Thoải mái sử dụng nút quay lại/tiến tới trên trình duyệt để duyệt lại lịch sử các tệp vừa xem.
- **Giữ vị trí tệp (`preserveActiveFile`)**: Khi bạn nhấp vào thư mục cha trên Header Breadcrumb để mở rộng thêm cấp thư mục, tệp bạn đang xem vẫn được giữ nguyên vị trí, không bị nhảy hay giật về tệp cũ.

### 🎨 5. Chế độ xem & Tùy biến Theme
- **3 Chế độ xem linh hoạt**:
  - `Preview`: Chế độ đọc tài liệu tập trung (Reader mode).
  - `Split`: Màn hình chia đôi 50/50 (vừa xem vừa soạn thảo).
  - `Editor`: Chế độ soạn thảo nhanh tài liệu.
- **Theme động (Dynamic Theming)**: Chuyển đổi nhanh Dark Mode / Light Mode, tùy chỉnh màu sắc điểm nhấn (Accent), màu nền, màu chữ và kiểu font chữ qua modal cài đặt trực quan.

---

## 📁 Cấu Trúc Monorepo

```text
MarkdownReader/
├── apps/
│   ├── web/                    # Ứng dụng Web SPA (React 19 + Vite + TailwindCSS)
│   ├── extension/              # Tiện ích mở rộng Chrome / Edge (Manifest V3)
│   │   ├── src/                # Mã nguồn Content Script, Background, App React
│   │   ├── native-host/        # Native Messaging Host (C# Win32 + Host Manifest)
│   │   │   ├── Host.cs         # Mã nguồn C# xử lý quét thư mục & đọc tệp siêu tốc
│   │   │   ├── MarkdownHost.exe# File thực thi Native Host đã biên dịch
│   │   │   ├── install.bat     # Script tự động đăng ký Windows Registry
│   │   │   └── com.markdown_reader.host.json # Manifest khai báo Native Host
│   │   └── dist/               # Thư mục kết quả đóng gói extension
│   └── vscode/                 # Mã nguồn mở rộng cho VS Code
├── packages/
│   ├── core/                   # Bộ xử lý cú pháp AST Markdown, TOC, Mermaid, KaTeX
│   └── ui/                     # Bộ thư viện UI React tái sử dụng (MarkdownApp, Sidebar, Viewers)
├── package.json
└── pnpm-workspace.yaml
```

---

## 🛠️ Yêu Cầu Môi Trường (Prerequisites)

- **Node.js**: Phiên bản 18 trở lên (khuyến nghị Node 20 hoặc mới hơn).
- **Trình quản lý gói**: `pnpm` (phiên bản 9 trở lên).
  ```bash
  npm install -g pnpm
  ```
- **Hệ điều hành**: Windows 10/11 (để sử dụng tính năng quét cây thư mục siêu tốc qua C# Native Host).

---

## 🌐 1. Hướng Dẫn Build & Chạy Web App (`apps/web`)

Ứng dụng Web phù hợp khi muốn triển khai dưới dạng cổng thông tin đọc tài liệu, tài liệu nội bộ hoặc chạy thử nghiệm trực tiếp trên trình duyệt.

### Bước 1: Cài đặt dependencies
Chạy lệnh sau tại thư mục gốc của dự án:
```bash
pnpm install
```

### Bước 2: Chạy chế độ phát triển (Development)
```bash
pnpm dev:web
```
Trình duyệt sẽ mở tại địa chỉ: `http://localhost:5173`. Bạn có thể thử nghiệm đầy đủ các tính năng xem trước Markdown, mục lục TOC, chỉnh sửa nhanh và đổi theme.

### Bước 3: Build bản phát hành (Production)
```bash
pnpm build:web
```
Kết quả build được tạo tại: `apps/web/dist`.

### Bước 4: Xem trước bản build Production
```bash
pnpm --filter @markdown-reader/web preview
```

---

## 🧩 2. Hướng Dẫn Build & Cài Đặt Browser Extension (`apps/extension`)

Hỗ trợ cả **Microsoft Edge** và **Google Chrome** (chuẩn Manifest V3).

### Bước 1: Build Packages và Extension
Tại thư mục gốc dự án, thực hiện lệnh:
```bash
pnpm build
```
*(Hoặc chỉ build riêng tiện ích: `pnpm build:extension`)*

Toàn bộ tiện ích mở rộng được biên dịch vào thư mục:
`apps/extension/dist`

---

### Bước 2: Đăng ký Native Messaging Host (Quét thư mục 0-Popup)

Để tiện ích có quyền nạp cây thư mục máy tính cục bộ lập tức khi bạn bấm vào thanh Breadcrumb mà **không bao giờ hiện popup xin quyền**:

1. Vào thư mục `apps/extension/native-host`.
2. Nhấp đúp chuột vào file **`install.bat`** (hoặc mở Terminal chạy `./apps/extension/native-host/install.bat`).
3. File script sẽ tự động tạo khóa đăng ký trong Windows Registry:
   - `HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.markdown_reader.host`
   - `HKCU\Software\Google\Chrome\NativeMessagingHosts\com.markdown_reader.host`

*(Tùy chọn nâng cao)*: Nếu bạn muốn tự biên dịch lại file `MarkdownHost.exe` từ mã nguồn C# `Host.cs`:
```powershell
& "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" /target:exe /out:"apps\extension\native-host\MarkdownHost.exe" /r:"System.Web.Extensions.dll" "apps\extension\native-host\Host.cs"
```

---

### Bước 3: Cài đặt Extension vào Microsoft Edge / Google Chrome

1. **Mở trang quản lý tiện ích**:
   - Trên Microsoft Edge: Truy cập `edge://extensions`
   - Trên Google Chrome: Truy cập `chrome://extensions`
2. **Bật chế độ nhà phát triển**:
   - Gạt công tắc **Developer mode (Chế độ cho nhà phát triển)** ở góc trái hoặc góc phải trên cùng.
3. **Nạp tiện ích đã giải nén**:
   - Nhấn nút **Load unpacked (Tải phần mở rộng đã giải nén)**.
   - Chọn đường dẫn đến thư mục:
     ```text
     <Đường_dẫn_dự_án>\apps\extension\dist
     ```
4. **Cấp quyền truy cập File cục bộ (RẤT QUAN TRỌNG)**:
   - Trên thẻ tiện ích **Markdown Reader & Outline**, nhấn vào **Details (Chi tiết)**.
   - Tìm mục **Allow access to file URLs (Cho phép truy nhập vào URL của tệp)** và gạt sang **BẬT (ON)**.

---

### Bước 4: Trải nghiệm thực tế

1. Mở một tệp Markdown bất kỳ trên máy tính của bạn bằng trình duyệt (ví dụ kéo thả file `.md` vào Edge/Chrome hoặc gõ URL dạng `file:///C:/path/to/document.md`).
2. Tiện ích sẽ tự động nhận diện và hiển thị giao diện đọc sang trọng.
3. Nhấp vào các thư mục cha trên thanh Header Breadcrumb (ví dụ `country=hk` hay `ubo-details_results`) để mở toàn bộ cây thư mục tài liệu.
4. Nhấp chọn giữa các tệp `.md` hoặc `.json` để điều hướng mượt mà, định dạng đẹp mắt và URL tự động cập nhật!

---

## ⌨️ Các Lệnh Thường Dùng (Commands Reference)

| Lệnh | Mô tả |
| :--- | :--- |
| `pnpm install` | Cài đặt toàn bộ dependencies cho tất cả packages và apps |
| `pnpm dev:web` | Khởi chạy dev server cho Web App (`localhost:5173`) |
| `pnpm build` | Biên dịch toàn bộ core, ui, web app và extension |
| `pnpm build:web` | Biên dịch riêng ứng dụng web (`apps/web/dist`) |
| `pnpm build:extension` | Biên dịch riêng web extension (`apps/extension/dist`) |
| `pnpm format` | Tự động căn lề và định dạng code với Prettier |
| `pnpm lint` | Kiểm tra cú pháp và lỗi tiềm ẩn với TypeScript |

---

## 📄 Bản Quyền & Giấy Phép (License)

Dự án được phân phối dưới giấy phép nội bộ. Mọi quyền được bảo lưu.
