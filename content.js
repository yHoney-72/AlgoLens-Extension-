// AlgoLens Content Script - Runs on LeetCode problem pages

console.log("AlgoLens: Content script loaded on", window.location.href);

/**
 * Extract problem slug from URL
 * Example: https://leetcode.com/problems/two-sum/ → "two-sum"
 */
function getProblemSlug() {
    const match = window.location.pathname.match(/\/problems\/([^\/]+)/);
    return match ? match[1] : null;
}

/**
 * Extract problem title from DOM
 * LeetCode uses different selectors, we try multiple
 */
function getProblemTitle() {
    // Try multiple selectors (LeetCode changes DOM often)
    const selectors = [
        'div[class*="text-title-large"]',
        'a[class*="text-title-large"]',
        'div[class*="text-title"]',
        'h1',
        'title'
    ];

    for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.innerText && el.innerText.trim()) {
            // Clean up title (remove " - LeetCode" suffix)
            let title = el.innerText.trim();
            title = title.replace(/\s*-\s*LeetCode.*$/i, "");
            return title;
        }
    }

    // Fallback: derive from slug
    const slug = getProblemSlug();
    if (slug) {
        return slug
            .split("-")
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
    }

    return "Unknown Problem";
}

/**
 * Extract difficulty from DOM
 */
function getDifficulty() {
    const selectors = [
        'div[class*="text-difficulty"]',
        'span[class*="text-difficulty"]',
        'div[class*="difficulty"]'
    ];

    for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.innerText) {
            const text = el.innerText.trim();
            if (["Easy", "Medium", "Hard"].includes(text)) {
                return text;
            }
        }
    }

    return "Unknown";
}

/**
 * Get full problem info
 */
function getProblemInfo() {
    const slug = getProblemSlug();
    if (!slug) return null;

    return {
        slug,
        title: getProblemTitle(),
        difficulty: getDifficulty()
    };
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_PROBLEM_INFO") {
        const info = getProblemInfo();
        console.log("AlgoLens: Problem info requested →", info);
        sendResponse({ problem: info });
        return true;
    }
});

console.log("AlgoLens: Ready. Problem detected →", getProblemInfo());