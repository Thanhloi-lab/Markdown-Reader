import { TranslationSchema } from '../types';

export const en: TranslationSchema = {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    reset: 'Reset',
    search: 'Search',
    loading: 'Loading...',
    copy: 'Copy',
    copied: 'Copied!',
    format: 'Format',
    formatting: 'Formatting...',
    settings: 'Settings',
    language: 'Language',
    all: 'All',
    default: 'Default'
  },
  toolbar: {
    previewMode: 'Reader Preview',
    splitMode: 'Split Preview & Edit',
    editorMode: 'Raw Editor',
    formatTooltip: 'Format / Beautify document',
    formatJsonTooltip: 'Format JSON (Prettify & Indent)',
    settingsTooltip: 'Theme & Font Settings',
    otherOptions: 'More options',
    openFolderTooltip: 'Click to open folder',
    formatting: 'Formatting...',
    format: 'Format'
  },
  sidebar: {
    filesTab: 'File Explorer',
    tocTab: 'Table of Contents (Outline)',
    searchTooltip: 'Search outline or files',
    searchPlaceholder: 'Search outline or files...',
    noHeadings: 'No headings in this document',
    noFiles: 'No folder opened',
    openFolder: 'Open Folder',
    addFolder: 'Add Folder',
    syncFolders: 'Sync Folders',
    syncing: 'Syncing...',
    pinFile: 'Pin file to top',
    unpinFile: 'Unpin file',
    removeFolder: 'Remove folder from workspace',
    filterLabel: 'Filter files',
    filterAll: 'All formats',
    filterMarkdownOnly: 'Markdown only (.md, .markdown)',
    filterCodeOnly: 'Source code only (.ts, .js, .py, .go, ...)',
    filterJsonOnly: 'JSON only (.json)',
    closeSidebar: 'Collapse sidebar',
    openSidebar: 'Open sidebar',
    openFolderDesc: 'Click to select a directory on your computer and display the file tree',
    scanning: 'Scanning...'
  },
  settings: {
    modalTitle: 'Appearance & Language Settings',
    languageSection: 'Display Language',
    languageVi: 'Tiếng Việt',
    languageEn: 'English',
    themePresets: 'Theme Presets',
    customColors: 'Custom Colors',
    typography: 'Typography',
    fontFamily: 'Font Family',
    fontDescription: 'Font Description',
    accentColor: 'Accent Color',
    bgColor: 'Primary Background',
    textColor: 'Primary Text',
    headingColor: 'Headings Color',
    codeTextColor: 'Inline Code Color',
    resetDefault: 'Reset to Defaults'
  },
  themes: {
    obsidianDark: 'Obsidian Dark (Default)',
    cleanLight: 'Clean Light'
  },
  fonts: {
    'apple-system': {
      name: 'Apple System (San Francisco)',
      description: 'Apple native system font, ultra-smooth and sharp'
    },
    'google-roboto': {
      name: 'Google Roboto',
      description: 'Modern Google font with comprehensive multilingual glyphs'
    },
    'google-open-sans': {
      name: 'Google Open Sans',
      description: 'Friendly, open-geometry font optimized for long reading'
    },
    'microsoft-segoe-ui': {
      name: 'Microsoft Segoe UI',
      description: 'Standard Windows UI typography, clear and consistent'
    },
    'inter': {
      name: 'Inter',
      description: 'Modern display typeface crafted for computer screens'
    }
  },
  alerts: {
    note: 'NOTE',
    tip: 'TIP',
    important: 'IMPORTANT',
    warning: 'WARNING',
    caution: 'CAUTION'
  },
  notifications: {
    missingFileTitle: 'Linked file not found',
    missingFileDesc: 'Add the parent directory containing this file to your workspace to open it automatically.',
    addFolderAction: 'Add Folder',
    syncStarted: 'Starting scan and sync of workspace folders...',
    syncSuccess: 'Workspace folders synced successfully!',
    syncError: 'An error occurred while syncing folders'
  },
  editor: {
    placeholder: 'Type Markdown content here...'
  },
  extension: {
    appName: 'Markdown Reader & Outline',
    appDesc: 'Premium Markdown reader and formatter with file tree, live TOC, and syntax highlighting',
    fileAccessPerm: 'Local file access permission:',
    permissionGranted: 'Enabled',
    permissionDenied: 'Not enabled',
    enableInSettings: 'Enable in Settings',
    modeLocal: 'Local File (Computer)',
    modeWeb: 'Web URL (TOC only)',
    guidePage: 'Guide Page',
    onboardingTitle: 'Markdown Reader',
    onboardingSubtitle: 'Cross-platform Markdown Reader & Formatter',
    onboardingReadyTitle: 'Local file access enabled successfully!',
    onboardingReadyDesc: 'You are all set! Whenever you open a .md file or drag and drop files from your computer into the browser, the extension will automatically format and load the folder tree.',
    onboardingRequireTitle: 'Action Required: Allow access to file URLs',
    onboardingRequireDesc: 'Chromium browsers (Chrome/Edge/Brave) require you to toggle "Allow access to file URLs" so the extension can read and format .md files directly from your disk.',
    onboardingOpenSettingsBtn: 'Open Settings to Grant Permission'
  }
};
