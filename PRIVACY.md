# Privacy Policy — AlgoLens

**Last updated:** September 15, 2026

AlgoLens is a browser extension that helps users understand and compare solving approaches for LeetCode problems.

## Information the extension accesses

AlgoLens reads the current LeetCode problem's slug, title, and difficulty from the active LeetCode problem page.

It does not intentionally collect:
- Passwords
- Payment information
- Health information
- Personal communications
- Other personal account information

## How information is used

The problem information is sent securely over HTTPS to the AlgoLens backend to generate and return AI-powered approach analysis, including algorithm ideas, time and space complexity, optimality, and pseudocode.

The backend uses Google's Gemini API to generate the analysis and PostgreSQL to cache analysis results for LeetCode problems.

The extension also uses local browser storage for:
- Analysis results
- Temporary state
- Errors
- Popup size

## Data sharing

AlgoLens does not sell user data.

Problem information is shared only with services required to provide the extension's functionality:
- AlgoLens backend
- Google Gemini API
- PostgreSQL database service

## Data retention

The extension stores local state in the browser until it is cleared or the extension is removed.

The backend may retain cached problem analysis to reduce repeated AI requests.

The extension does not intentionally associate cached problem analysis with a user's personal identity.

## Security

Communication between the extension and the AlgoLens backend uses HTTPS.

Reasonable measures are used to protect data processed by the service, but no internet service can guarantee absolute security.

## Changes to this policy

This privacy policy may be updated when the extension's data practices change.

The latest version will be published in this repository.

## Contact

For privacy questions or concerns, please use the contact/support information provided on the AlgoLens GitHub repository.