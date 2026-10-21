import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Bible versions supported by the backend (bible-api.com public-domain translations).
 */
export const BIBLE_VERSIONS = [
  { code: 'kjv', name: 'King James Version', abbreviation: 'KJV' },
  { code: 'asv', name: 'American Standard Version', abbreviation: 'ASV' },
  { code: 'web', name: 'World English Bible', abbreviation: 'WEB' },
  { code: 'ylt', name: "Young's Literal Translation", abbreviation: 'YLT' },
  { code: 'oeb', name: 'Open English Bible', abbreviation: 'OEB' },
] as const;

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
] as const;

const PREF_BIBLE_VERSION = 'pref_bible_version';
const PREF_LANGUAGE = 'pref_language';

export async function getBibleVersion(): Promise<string> {
  try {
    const value = await AsyncStorage.getItem(PREF_BIBLE_VERSION);
    if (value && BIBLE_VERSIONS.some((v) => v.code === value)) {
      return value;
    }
  } catch (error) {
    console.error('Failed to read bible version pref:', error);
  }
  return 'kjv';
}

export async function setBibleVersion(code: string): Promise<void> {
  await AsyncStorage.setItem(PREF_BIBLE_VERSION, code);
}

export function bibleVersionAbbrev(code: string): string {
  return BIBLE_VERSIONS.find((v) => v.code === code)?.abbreviation ?? 'KJV';
}

export async function getLanguage(): Promise<string> {
  try {
    const value = await AsyncStorage.getItem(PREF_LANGUAGE);
    if (value && LANGUAGES.some((l) => l.code === value)) {
      return value;
    }
  } catch (error) {
    console.error('Failed to read language pref:', error);
  }
  return 'en';
}

export async function setLanguage(code: string): Promise<void> {
  await AsyncStorage.setItem(PREF_LANGUAGE, code);
}

export function languageName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name ?? 'English';
}
