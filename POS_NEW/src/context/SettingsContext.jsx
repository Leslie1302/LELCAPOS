import React, { createContext, useContext, useState, useEffect } from 'react';

// Settings Context
const SettingsContext = createContext(undefined);

// Default settings
const DEFAULT_SETTINGS = {
    store: {
        name: "RetailPOS Store",
        address: {
            line1: "",
            line2: "",
            city: ""
        },
        phone: "",
        email: "",
        logo: null
    },

    receipt: {
        taxEnabled: true,
        taxRate: 12.5,
        taxName: "VAT",
        slogan: "Quality and Elegance in Every Piece",
        thankYou: "Thank you for your purchase!",
        returnPolicy: "Returns accepted within 7 days with receipt and original packaging",
        footerNote: "",
        numberFormat: "RCP",
        customPrefix: ""
    },

    inventory: {
        lowStockThreshold: 10,
        criticalStockLevel: 3,
        allowNegativeStock: false,
        showImages: true,
        showQRCodes: true,
        groupItems: true,
        showStockColors: true,
        defaultView: "grid",
        itemsPerPage: 20
    },

    scanner: {
        autoAddToCart: true,
        playSound: true,
        vibrate: true,
        continuousMode: false,
        preferredCamera: "back",
        scanSensitivity: 5,
        displayMode: "fullscreen"
    },

    appearance: {
        theme: "light",
        primaryColor: "#3B82F6",
        accentColor: "#10B981",
        fontSize: 16,
        language: "en",
        highContrast: false,
        reduceAnimations: false,
        largeTouchTargets: false
    },

    notifications: {
        lowStockAlerts: true,
        outOfStockAlerts: true,
        dailySummary: true,
        weeklyReports: false,
        notificationStyle: "toast",
        soundEnabled: true,
        soundVolume: 50,
        quietHoursEnabled: false,
        quietHoursFrom: "22:00",
        quietHoursTo: "08:00"
    },

    pexels: {
        apiKey: "",
        defaultQuality: "medium",
        autoFetch: true,
        showSuggestions: true,
        resultsCount: 9
    },

    // Legacy/Top-level fallbacks for backward compatibility helper
    // These getters/proxies prevent breaking existing code that accesses settings.lowStockThreshold directly
    get lowStockThreshold() { return this.inventory.lowStockThreshold; },
    get criticalStockLevel() { return this.inventory.criticalStockLevel; },
    get enableNotifications() { return this.notifications.lowStockAlerts; }, // approximate
    get pexelsApiKey() { return this.pexels.apiKey; },
    get storeName() { return this.store.name; }
};

// Load settings from localStorage
const loadSettings = () => {
    try {
        const stored = localStorage.getItem('lelca_pos_settings');
        if (stored) {
            const parsed = JSON.parse(stored);

            // Basic migration: if old structure detected (flat keys), merge into new structure
            if (parsed.lowStockThreshold !== undefined && parsed.inventory === undefined) {
                return {
                    ...DEFAULT_SETTINGS,
                    inventory: { ...DEFAULT_SETTINGS.inventory, lowStockThreshold: parsed.lowStockThreshold || 10 },
                    store: { ...DEFAULT_SETTINGS.store, name: parsed.storeName || DEFAULT_SETTINGS.store.name },
                    pexels: { ...DEFAULT_SETTINGS.pexels, apiKey: parsed.pexelsApiKey || '' },
                    // ... verify other critical migrations if needed
                };
            }

            // Deep merge to ensure new defaults exist if local storage is partial
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                store: { ...DEFAULT_SETTINGS.store, ...parsed.store },
                receipt: { ...DEFAULT_SETTINGS.receipt, ...parsed.receipt },
                inventory: { ...DEFAULT_SETTINGS.inventory, ...parsed.inventory },
                scanner: { ...DEFAULT_SETTINGS.scanner, ...parsed.scanner },
                appearance: { ...DEFAULT_SETTINGS.appearance, ...parsed.appearance },
                notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
                pexels: { ...DEFAULT_SETTINGS.pexels, ...parsed.pexels },
            };
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
    return DEFAULT_SETTINGS;
};

// Save settings to localStorage
const saveSettings = (settings) => {
    try {
        // Strip getters before saving to avoid issues
        const { lowStockThreshold, criticalStockLevel, enableNotifications, pexelsApiKey, storeName, ...savable } = settings;
        localStorage.setItem('lelca_pos_settings', JSON.stringify(savable));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
};

// Provider component
export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(loadSettings);

    // Update settings (accepts partial updates to nested objects)
    const updateSettings = (section, updates) => {
        setSettings(prev => {
            let nextSettings;
            if (typeof section === 'string' && updates) {
                // Update specific section: updateSettings('inventory', { lowStockThreshold: 5 })
                nextSettings = {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        ...updates
                    }
                };
            } else {
                // Root update (legacy support): updateSettings({ someKey: val })
                // Ideally shouldn't be used for new nested structure, but fallback:
                nextSettings = { ...prev, ...section };
            }
            saveSettings(nextSettings);
            return nextSettings;
        });
    };

    // Reset to defaults
    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        saveSettings(DEFAULT_SETTINGS);
    };

    const value = {
        settings,
        updateSettings,
        resetSettings,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

// Custom hook to use settings
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
