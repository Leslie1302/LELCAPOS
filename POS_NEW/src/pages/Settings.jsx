import React from 'react';
import { useSettings } from '../context/SettingsContext';
import SettingsSection from '../components/Settings/SettingsSection';
import Toast from '../components/common/Toast';

// Placeholder imports for sub-sections (will create next)
// import StoreSettings from '../components/Settings/StoreSettings';
// import ReceiptSettings from '../components/Settings/ReceiptSettings';
// ... etc

export default function Settings() {
    const { settings, updateSettings, resetSettings } = useSettings();

    // Helper to handle simple field updates for a section
    // e.g. handleUpdate('store', 'name', 'New Name')
    const handleUpdate = (section, field, value) => {
        updateSettings(section, { [field]: value });
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">⚙️ Settings</h1>
                <p className="text-gray-500 mt-2">Configure your POS system preferences and manage data.</p>
            </header>

            <div className="space-y-2">

                {/* 1. Store Information */}
                <SettingsSection
                    title="Store Information"
                    icon="🏪"
                    description="Manage store name, address, logo, and contact info."
                    defaultOpen={true}
                >
                    <StoreSettingsForm settings={settings.store} onUpdate={(u) => updateSettings('store', u)} />
                </SettingsSection>

                {/* 2. Receipt Settings */}
                <SettingsSection
                    title="Receipt Settings"
                    icon="🧾"
                    description="Configure tax rates, slogans, and receipt formatting."
                >
                    <ReceiptSettingsForm settings={settings.receipt} onUpdate={(u) => updateSettings('receipt', u)} />
                </SettingsSection>

                {/* 3. Inventory Settings */}
                <SettingsSection
                    title="Inventory Settings"
                    icon="📦"
                    description="Stock thresholds, display preferences, and management rules."
                >
                    <InventorySettingsForm settings={settings.inventory} onUpdate={(u) => updateSettings('inventory', u)} />
                </SettingsSection>

                {/* 4. QR Scanner Settings */}
                <SettingsSection
                    title="QR Scanner Settings"
                    icon="📷"
                    description="Camera preferences, scanning behavior, and automation."
                >
                    <ScannerSettingsForm settings={settings.scanner} onUpdate={(u) => updateSettings('scanner', u)} />
                </SettingsSection>

                {/* 5. Appearance */}
                <SettingsSection
                    title="Appearance"
                    icon="🎨"
                    description="Customize visual theme, colors, and accessibility."
                >
                    <AppearanceSettingsForm settings={settings.appearance} onUpdate={(u) => updateSettings('appearance', u)} />
                </SettingsSection>

                {/* 6. Notifications */}
                <SettingsSection
                    title="Notifications"
                    icon="🔔"
                    description="Manage alerts, sounds, and quiet hours."
                >
                    <NotificationSettingsForm settings={settings.notifications} onUpdate={(u) => updateSettings('notifications', u)} />
                </SettingsSection>

                {/* 7. Data Management */}
                <SettingsSection
                    title="Data Management"
                    icon="💾"
                    description="Backup, restore, export data, or clear storage."
                >
                    <DataManagementForm />
                </SettingsSection>

                {/* 8. Pexels API */}
                <SettingsSection
                    title="Pexels API"
                    icon="📊"
                    description="Configure image search integration keys and options."
                >
                    <PexelsSettingsForm settings={settings.pexels} onUpdate={(u) => updateSettings('pexels', u)} />
                </SettingsSection>

                {/* 9. About & Help */}
                <SettingsSection
                    title="About & Help"
                    icon="ℹ️"
                    description="App version, legal info, and support resources."
                >
                    <AboutSection />
                </SettingsSection>

            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// Sub-Components (Inline for now, will extract if too large)
// ------------------------------------------------------------------

function StoreSettingsForm({ settings, onUpdate }) {
    const handleChange = (e) => onUpdate({ [e.target.name]: e.target.value });

    // Logo upload would involve FileReader logic
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate({ logo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Store Name *</label>
                <input
                    name="name"
                    value={settings.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    placeholder="e.g. RetailPOS Store"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        name="phone"
                        value={settings.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="+233 XX XXX XXXX"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        name="email"
                        value={settings.email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="store@example.com"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Store Address</label>
                <div className="space-y-2 mt-1">
                    <input
                        value={settings.address.line1}
                        onChange={(e) => onUpdate({ address: { ...settings.address, line1: e.target.value } })}
                        className="block w-full border border-gray-300 rounded-md p-2"
                        placeholder="Address Line 1"
                    />
                    <input
                        value={settings.address.line2}
                        onChange={(e) => onUpdate({ address: { ...settings.address, line2: e.target.value } })}
                        className="block w-full border border-gray-300 rounded-md p-2"
                        placeholder="Address Line 2 (Optional)"
                    />
                    <input
                        value={settings.address.city}
                        onChange={(e) => onUpdate({ address: { ...settings.address, city: e.target.value } })}
                        className="block w-full border border-gray-300 rounded-md p-2"
                        placeholder="City / Town"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
                <div className="flex items-center gap-4">
                    {settings.logo && (
                        <div className="w-20 h-20 border rounded-lg overflow-hidden relative group">
                            <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
                            <button
                                onClick={() => onUpdate({ logo: null })}
                                className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                </div>
            </div>
        </div>
    );
}


function ReceiptSettingsForm({ settings, onUpdate }) {
    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        onUpdate({ [e.target.name]: val });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-md">
                <input
                    type="checkbox"
                    name="taxEnabled"
                    checked={settings.taxEnabled}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 rounded"
                />
                <label className="font-medium text-gray-700">Enable Tax Calculation</label>
            </div>

            {settings.taxEnabled && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in pl-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tax Name</label>
                        <input name="taxName" value={settings.taxName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                        <input type="number" step="0.1" name="taxRate" value={settings.taxRate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                </div>
            )}

            <hr className="border-gray-100" />

            <div>
                <label className="block text-sm font-medium text-gray-700">Receipt Slogan</label>
                <input name="slogan" value={settings.slogan} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Thank You Message</label>
                <input name="thankYou" value={settings.thankYou} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Return Policy</label>
                <textarea name="returnPolicy" value={settings.returnPolicy} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
        </div>
    );
}

function InventorySettingsForm({ settings, onUpdate }) {
    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? Number(e.target.value) : e.target.value;
        onUpdate({ [e.target.name]: val });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                    <input type="number" name="lowStockThreshold" value={settings.lowStockThreshold} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Critical Stock Level</label>
                    <input type="number" name="criticalStockLevel" value={settings.criticalStockLevel} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
            </div>

            <div className="space-y-3 mt-4">
                <label className="flex items-center gap-3">
                    <input type="checkbox" name="allowNegativeStock" checked={settings.allowNegativeStock} onChange={handleChange} className="h-4 w-4 rounded text-primary-600" />
                    <span className="text-gray-700">Allow sales when out of stock (Negative Inventory)</span>
                </label>
                <label className="flex items-center gap-3">
                    <input type="checkbox" name="showImages" checked={settings.showImages} onChange={handleChange} className="h-4 w-4 rounded text-primary-600" />
                    <span className="text-gray-700">Show item images in list</span>
                </label>
                <label className="flex items-center gap-3">
                    <input type="checkbox" name="showQRCodes" checked={settings.showQRCodes} onChange={handleChange} className="h-4 w-4 rounded text-primary-600" />
                    <span className="text-gray-700">Show QR Codes on Inventory Cards</span>
                </label>
            </div>
        </div>
    );
}

function ScannerSettingsForm({ settings, onUpdate }) {
    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        onUpdate({ [e.target.name]: val });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <label className="flex items-center gap-3">
                    <input type="checkbox" name="autoAddToCart" checked={settings.autoAddToCart} onChange={handleChange} className="h-4 w-4 rounded text-primary-600" />
                    <span className="text-gray-700"><strong>Auto-add to cart</strong> (POS)</span>
                </label>
                <label className="flex items-center gap-3">
                    <input type="checkbox" name="playSound" checked={settings.playSound} onChange={handleChange} className="h-4 w-4 rounded text-primary-600" />
                    <span className="text-gray-700">Play sound on scan success</span>
                </label>
                <label className="flex items-center gap-3">
                    <input type="checkbox" name="vibrate" checked={settings.vibrate} onChange={handleChange} className="h-4 w-4 rounded text-primary-600" />
                    <span className="text-gray-700">Vibrate on scan (Mobile)</span>
                </label>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mt-4">Preferred Camera</label>
                <select name="preferredCamera" value={settings.preferredCamera} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    <option value="back">Back Camera</option>
                    <option value="front">Front Camera</option>
                </select>
            </div>
        </div>
    );
}

function AppearanceSettingsForm({ settings, onUpdate }) {
    const handleChange = (e) => {
        onUpdate({ [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-4 opacity-70 pointer-events-none filter grayscale">
            {/* Disabled for now as we don't have dynamic theme engine yet */}
            <div className="p-2 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">
                Theme settings are Coming Soon in Phase 9.
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Theme</label>
                <select name="theme" value={settings.theme} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                </select>
            </div>
        </div>
    );
}

function NotificationSettingsForm({ settings, onUpdate }) {
    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        onUpdate({ [e.target.name]: val });
    };

    return (
        <div className="space-y-3">
            <label className="flex items-center gap-3">
                <input type="checkbox" name="lowStockAlerts" checked={settings.lowStockAlerts} onChange={handleChange} className="h-4 w-4 rounded text-primary-600" />
                <span className="text-gray-700">Low Stock Alerts</span>
            </label>
            <label className="flex items-center gap-3">
                <input type="checkbox" name="outOfStockAlerts" checked={settings.outOfStockAlerts} onChange={handleChange} className="h-4 w-4 rounded text-primary-600" />
                <span className="text-gray-700">Out of Stock Alerts</span>
            </label>
            <label className="flex items-center gap-3">
                <input type="checkbox" name="dailySummary" checked={settings.dailySummary} onChange={handleChange} className="h-4 w-4 rounded text-primary-600" />
                <span className="text-gray-700">Daily Sales Summary</span>
            </label>
        </div>
    );
}

function DataManagementForm() {
    const { settings, resetSettings } = useSettings();

    const handleExport = (type) => {
        // Mock export
        alert(`Exporting ${type}... (Not implemented yet - Requires 'file-saver')`);
    };

    const handleClearData = () => {
        const confirm = window.prompt('Type "DELETE" to confirm wiping ALL data. This cannot be undone.');
        if (confirm === 'DELETE') {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => handleExport('all')} className="btn bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200">
                    📥 Export All Data
                </button>
                <button onClick={() => handleExport('inventory')} className="btn bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200">
                    📥 Export Inventory
                </button>
                <button onClick={() => handleExport('transactions')} className="btn bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200">
                    📥 Export History
                </button>
            </div>

            <hr className="border-gray-100" />

            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h4 className="text-red-800 font-bold mb-2">Danger Zone</h4>
                <div className="flex flex-col md:flex-row gap-4">
                    <button onClick={resetSettings} className="btn bg-white border border-red-200 text-red-600 hover:bg-red-50">
                        Reset Settings Only
                    </button>
                    <button onClick={handleClearData} className="btn bg-red-600 text-white hover:bg-red-700">
                        🗑️ Clear ALL Data
                    </button>
                </div>
            </div>
        </div>
    );
}

function PexelsSettingsForm({ settings, onUpdate }) {
    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        onUpdate({ [e.target.name]: val });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Pexels API Key</label>
                <div className="flex gap-2">
                    <input
                        type="password"
                        name="apiKey"
                        value={settings.apiKey}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="Points to Pexels API"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">Required for automated product image search.</p>
            </div>
            <label className="flex items-center gap-3">
                <input type="checkbox" name="autoFetch" checked={settings.autoFetch} onChange={handleChange} className="h-4 w-4 rounded text-primary-600" />
                <span className="text-gray-700">Auto-fetch images when adding items</span>
            </label>
        </div>
    );
}

function AboutSection() {
    return (
        <div className="text-center md:text-left space-y-4">
            <div>
                <h4 className="font-bold text-gray-900">LELCA POS</h4>
                <p className="text-gray-500 text-sm">Version 1.0.0 (Production)</p>
            </div>
            <div className="flex gap-4 text-sm text-primary-600">
                <a href="#" className="hover:underline">User Guide</a>
                <a href="#" className="hover:underline">Video Tutorials</a>
                <a href="#" className="hover:underline">Contact Support</a>
            </div>
            <p className="text-xs text-gray-400">
                Built with React, Tailwind CSS. Icons by Lucide. Images by Pexels.
            </p>
        </div>
    );
}
