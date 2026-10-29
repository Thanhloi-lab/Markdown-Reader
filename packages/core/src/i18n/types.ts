export type Locale = 'vi' | 'en';

export interface TranslationSchema {
  common: {
    ok: string;
    cancel: string;
    close: string;
    save: string;
    reset: string;
    search: string;
    loading: string;
    copy: string;
    copied: string;
    format: string;
    formatting: string;
    settings: string;
    language: string;
    all: string;
    default: string;
  };
  toolbar: {
    previewMode: string;
    splitMode: string;
    editorMode: string;
    formatTooltip: string;
    formatJsonTooltip: string;
    settingsTooltip: string;
    otherOptions: string;
    openFolderTooltip: string;
    formatting: string;
    format: string;
  };
  sidebar: {
    filesTab: string;
    tocTab: string;
    searchTooltip: string;
    searchPlaceholder: string;
    noHeadings: string;
    noFiles: string;
    openFolder: string;
    addFolder: string;
    syncFolders: string;
    syncing: string;
    pinFile: string;
    unpinFile: string;
    removeFolder: string;
    filterLabel: string;
    filterAll: string;
    filterMarkdownOnly: string;
    filterCodeOnly: string;
    filterJsonOnly: string;
    closeSidebar: string;
    openSidebar: string;
    openFolderDesc: string;
    scanning: string;
  };
  settings: {
    modalTitle: string;
    languageSection: string;
    languageVi: string;
    languageEn: string;
    themePresets: string;
    customColors: string;
    typography: string;
    fontFamily: string;
    fontDescription: string;
    accentColor: string;
    bgColor: string;
    textColor: string;
    headingColor: string;
    codeTextColor: string;
    resetDefault: string;
  };
  themes: {
    obsidianDark: string;
    cleanLight: string;
  };
  fonts: Record<string, { name: string; description: string }>;
  alerts: {
    note: string;
    tip: string;
    important: string;
    warning: string;
    caution: string;
  };
  notifications: {
    missingFileTitle: string;
    missingFileDesc: string;
    addFolderAction: string;
    syncStarted: string;
    syncSuccess: string;
    syncError: string;
  };
  editor: {
    placeholder: string;
  };
  extension: {
    appName: string;
    appDesc: string;
    fileAccessPerm: string;
    permissionGranted: string;
    permissionDenied: string;
    enableInSettings: string;
    modeLocal: string;
    modeWeb: string;
    guidePage: string;
    onboardingTitle: string;
    onboardingSubtitle: string;
    onboardingReadyTitle: string;
    onboardingReadyDesc: string;
    onboardingRequireTitle: string;
    onboardingRequireDesc: string;
    onboardingOpenSettingsBtn: string;
  };
}
