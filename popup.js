// AlgoLens Popup Logic

document.addEventListener("DOMContentLoaded", () => {
    initResize();
    init();
});

const states = {
    loading: document.getElementById("state-loading"),
    noProblem: document.getElementById("state-no-problem"),
    error: document.getElementById("state-error"),
    results: document.getElementById("state-results")
};

function showState(name) {
    Object.values(states).forEach(s => s && s.classList.add("hidden"));
    if (states[name]) states[name].classList.remove("hidden");
}

let currentProblem = null;

// ============================================
// RESIZE LOGIC
// ============================================
function initResize() {
    // Saved size restore karo
    chrome.storage.local.get(["popupSize"], (data) => {
        if (data.popupSize) {
            document.body.style.width = data.popupSize.width + "px";
            document.body.style.height = data.popupSize.height + "px";
        }
    });

    const handle = document.getElementById("resize-handle");
    if (!handle) return;

    let isResizing = false;
    let startX, startY, startW, startH;

    handle.addEventListener("mousedown", (e) => {
        isResizing = true;
        startX = e.screenX;
        startY = e.screenY;
        startW = document.body.offsetWidth;
        startH = document.body.offsetHeight;
        document.body.style.userSelect = "none";
        e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
        if (!isResizing) return;
        const w = Math.max(340, Math.min(800, startW + (e.screenX - startX)));
        const h = Math.max(300, Math.min(800, startH + (e.screenY - startY)));
        document.body.style.width = w + "px";
        document.body.style.height = h + "px";
    });

    document.addEventListener("mouseup", () => {
        if (!isResizing) return;
        isResizing = false;
        document.body.style.userSelect = "";
        // Save size
        chrome.storage.local.set({
            popupSize: {
                width: document.body.offsetWidth,
                height: document.body.offsetHeight
            }
        });
    });
}

// ============================================
// INIT
// ============================================
async function init() {
    showState("loading");

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url || !tab.url.includes("leetcode.com/problems/")) {
            showState("noProblem");
            return;
        }

        const problemInfo = await sendMessageToContent(tab.id, { type: "GET_PROBLEM_INFO" });
        if (!problemInfo || !problemInfo.problem) {
            showState("noProblem");
            return;
        }

        currentProblem = problemInfo.problem;
        const state = await sendToBackground({ type: "GET_STATE" });

        if (state.result &&
            state.result.slug === currentProblem.slug &&
            Date.now() - state.result.timestamp < 120000) {
            renderResults(currentProblem, state.result.data);
            return;
        }

        sendToBackground({ type: "SOLVE_PROBLEM", payload: currentProblem });
        pollForResult(currentProblem.slug);

    } catch (err) {
        showError(err.message);
    }
}

function pollForResult(slug) {
    let attempts = 0;
    const maxAttempts = 25;
    const interval = setInterval(async () => {
        attempts++;
        const state = await sendToBackground({ type: "GET_STATE" });

        if (state.result && state.result.slug === slug) {
            clearInterval(interval);
            renderResults(currentProblem, state.result.data);
            return;
        }
        if (state.error && state.error.slug === slug) {
            clearInterval(interval);
            showError(state.error.message);
            return;
        }
        if (attempts >= maxAttempts) {
            clearInterval(interval);
            showError("Backend timed out. Please try again.");
        }
    }, 800);
}

function sendMessageToContent(tabId, message) {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) resolve(null);
            else resolve(response);
        });
    });
}

function sendToBackground(message) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) resolve({});
            else resolve(response || {});
        });
    });
}

// ============================================
// RENDER
// ============================================
function renderResults(problem, data) {
    document.getElementById("problem-title").textContent = problem.title || "Problem";

    const diffEl = document.getElementById("problem-difficulty");
    diffEl.textContent = problem.difficulty || "Unknown";
    diffEl.setAttribute("data-difficulty", problem.difficulty || "Unknown");

    const cacheBadge = document.getElementById("cache-badge");
    if (data.cached) cacheBadge.classList.remove("hidden");
    else cacheBadge.classList.add("hidden");

    const tbody = document.getElementById("approaches-tbody");
    tbody.innerHTML = "";

    (data.approaches || []).forEach((approach, index) => {
        tbody.appendChild(createApproachRow(approach, index));
    });

    showState("results");
}

function createApproachRow(approach, index) {
    const tr = document.createElement("tr");
    const isBest = index === 0;
    const rating = getRating(index, approach);

    tr.innerHTML = `
        <td class="al-td-rank ${isBest ? 'star' : ''}">
            ${isBest ? '★' : (index + 1)}
        </td>
        <td class="al-td-approach">${escapeHtml(approach.name)}</td>
        <td class="al-td-time">${escapeHtml(approach.tc || "—")}</td>
        <td class="al-td-space">${escapeHtml(approach.sc || "—")}</td>
        <td class="al-td-rating">
            <span class="al-rating ${rating.class}">${rating.label}</span>
        </td>
    `;

    tr.addEventListener("click", () => openModal(approach));
    return tr;
}

function getRating(index, approach) {
    if (index === 0) return { class: "interview", label: "INTERVIEW READY" };
    const name = (approach.name || "").toLowerCase();
    const tc = (approach.tc || "").toLowerCase();
    if (name.includes("brute") || tc.includes("n^2") || tc.includes("n²") || tc.includes("2^n")) {
        return { class: "avoid", label: "AVOID" };
    }
    return { class: "acceptable", label: "ACCEPTABLE" };
}

// ============================================
// MODAL
// ============================================
function openModal(approach) {
    const overlay = document.getElementById("modal-overlay");
    document.getElementById("modal-title").textContent = approach.name || "Approach";

    document.getElementById("modal-body").innerHTML = `
        ${approach.idea ? `
            <div class="al-modal-section">
                <div class="al-modal-section-label">IDEA</div>
                <div class="al-modal-section-content">${escapeHtml(approach.idea)}</div>
            </div>` : ''}
        ${approach.algorithm ? `
            <div class="al-modal-section">
                <div class="al-modal-section-label">ALGORITHM</div>
                <div class="al-modal-section-content">${escapeHtml(approach.algorithm)}</div>
            </div>` : ''}
        ${approach.pseudocode ? `
            <div class="al-modal-section">
                <div class="al-modal-section-label">PSEUDOCODE</div>
                <div class="al-modal-pseudocode">${escapeHtml(approach.pseudocode)}</div>
            </div>` : ''}
        <div class="al-modal-section">
            <div class="al-modal-section-label">COMPLEXITY</div>
            <div class="al-modal-complexity">
                <div class="al-modal-complexity-item">
                    <span class="al-modal-complexity-label">Time</span>
                    <span class="al-modal-complexity-value tc">${escapeHtml(approach.tc || "—")}</span>
                </div>
                <div class="al-modal-complexity-item">
                    <span class="al-modal-complexity-label">Space</span>
                    <span class="al-modal-complexity-value sc">${escapeHtml(approach.sc || "—")}</span>
                </div>
            </div>
        </div>
    `;

    overlay.classList.remove("hidden");
}

document.getElementById("modal-close").addEventListener("click", () => {
    document.getElementById("modal-overlay").classList.add("hidden");
});

document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") e.currentTarget.classList.add("hidden");
});

// ============================================
// ERROR
// ============================================
function showError(message) {
    document.getElementById("error-message").textContent = message || "Unknown error";
    showState("error");
}

document.getElementById("retry-btn").addEventListener("click", () => {
    chrome.storage.local.remove(["result", "error", "pending"]);
    init();
});

// ============================================
// UTILS
// ============================================
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}