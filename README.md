# AlgoLens

AlgoLens is a Manifest V3 Chrome extension that helps developers understand
LeetCode problems by comparing algorithmic approaches, time complexity,
and space complexity.

## Features

- Detects the current LeetCode problem.
- Sends problem information to the AlgoLens backend.
- Displays AI-generated algorithmic approaches.
- Compares time and space complexity.
- Highlights recommended approaches.
- Displays cached results when available.
- Supports retries when analysis fails.

## Architecture

LeetCode Problem
    -> Chrome Extension
    -> AlgoLens Backend
    -> AI Analysis
    -> Extension UI

## Requirements

- Google Chrome or a compatible Chromium browser.
- Node.js 24.20.0 for tests and validation.
- Docker for container-based validation.
- Internet access to use the deployed backend.

## Install the Extension

1. Clone or download this repository.
2. Open chrome://extensions in Chrome.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the repository directory.
6. Open a supported LeetCode problem and use AlgoLens.

## Backend

The extension currently calls:

https://algolens-backend-qsz2.onrender.com/api/solve

## Test

Run the automated tests:

    npm test

Run JavaScript syntax checks and tests:

    npm run check

Build and run the validation container:

    docker build -t algolens-extension .
    docker run --rm algolens-extension

## Configuration

No environment variables are currently required by the extension's test setup.
The backend endpoint is configured in background.js. Do not commit API keys,
database credentials, or other secrets.

## Privacy

See [PRIVACY.md](PRIVACY.md) for privacy information.
