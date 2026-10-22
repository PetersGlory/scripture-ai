import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Offline Bible cache.
 *
 * Chapter text from bible-api.com is public-domain and immutable, so cached
 * chapters never need invalidation. Keys are namespaced with a CACHE_SCHEMA
 * version so a future format change can simply bump the prefix and start fresh.
 */

const CACHE_SCHEMA = 'v1';
const CHAPTER_PREFIX = `bible:${CACHE_SCHEMA}:chapter`;
const BOOKS_KEY = `bible:${CACHE_SCHEMA}:books`;

export type CachedVerse = {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
};

export type BibleBook = {
  name: string;
  abbr: string;
  chapters: number;
};

export type BibleBooks = {
  oldTestament: BibleBook[];
  newTestament: BibleBook[];
};

/** Mirror of the backend's chapter-count table, for offline reference validation. */
export const BOOK_CHAPTERS: Record<string, number> = {
  genesis: 50, exodus: 40, leviticus: 27, numbers: 36, deuteronomy: 34,
  joshua: 24, judges: 21, ruth: 4, '1 samuel': 31, '2 samuel': 24,
  '1 kings': 22, '2 kings': 25, '1 chronicles': 29, '2 chronicles': 36,
  ezra: 10, nehemiah: 13, esther: 10, job: 42, psalms: 150, psalm: 150,
  proverbs: 31, ecclesiastes: 12, 'song of solomon': 8, 'song of songs': 8,
  'songs of songs': 8, isaiah: 66, jeremiah: 52, lamentations: 5, ezekiel: 48,
  daniel: 12, hosea: 14, joel: 3, amos: 9, obadiah: 1, jonah: 4, micah: 7,
  nahum: 3, habakkuk: 3, zephaniah: 3, haggai: 2, zechariah: 14, malachi: 4,
  matthew: 28, mark: 16, luke: 24, john: 21, acts: 28, romans: 16,
  '1 corinthians': 16, '2 corinthians': 13, galatians: 6, ephesians: 6,
  philippians: 4, colossians: 4, '1 thessalonians': 5, '2 thessalonians': 3,
  '1 timothy': 6, '2 timothy': 4, titus: 3, philemon: 1, hebrews: 13,
  james: 5, '1 peter': 5, '2 peter': 3, '1 john': 5, '2 john': 1, '3 john': 1,
  jude: 1, revelation: 22,
};

/** Normalize a book name/abbr to a lowercase key with no spaces or punctuation. */
function normalizeBookKey(book: string): string {
  return book.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Build a reverse lookup from normalized keys → chapter count. */
const NORMALIZED_CHAPTERS: Record<string, number> = Object.entries(
  BOOK_CHAPTERS
).reduce((acc, [name, count]) => {
  acc[normalizeBookKey(name)] = count;
  return acc;
}, {} as Record<string, number>);

/** Get the chapter count for a book offline, or null if unknown. */
export function getBookChapterCountOffline(book: string): number | null {
  return NORMALIZED_CHAPTERS[normalizeBookKey(book)] ?? null;
}

function chapterKey(book: string, chapter: number, version: string): string {
  return `${CHAPTER_PREFIX}:${version}:${normalizeBookKey(book)}:${chapter}`;
}

/** Read a cached chapter. Returns the verse list, or null on miss/error. */
export async function getCachedChapter(
  book: string,
  chapter: number,
  version: string
): Promise<CachedVerse[] | null> {
  try {
    const raw = await AsyncStorage.getItem(chapterKey(book, chapter, version));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch (error) {
    console.error('Error reading cached chapter:', error);
    return null;
  }
}

/** Write a chapter to the cache. Fire-and-forget safe (never throws to caller). */
export async function cacheChapter(
  book: string,
  chapter: number,
  version: string,
  verses: CachedVerse[]
): Promise<void> {
  try {
    if (!Array.isArray(verses) || verses.length === 0) return;
    await AsyncStorage.setItem(
      chapterKey(book, chapter, version),
      JSON.stringify(verses)
    );
  } catch (error) {
    console.error('Error caching chapter:', error);
  }
}

/** Read the cached 66-book list (snapshot of GET /bible/books). */
export async function getCachedBooks(): Promise<BibleBooks | null> {
  try {
    const raw = await AsyncStorage.getItem(BOOKS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.oldTestament) &&
      Array.isArray(parsed.newTestament) &&
      parsed.oldTestament.length > 0
    ) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('Error reading cached books:', error);
    return null;
  }
}

/** Snapshot the book list after a successful fetch. Fire-and-forget safe. */
export async function cacheBooks(books: BibleBooks): Promise<void> {
  try {
    if (!books || !Array.isArray(books.oldTestament)) return;
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  } catch (error) {
    console.error('Error caching books:', error);
  }
}

export type DownloadStatus = {
  downloaded: number;
  total: number;
  complete: boolean;
};

/** Check how many chapters of a book are cached for a version. */
export async function getBookDownloadStatus(
  book: string,
  chapterCount: number,
  version: string
): Promise<DownloadStatus> {
  if (!book || !Number.isInteger(chapterCount) || chapterCount < 1) {
    return { downloaded: 0, total: 0, complete: false };
  }
  try {
    const keys = Array.from({ length: chapterCount }, (_, i) =>
      chapterKey(book, i + 1, version)
    );
    const pairs = await AsyncStorage.multiGet(keys);
    const downloaded = pairs.filter(([, value]) => value !== null).length;
    return { downloaded, total: chapterCount, complete: downloaded === chapterCount };
  } catch (error) {
    console.error('Error checking download status:', error);
    return { downloaded: 0, total: chapterCount, complete: false };
  }
}

/** Regex for a single-chapter reference: "John 3", "John 3:16", "John 3:16-18". */
const SINGLE_REF_REGEX = /^\s*(.+?)\s+(\d{1,3})(?::(\d{1,3})(?:-(\d{1,3}))?)?\s*$/;

export type CachedPassage = {
  reference: string;
  verses: CachedVerse[];
};

/**
 * Resolve a single-chapter reference entirely from cache (offline search).
 * Returns null for multi-chapter spans or cache misses.
 */
export async function getCachedPassage(
  reference: string,
  version: string
): Promise<CachedPassage | null> {
  const match = SINGLE_REF_REGEX.exec(reference);
  if (!match) return null;
  const book = match[1].trim();
  const chapter = parseInt(match[2], 10);
  const startVerse = match[3] ? parseInt(match[3], 10) : undefined;
  const endVerse = match[4] ? parseInt(match[4], 10) : startVerse;

  const chapterVerses = await getCachedChapter(book, chapter, version);
  if (!chapterVerses) return null;

  let verses = chapterVerses;
  if (startVerse) {
    verses = chapterVerses.filter(
      (v) => v.verse >= startVerse! && v.verse <= endVerse!
    );
    if (verses.length === 0) return null;
  }

  const versePart = startVerse
    ? `:${startVerse}${endVerse && endVerse !== startVerse ? `-${endVerse}` : ''}`
    : '';
  return { reference: `${book} ${chapter}${versePart}`, verses };
}

/** Parse a single-chapter reference into { book, chapter, verse?, endVerse? }, or null. */
export function parseSingleReference(
  reference: string
): { book: string; chapter: number; verse?: number; endVerse?: number } | null {
  const match = SINGLE_REF_REGEX.exec(reference);
  if (!match) return null;
  return {
    book: match[1].trim(),
    chapter: parseInt(match[2], 10),
    verse: match[3] ? parseInt(match[3], 10) : undefined,
    endVerse: match[4] ? parseInt(match[4], 10) : undefined,
  };
}
