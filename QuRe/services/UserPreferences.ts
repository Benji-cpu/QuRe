import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const APP_FIRST_OPEN_KEY = 'qure_first_open';
const APP_LAST_OPEN_KEY = 'qure_last_open';
const APP_OPEN_COUNT_KEY = 'qure_open_count';
const OFFER_SHOWN_COUNT_KEY = 'qure_offer_shown_count';
const OFFER_SHOWN_DATES_KEY = 'qure_offer_shown_dates';
const USER_PREFERENCES_KEY = 'qure_user_preferences';

export interface UserPreferenceData {
  showSwipeIndicator: boolean;
  defaultGradient: string;
  hasCompletedOnboarding: boolean;
  preferredQRType: string;
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferenceData = {
  showSwipeIndicator: true,
  defaultGradient: 'BlueScreen',
  hasCompletedOnboarding: false,
  preferredQRType: 'link',
};

class UserPreferencesService {
  private cachedPreferences: UserPreferenceData | null = null;
  
  // Track app open
  public async trackAppOpen(): Promise<void> {
    try {
      const now = Date.now();
      
      // Check if this is first open
      const firstOpen = await AsyncStorage.getItem(APP_FIRST_OPEN_KEY);
      if (!firstOpen) {
        await AsyncStorage.setItem(APP_FIRST_OPEN_KEY, now.toString());
      }
      
      // Update last open
      await AsyncStorage.setItem(APP_LAST_OPEN_KEY, now.toString());
      
      // Increment open count
      const openCountStr = await AsyncStorage.getItem(APP_OPEN_COUNT_KEY);
      const openCount = openCountStr ? parseInt(openCountStr, 10) + 1 : 1;
      await AsyncStorage.setItem(APP_OPEN_COUNT_KEY, openCount.toString());
      
    } catch (error) {
      console.error('Failed to track app open:', error);
    }
  }
  
  // Track offer shown
  public async trackOfferShown(trigger: string): Promise<void> {
    try {
      // Increment shown count
      const shownCountStr = await AsyncStorage.getItem(OFFER_SHOWN_COUNT_KEY);
      const shownCount = shownCountStr ? parseInt(shownCountStr, 10) + 1 : 1;
      await AsyncStorage.setItem(OFFER_SHOWN_COUNT_KEY, shownCount.toString());
      
      // Track date and trigger
      const now = Date.now();
      const shownDatesStr = await AsyncStorage.getItem(OFFER_SHOWN_DATES_KEY);
      const shownDates = shownDatesStr ? JSON.parse(shownDatesStr) : [];
      
      shownDates.push({
        date: now,
        trigger
      });
      
      await AsyncStorage.setItem(OFFER_SHOWN_DATES_KEY, JSON.stringify(shownDates));
      
    } catch (error) {
      console.error('Failed to track offer shown:', error);
    }
  }
  
  // Get app open count
  public async getAppOpenCount(): Promise<number> {
    try {
      const openCountStr = await AsyncStorage.getItem(APP_OPEN_COUNT_KEY);
      return openCountStr ? parseInt(openCountStr, 10) : 0;
    } catch (error) {
      console.error('Failed to get app open count:', error);
      return 0;
    }
  }
  
  // Get offer shown count
  public async getOfferShownCount(): Promise<number> {
    try {
      const shownCountStr = await AsyncStorage.getItem(OFFER_SHOWN_COUNT_KEY);
      return shownCountStr ? parseInt(shownCountStr, 10) : 0;
    } catch (error) {
      console.error('Failed to get offer shown count:', error);
      return 0;
    }
  }
  
  // Get user preferences
  public async getUserPreferences(): Promise<UserPreferenceData> {
    // Return cached preferences if available
    if (this.cachedPreferences) {
      return this.cachedPreferences;
    }
    
    try {
      const prefsStr = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
      
      if (prefsStr) {
        // Parse stored preferences
        const storedPrefs = JSON.parse(prefsStr);
        // Merge with defaults in case stored prefs are missing properties
        this.cachedPreferences = { ...DEFAULT_PREFERENCES, ...storedPrefs };
      } else {
        // Use defaults if no preferences stored
        this.cachedPreferences = { ...DEFAULT_PREFERENCES };
      }
      
      return this.cachedPreferences;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return { ...DEFAULT_PREFERENCES };
    }
  }
  
  // Update user preferences
  public async updateUserPreferences(updates: Partial<UserPreferenceData>): Promise<void> {
    try {
      // Get current preferences
      const currentPrefs = await this.getUserPreferences();
      
      // Merge updates
      const updatedPrefs = { ...currentPrefs, ...updates };
      
      // Save updated preferences
      await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(updatedPrefs));
      
      // Update cache
      this.cachedPreferences = updatedPrefs;
    } catch (error) {
      console.error('Failed to update user preferences:', error);
    }
  }
  
  // Reset all preferences
  public async resetAllPreferences(): Promise<void> {
    try {
      this.cachedPreferences = null;
      await AsyncStorage.removeItem(USER_PREFERENCES_KEY);
    } catch (error) {
      console.error('Failed to reset user preferences:', error);
    }
  }
}

// Export singleton instance
export default new UserPreferencesService();