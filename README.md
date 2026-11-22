# WEALTHOS v1.0

A lightweight, mobile-friendly financial education and savings-tracking prototype.

## Features
- USD savings tracker
- Editable savings goal
- Local browser storage
- Compound-growth illustration calculator
- Investing education cards
- Responsive dark green / black interface
- Basic installable PWA manifest

## Run locally
Open `index.html` in a browser. No build tools are required.

## Deploy free using GitHub + Netlify (Android-friendly)
1. Extract this ZIP on your phone.
2. In Chrome, visit https://github.com and create a free account or sign in.
3. Create a new **public** repository named `wealthos`.
4. Choose **Add file → Upload files** and upload the contents of this folder (index.html, styles.css, app.js, manifest.webmanifest, icon.svg, README.md). Upload the files themselves, not the ZIP.
5. Commit the upload.
6. Visit https://app.netlify.com and sign up / sign in.
7. In Netlify choose **Add new site → Import an existing project → GitHub**.
8. Authorize GitHub and select your `wealthos` repository.
9. For a plain static site, leave build command empty and publish directory as `/` (or `.` if the interface requires a value). Deploy.
10. Netlify will give you a public `*.netlify.app` address. Open it on your phone and test it.

If the GitHub mobile interface hides upload options, use Chrome menu → **Desktop site**.

## Important limitations
- This prototype stores data only in the current browser on the current device. Clearing browser data can erase it.
- It does not create accounts, sync between devices, connect to banks, show live market prices, provide personalized regulated advice, or place trades.
- All balances are user-entered demo tracking values. No real money is moved.
- The compound calculator is hypothetical and excludes fees, taxes, inflation and market losses.

## Before real users / financial integrations
Add authentication, a production database with per-user access controls, server-side validation, privacy policy, terms, security review, backups and appropriate regulatory/legal advice. Never store bank passwords or brokerage credentials in this static app.
