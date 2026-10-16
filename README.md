# AlgoLens

AlgoLens is a Chrome extension that helps developers understand LeetCode
problems by comparing algorithmic approaches, time complexity, and space
complexity.

## Features

- Automatically detects the current LeetCode problem.
- Sends problem information to the AlgoLens backend.
- Displays AI-generated algorithmic approaches.
- Compares time and space complexity.
- Highlights recommended approaches.
- Displays cached results when available.
- Provides retry support when analysis fails.

## Architecture

LeetCode Problem
    -> Chrome Extension
    -> AlgoLens Backend
    -> AI Analysis
    -> Extension UI

## Requirements

- Google Chrome or a compatible Chromium browser.
- Internet connection.
- Access to the AlgoLens backend.

## Installation

1. Clone or download this repository.
2. Open chrome://extensions in Chrome.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the algolens-extension directory.
6. Open a LeetCode problem and use the AlgoLens extension.

## Backend

The extension currently uses the following API endpoint:

https://algolens-backend-qsz2.onrender.com/api/solve

## Testing

Automated tests will be documented here once the test suite is configured.

## Privacy

See [PRIVACY.md](PRIVACY.md) for privacy information.
