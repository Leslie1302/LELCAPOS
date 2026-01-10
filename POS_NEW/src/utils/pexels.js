/**
 * Pexels API Utility
 * Handles searching, fetching, and processing images from Pexels
 */

// Pexels API Base URL
const BASE_URL = 'https://api.pexels.com/v1';

/**
 * Search for images on Pexels
 * @param {string} query - Search term
 * @param {string} apiKey - Pexels API Key
 * @param {number} perPage - Number of results to return (default 9)
 * @returns {Promise<Array>} Array of image objects
 */
export const searchPexelsImages = async (query, apiKey, perPage = 9) => {
    if (!apiKey) {
        throw new Error('Pexels API Key is missing. Please configure it in Settings.');
    }

    try {
        const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=square`, {
            headers: {
                Authorization: apiKey
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Pexels API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.photos || [];
    } catch (error) {
        console.error('Pexels Search Error:', error);
        throw error;
    }
};

/**
 * Process a Pexels image URL into a base64 string for storage
 * Includes resizing to minimize storage usage
 * @param {string} imageUrl - URL of the image to fetch
 * @returns {Promise<string>} Base64 string of the processed image
 */
export const processPexelsImage = async (imageUrl) => {
    try {
        // 1. Fetch the image
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // 2. Resize and convert to base64
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 300; // Max width/height
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to base64 (JPEG with 0.7 quality)
                const base64 = canvas.toDataURL('image/jpeg', 0.7);
                resolve(base64);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(blob);
        });
    } catch (error) {
        console.error('Image Processing Error:', error);
        throw new Error('Failed to download and process image.');
    }
};

/**
 * Generate a colorful placeholder image with initials
 * @param {string} itemName - Name of the item
 * @returns {string} Base64 string of the placeholder
 */
export const generatePlaceholderImage = (itemName) => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    // Background colors
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7D794', '#778BEB'];
    const colorIndex = itemName.length % colors.length;

    // Draw background
    ctx.fillStyle = colors[colorIndex];
    ctx.fillRect(0, 0, 300, 300);

    // Draw text (Initials)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 120px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const initials = itemName
        .split(' ')
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join('');

    ctx.fillText(initials, 150, 150);

    return canvas.toDataURL('image/jpeg', 0.7);
};

/**
 * Clean up item name for better search results
 * @param {string} itemName - Raw item name
 * @returns {string} Optimized search query
 */
export const optimizeSearchQuery = (itemName) => {
    return itemName
        .replace(/\(.*?\)/g, '') // Remove parentheses content
        .replace(/\d+(ml|L|kg|g|oz)/gi, '') // Remove measurements
        .trim();
};
