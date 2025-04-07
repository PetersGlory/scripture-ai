import { Linking, Platform } from 'react-native';

/**
 * Opens the app store rating page for the current platform
 * @param appId - The app ID in the store (required for iOS)
 */
export const rateApp = (appId?: string) => {
  const storeUrl = Platform.select({
    ios: `itms-apps://itunes.apple.com/app/id${appId}?action=write-review`,
    android: 'market://details?id=com.scriptureai.app',
    default: 'https://play.google.com/store/apps/details?id=com.scriptureai.app',
  });

  if (storeUrl) {
    Linking.openURL(storeUrl).catch((err) => {
      console.error('Error opening store URL:', err);
    });
  }
};

/**
 * Checks if the app has been rated before
 * @returns Promise that resolves to a boolean indicating if the app has been rated
 */
export const hasRatedApp = async (): Promise<boolean> => {
  // In a real app, you would check AsyncStorage or another persistence mechanism
  // to see if the user has rated the app before
  return false;
};

/**
 * Marks the app as rated in the user's preferences
 */
export const markAppAsRated = async (): Promise<void> => {
  // In a real app, you would save this preference to AsyncStorage or another persistence mechanism
  console.log('App marked as rated');
}; 