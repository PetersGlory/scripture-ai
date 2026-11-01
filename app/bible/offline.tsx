// app/bible/offline.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import AppText from '@/components/ui/AppText';
import ScreenHeader from '@/components/ui/ScreenHeader';
import CustomAlert from '@/components/CustomAlert';
import { PRIMARY_COLOR } from '@/constants/Colors';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getBibleChapter, getBibleBooks } from '@/services/api';
import {
  BIBLE_VERSIONS,
  bibleVersionAbbrev,
  getBibleVersion,
} from '@/services/preferences';
import {
  cacheChapter,
  clearAllDownloads,
  clearBookDownload,
  getCachedBooks,
  getCachedChapter,
  getDownloadSummary,
  normalizeBookKey,
  type BibleBook,
} from '@/services/bibleCache';

type Book = BibleBook & { testament: 'old' | 'new' };

type DownloadingState = {
  bookKey: string;
  current: number;
  total: number;
};

export default function OfflineScreen() {
  const isOnline = useNetworkStatus();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [version, setVersion] = useState('kjv');
  const [summary, setSummary] = useState<Record<string, number[]>>({});
  const [downloading, setDownloading] = useState<DownloadingState | null>(null);
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
    onConfirm?: () => void;
    confirmText?: string;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });
  const downloadCancelRef = useRef(false);

  useEffect(() => {
    (async () => {
      const preferred = await getBibleVersion();
      setVersion(preferred);
      await loadBooks(preferred);
    })();
  }, []);

  const loadBooks = async (preferredVersion?: string) => {
    setLoading(true);
    setLoadError(false);
    try {
      let data: { oldTestament: BibleBook[]; newTestament: BibleBook[] } | null =
        await getCachedBooks();
      if (!data) {
        const fetched = await getBibleBooks();
        data = fetched.books ?? null;
      }
      if (!data) throw new Error('No book list available');
      const flat: Book[] = [
        ...(data.oldTestament || []).map((b) => ({ ...b, testament: 'old' as const })),
        ...(data.newTestament || []).map((b) => ({ ...b, testament: 'new' as const })),
      ];
      setBooks(flat);
      const currentVersion = preferredVersion ?? version;
      setSummary(await getDownloadSummary(currentVersion));
    } catch (error) {
      console.error('Error loading offline downloads:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const switchVersion = async (code: string) => {
    if (downloading || code === version) return;
    setVersion(code);
    setSummary(await getDownloadSummary(code));
  };

  /** Chapters cached under either the abbr key or the full-name key. */
  const downloadedChapters = (book: Book): Set<number> => {
    const set = new Set<number>();
    const add = (key: string) => summary[key]?.forEach((c) => set.add(c));
    add(normalizeBookKey(book.abbr));
    const nameKey = normalizeBookKey(book.name);
    if (nameKey !== normalizeBookKey(book.abbr)) add(nameKey);
    return set;
  };

  const handleDownload = async (book: Book) => {
    if (downloading || !isOnline) return;
    const bookKey = book.abbr || book.name;
    downloadCancelRef.current = false;
    setDownloading({ bookKey, current: 0, total: book.chapters });
    try {
      for (let i = 1; i <= book.chapters; i++) {
        if (downloadCancelRef.current) {
          setDownloading(null);
          return;
        }
        const existing =
          (await getCachedChapter(bookKey, i, version)) ??
          (await getCachedChapter(book.name, i, version));
        if (!existing) {
          const data = await getBibleChapter(bookKey, i, version);
          await cacheChapter(bookKey, i, version, data.chapter.verses);
        }
        setDownloading({ bookKey, current: i, total: book.chapters });
      }
      setSummary(await getDownloadSummary(version));
    } catch (error) {
      console.error('Error downloading book:', error);
      setAlert({
        visible: true,
        title: 'Download paused',
        message:
          'Connection lost. Chapters already downloaded remain available offline.',
        type: 'warning',
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleCancelDownload = () => {
    downloadCancelRef.current = true;
  };

  const handleDeleteBook = (book: Book) => {
    setAlert({
      visible: true,
      title: 'Remove download?',
      message: `All downloaded chapters of ${book.name} (${bibleVersionAbbrev(
        version
      )}) will be removed from this device.`,
      type: 'warning',
      confirmText: 'Remove',
      onConfirm: () => {
        setAlert((a) => ({ ...a, visible: false }));
        performDeleteBook(book);
      },
    });
  };

  const performDeleteBook = async (book: Book) => {
    try {
      await clearBookDownload(book.abbr, book.chapters, version);
      if (normalizeBookKey(book.name) !== normalizeBookKey(book.abbr)) {
        await clearBookDownload(book.name, book.chapters, version);
      }
      setSummary(await getDownloadSummary(version));
      setAlert({
        visible: true,
        title: 'Removed',
        message: `${book.name} download removed.`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error removing download:', error);
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to remove the download. Please try again.',
        type: 'error',
      });
    }
  };

  const handleClearAll = () => {
    setAlert({
      visible: true,
      title: 'Remove all downloads?',
      message: `Every offline ${bibleVersionAbbrev(
        version
      )} chapter on this device will be removed. Bookmarks and highlights are not affected.`,
      type: 'warning',
      confirmText: 'Remove all',
      onConfirm: () => {
        setAlert((a) => ({ ...a, visible: false }));
        performClearAll();
      },
    });
  };

  const performClearAll = async () => {
    try {
      const removed = await clearAllDownloads(version);
      setSummary(await getDownloadSummary(version));
      setAlert({
        visible: true,
        title: removed > 0 ? 'Downloads removed' : 'Nothing to remove',
        message:
          removed > 0
            ? `Removed ${removed} cached chapter${removed === 1 ? '' : 's'}.`
            : `No ${bibleVersionAbbrev(version)} chapters were cached on this device.`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error clearing downloads:', error);
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to clear downloads. Please try again.',
        type: 'error',
      });
    }
  };

  const openBook = (book: Book) => {
    router.push({
      pathname: '/bible/book',
      params: {
        book: book.name,
        bookName: book.name,
        bookAbbr: book.abbr,
        chapter: '1',
        chapters: book.chapters,
        testament: book.testament,
      },
    });
  };

  const renderBookRow = (book: Book) => {
    const downloaded = downloadedChapters(book);
    const count = downloaded.size;
    const total = book.chapters;
    const complete = count >= total;
    const partial = count > 0 && !complete;
    const isDownloading = downloading?.bookKey === normalizeBookKey(book.abbr);

    let statusText = 'Not downloaded';
    let statusColor = '#9CA3AF';
    let statusIcon: any = 'cloud-outline';
    if (complete) {
      statusText = `Downloaded · ${total}/${total} chapters`;
      statusColor = '#059669';
      statusIcon = 'checkmark-circle';
    } else if (isDownloading) {
      statusText = `Downloading ${downloading!.current}/${downloading!.total}…`;
      statusColor = PRIMARY_COLOR;
      statusIcon = 'cloud-download';
    } else if (partial) {
      statusText = `Partial · ${count}/${total} chapters`;
      statusColor = '#B45309';
      statusIcon = 'cloud-download-outline';
    }

    return (
      <View
        key={`${book.abbr}-${book.name}`}
        style={tw`bg-white rounded-2xl p-4 mb-3 border border-gray-200`}
      >
        <TouchableOpacity
          style={tw`flex-row items-center justify-between`}
          onPress={() => openBook(book)}
          activeOpacity={0.7}
          disabled={isDownloading}
        >
          <View style={tw`flex-1 mr-3`}>
            <AppText style={tw`text-gray-900 text-base mb-1`} weight="bold">
              {book.name}
            </AppText>
            <View style={tw`flex-row items-center`}>
              <Ionicons name={statusIcon} size={14} color={statusColor} />
              <AppText style={[tw`text-xs ml-1`, { color: statusColor }]}>
                {statusText}
              </AppText>
            </View>
          </View>
          {!isDownloading && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
        </TouchableOpacity>

        {isDownloading && (
          <View style={tw`mt-3 flex-row items-center`}>
            <View
              style={tw`flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mr-3`}
            >
              <View
                style={[
                  tw`h-2 rounded-full`,
                  {
                    backgroundColor: PRIMARY_COLOR,
                    width: `${Math.round(
                      ((downloading?.current || 0) / (downloading?.total || 1)) * 100
                    )}%`,
                  },
                ]}
              />
            </View>
            <TouchableOpacity onPress={handleCancelDownload} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <AppText style={tw`text-gray-500 text-xs`} weight="bold">
                Cancel
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        {!isDownloading && (
          <View style={tw`mt-3 flex-row items-center`}>
            {!complete && (
              <TouchableOpacity
                style={[
                  tw`flex-row items-center justify-center px-4 py-2 rounded-xl mr-2`,
                  { backgroundColor: isOnline ? `${PRIMARY_COLOR}15` : '#F3F4F6' },
                ]}
                onPress={() => handleDownload(book)}
                disabled={!isOnline}
                accessibilityRole="button"
                accessibilityLabel={`Download ${book.name}`}
              >
                <Ionicons
                  name="cloud-download-outline"
                  size={16}
                  color={isOnline ? PRIMARY_COLOR : '#9CA3AF'}
                />
                <AppText
                  style={[
                    tw`text-xs ml-1 font-semibold`,
                    { color: isOnline ? PRIMARY_COLOR : '#9CA3AF' },
                  ]}
                >
                  {partial ? 'Finish' : 'Download'}
                </AppText>
              </TouchableOpacity>
            )}
            {count > 0 && (
              <TouchableOpacity
                style={tw`flex-row items-center justify-center px-4 py-2 rounded-xl bg-red-50`}
                onPress={() => handleDeleteBook(book)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${book.name} download`}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <AppText style={tw`text-xs ml-1 font-semibold text-red-500`}>
                  Remove
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-50`}>
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ ...alert, visible: false })}
          onConfirm={alert.onConfirm}
          confirmText={alert.confirmText}
        />
      </SafeAreaView>
    );
  }

  if (loadError || books.length === 0) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-50`}>
        <ScreenHeader title="Offline Downloads" />
        <View style={tw`flex-1 items-center justify-center px-8`}>
          <Ionicons name="cloud-offline-outline" size={48} color="#9CA3AF" />
          <AppText
            style={tw`text-lg text-gray-900 font-semibold mt-4 mb-2 text-center`}
            weight="bold"
          >
            Couldn't load the book list
          </AppText>
          <AppText style={tw`text-sm text-gray-500 text-center mb-6`}>
            Connect to the internet once to load the Bible library, then offline
            downloads work without a connection.
          </AppText>
          <TouchableOpacity
            onPress={() => loadBooks()}
            style={tw`bg-[${PRIMARY_COLOR}] px-8 py-3 rounded-full`}
            accessibilityRole="button"
          >
            <AppText style={tw`text-white font-semibold`}>Retry</AppText>
          </TouchableOpacity>
        </View>
        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ ...alert, visible: false })}
          onConfirm={alert.onConfirm}
          confirmText={alert.confirmText}
        />
      </SafeAreaView>
    );
  }

  const totalChapters = books.reduce(
    (sum, b) => sum + downloadedChapters(b).size,
    0
  );
  const downloadedBooks = books.filter((b) => downloadedChapters(b).size > 0)
    .length;
  const oldTestament = books.filter((b) => b.testament === 'old');
  const newTestament = books.filter((b) => b.testament === 'new');

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <ScreenHeader
        title="Offline Downloads"
        subtitle={`${downloadedBooks} of ${books.length} books · ${totalChapters} chapters saved`}
      />

      {!isOnline && (
        <View style={tw`bg-amber-50 px-6 py-2 border-b border-amber-200`}>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="cloud-offline-outline" size={16} color="#B45309" />
            <AppText style={tw`text-amber-800 text-xs ml-2 flex-1`}>
              You're offline — managing downloads will resume when you reconnect.
            </AppText>
          </View>
        </View>
      )}

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`px-6 py-6`}
        showsVerticalScrollIndicator={false}
      >
        {/* Translation selector — downloads are stored per translation */}
        <View style={tw`mb-4`}>
          <AppText style={tw`text-gray-900 text-sm mb-2`} weight="bold">
            Translation
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`flex-row`}>
              {BIBLE_VERSIONS.map((v) => {
                const active = v.code === version;
                return (
                  <TouchableOpacity
                    key={v.code}
                    style={tw`px-4 py-2 rounded-full mr-2 ${
                      active ? `bg-[${PRIMARY_COLOR}]` : 'bg-white border border-gray-200'
                    }`}
                    onPress={() => switchVersion(v.code)}
                    disabled={!!downloading}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <AppText
                      style={tw`${active ? 'text-white' : 'text-gray-600'} text-sm`}
                      weight={active ? 'bold' : 'regular'}
                    >
                      {v.abbreviation}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Summary card */}
        <View style={tw`bg-white rounded-2xl p-4 border border-gray-200 mb-5`}>
          <View style={tw`flex-row items-center mb-2`}>
            <View
              style={tw`w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mr-3`}
            >
              <Ionicons name="cloud-done-outline" size={20} color="#059669" />
            </View>
            <View style={tw`flex-1`}>
              <AppText style={tw`text-gray-900 text-sm`} weight="bold">
                {totalChapters} chapter{totalChapters === 1 ? '' : 's'} available
                offline
              </AppText>
              <AppText style={tw`text-gray-600 text-xs`}>
                {bibleVersionAbbrev(version)} · read anywhere without internet
              </AppText>
            </View>
            {totalChapters > 0 && (
              <TouchableOpacity
                onPress={handleClearAll}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Remove all downloads"
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
          <AppText style={tw`text-gray-500 text-xs`}>
            Tap a book to read it. Chapters you open are also cached
            automatically while reading.
          </AppText>
        </View>

        <AppText style={tw`text-gray-900 text-base mb-3`} weight="bold">
          Old Testament
        </AppText>
        {oldTestament.map(renderBookRow)}

        <AppText
          style={tw`text-gray-900 text-base mb-3 mt-2`}
          weight="bold"
        >
          New Testament
        </AppText>
        {newTestament.map(renderBookRow)}
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
        onConfirm={alert.onConfirm}
        confirmText={alert.confirmText}
      />
    </SafeAreaView>
  );
}
