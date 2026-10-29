import { TranslationSchema } from '../types';

export const vi: TranslationSchema = {
  common: {
    ok: 'Đồng ý',
    cancel: 'Hủy bỏ',
    close: 'Đóng',
    save: 'Lưu',
    reset: 'Đặt lại',
    search: 'Tìm kiếm',
    loading: 'Đang tải...',
    copy: 'Sao chép',
    copied: 'Đã sao chép!',
    format: 'Format',
    formatting: 'Đang format...',
    settings: 'Cài đặt',
    language: 'Ngôn ngữ',
    all: 'Tất cả',
    default: 'Mặc định'
  },
  toolbar: {
    previewMode: 'Chỉ đọc (Reader Preview)',
    splitMode: 'Xem song song (Split Preview & Edit)',
    editorMode: 'Soạn thảo nhanh (Raw Editor)',
    formatTooltip: 'Định dạng / Làm đẹp tài liệu',
    formatJsonTooltip: 'Định dạng JSON (Làm đẹp & Căn lề)',
    settingsTooltip: 'Cài đặt giao diện & phông chữ',
    otherOptions: 'Tùy chọn khác',
    openFolderTooltip: 'Nhấp để mở thư mục',
    formatting: 'Đang format...',
    format: 'Format'
  },
  sidebar: {
    filesTab: 'Cây thư mục tập tin',
    tocTab: 'Chỉ mục & Mục lục (Outline)',
    searchTooltip: 'Tìm kiếm trong mục lục / file',
    searchPlaceholder: 'Tìm kiếm mục lục hoặc file...',
    noHeadings: 'Không có tiêu đề nào trong tài liệu này',
    noFiles: 'Chưa mở thư mục nào',
    openFolder: 'Mở thư mục',
    addFolder: 'Thêm thư mục',
    syncFolders: 'Đồng bộ thư mục',
    syncing: 'Đang đồng bộ...',
    pinFile: 'Ghim tệp lên đầu',
    unpinFile: 'Bỏ ghim',
    removeFolder: 'Xóa thư mục khỏi danh sách',
    filterLabel: 'Lọc tệp',
    filterAll: 'Tất cả định dạng',
    filterMarkdownOnly: 'Chỉ hiển thị Markdown (.md, .markdown)',
    filterCodeOnly: 'Chỉ hiển thị Mã nguồn (.ts, .js, .py, .go, ...)',
    filterJsonOnly: 'Chỉ hiển thị JSON (.json)',
    closeSidebar: 'Thu gọn thanh bên',
    openSidebar: 'Mở thanh bên',
    openFolderDesc: 'Nhấp để chọn một thư mục trên máy tính và hiển thị cây thư mục',
    scanning: 'Đang quét...'
  },
  settings: {
    modalTitle: 'Cài đặt Giao diện & Ngôn ngữ',
    languageSection: 'Ngôn ngữ hiển thị (Language)',
    languageVi: 'Tiếng Việt',
    languageEn: 'English',
    themePresets: 'Chủ đề cài sẵn (Theme Presets)',
    customColors: 'Tùy chỉnh màu sắc chi tiết',
    typography: 'Phông chữ tài liệu (Typography)',
    fontFamily: 'Phông chữ',
    fontDescription: 'Mô tả phông chữ',
    accentColor: 'Màu nhấn (Accent Color)',
    bgColor: 'Màu nền chính (Primary Background)',
    textColor: 'Màu chữ chính (Primary Text)',
    headingColor: 'Màu tiêu đề (Headings)',
    codeTextColor: 'Màu chữ code nội dòng (Inline Code)',
    resetDefault: 'Khôi phục mặc định'
  },
  themes: {
    obsidianDark: 'Obsidian Dark (Mặc định)',
    cleanLight: 'Clean Light'
  },
  fonts: {
    'apple-system': {
      name: 'Apple System (San Francisco)',
      description: 'Phông chữ hệ thống chuẩn của Apple, mượt mà và sắc nét'
    },
    'google-roboto': {
      name: 'Google Roboto',
      description: 'Phông chữ hiện đại từ Google, hỗ trợ đa ngôn ngữ hoàn hảo, không lỗi dấu'
    },
    'google-open-sans': {
      name: 'Google Open Sans',
      description: 'Phông chữ thân thiện, thoáng mắt, tối ưu cho đọc tài liệu'
    },
    'microsoft-segoe-ui': {
      name: 'Microsoft Segoe UI',
      description: 'Phông chữ tiêu chuẩn của Windows, cực kỳ ổn định và rõ nét'
    },
    'inter': {
      name: 'Inter',
      description: 'Phông chữ màn hình số hiện đại, thanh thoát và cân đối'
    }
  },
  alerts: {
    note: 'Lưu ý',
    tip: 'Mẹo',
    important: 'Quan trọng',
    warning: 'Cảnh báo',
    caution: 'Nguy hiểm'
  },
  notifications: {
    missingFileTitle: 'Không tìm thấy file liên kết',
    missingFileDesc: 'Thêm thư mục cha chứa file này vào không gian làm việc để mở tự động.',
    addFolderAction: 'Thêm thư mục',
    syncStarted: 'Bắt đầu quét và đồng bộ các thư mục...',
    syncSuccess: 'Đồng bộ thư mục thành công!',
    syncError: 'Có lỗi xảy ra khi đồng bộ thư mục'
  },
  editor: {
    placeholder: 'Nhập nội dung Markdown tại đây...'
  },
  extension: {
    appName: 'Markdown Reader & Outline',
    appDesc: 'Trình đọc và định dạng Markdown cao cấp với cây thư mục, mục lục live, và tô màu cú pháp',
    fileAccessPerm: 'Quyền đọc file máy tính:',
    permissionGranted: 'Đã bật',
    permissionDenied: 'Chưa bật',
    enableInSettings: 'Kích hoạt trong Cài đặt',
    modeLocal: 'File cục bộ (Máy tính)',
    modeWeb: 'Web URL (Chỉ hiện TOC)',
    guidePage: 'Trang hướng dẫn',
    onboardingTitle: 'Markdown Reader',
    onboardingSubtitle: 'Trình đọc và định dạng Markdown đa nền tảng',
    onboardingReadyTitle: 'Đã bật quyền truy cập file máy tính thành công!',
    onboardingReadyDesc: 'Bạn đã sẵn sàng! Bây giờ bất cứ khi nào bạn mở file .md hoặc kéo thả file từ máy tính vào trình duyệt, tiện ích sẽ tự động định dạng và nạp cây thư mục đầy đủ.',
    onboardingRequireTitle: 'Yêu cầu kích hoạt: Cho phép truy cập vào các URL của tệp',
    onboardingRequireDesc: 'Trình duyệt Chromium (Chrome/Edge/Brave) yêu cầu bạn bật tùy chọn "Allow access to file URLs" để tiện ích có thể đọc và định dạng các file .md trực tiếp từ ổ đĩa của bạn.',
    onboardingOpenSettingsBtn: 'Mở trang Cài đặt để Bật quyền'
  }
};
