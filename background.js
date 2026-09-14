// AlgoLens Background Service Worker

const BACKEND_URL = "https://algolens-backend-qsz2.onrender.com/api/solve";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // POPUP → BACKGROUND: solve problem
    if (message.type === "SOLVE_PROBLEM") {
        // pehle pending set karo
        chrome.storage.local.set({
            pending: {
                slug: message.payload.slug,
                startedAt: Date.now()
            }
        });

        solveProblem(message.payload)
            .then((data) => {
                chrome.storage.local.set({
                    result: {
                        slug: message.payload.slug,
                        data: data,
                        timestamp: Date.now()
                    }
                });
                chrome.storage.local.remove("pending");
                sendResponse({ success: true, data });
            })
            .catch((err) => {
                chrome.storage.local.set({
                    error: {
                        slug: message.payload.slug,
                        message: err.message,
                        timestamp: Date.now()
                    }
                });
                chrome.storage.local.remove("pending");
                sendResponse({ success: false, error: err.message });
            });

        return true; // async
    }

    // POPUP → BACKGROUND: check current state
    if (message.type === "GET_STATE") {
        chrome.storage.local.get(["result", "error", "pending"], (state) => {
            sendResponse(state);
        });
        return true;
    }
});

async function solveProblem({ slug, title, difficulty }) {
    console.log("AlgoLens: Calling backend for", slug);

    const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title, difficulty })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Backend error ${response.status}: ${text}`);
    }

    return await response.json();
}