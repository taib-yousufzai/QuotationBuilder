# Quotation Builder - React + Firebase

A modern quotation builder application built with React and Firebase, featuring all the functionality of the original PHP version.

## New Here? Start with [START_HERE.md](START_HERE.md)

## Status: All Features Working & Properly Aligned!

All buttons are functional, components are properly aligned, and Firebase integration is complete. See [FINAL_SUMMARY.md](FINAL_SUMMARY.md) for details.

## Documentation

- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Step-by-step setup guide with checklist
- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Detailed Firebase configuration
- **[PDF_EXPORT_OPTIMIZATION.md](PDF_EXPORT_OPTIMIZATION.md)** - PDF export optimization guide
- **[FEATURES.md](FEATURES.md)** - Complete feature list and comparison
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project overview
- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - All documentation files

## Features

**All Original Features Included:**
- Add/Edit/Delete quotation items
- Multiple sections with presets (Living Area, Kitchen, Bedroom, etc.)
- Client and Staff modes (password: `admin123`)
- Actual price tracking for profit calculation (Staff mode only)
- Auto-save to localStorage
- Save/Load quotations from Firebase
- Export to PDF with optimization (70-90% smaller files, 3 quality presets)
- Print functionality
- Search/filter items
- Discount, handling, and tax calculations
- Multiple themes (Light, Brand, Dark)
- Multiple currencies (₹, $, €, £)
- Copy shareable link
- Undo/Redo functionality
- Duplicate items
- Terms & conditions editor
- Responsive design

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Get your Firebase configuration
5. Update `src/firebase.js` with your config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### 3. Firestore Security Rules

Add these rules in Firebase Console > Firestore Database > Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quotations/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

## Usage

### Client Mode
- View quotations
- Add items
- Export PDF
- Print quotations

### Staff Mode
- Password: `admin123`
- All client features plus:
- View actual prices and profit margins
- Access all saved quotations
- Delete quotations
- Load and edit existing quotations

## Project Structure

```
src/
├── components/
│   ├── Header.jsx          # Top header with settings
│   ├── ClientDetails.jsx   # Client information form
│   ├── ItemForm.jsx         # Add item form with presets
│   ├── Totals.jsx           # Calculations display
│   ├── Actions.jsx          # Action buttons
│   └── QuotePreview.jsx     # Quotation preview table
├── pages/
│   ├── QuotationBuilder.jsx # Main builder page
│   ├── QuotationList.jsx    # List all quotations
│   └── ViewQuotation.jsx    # View single quotation
├── data/
│   └── presets.js           # Item presets by section
├── utils/
│   └── pdfExport.js         # PDF export functionality
├── firebase.js              # Firebase configuration
├── App.jsx                  # Main app component
├── main.jsx                 # Entry point
└── index.css                # Global styles
```

## Key Differences from PHP Version

1. **Backend**: Firebase Firestore instead of PHP + JSON files
2. **Real-time**: Data syncs across devices
3. **Hosting**: Can be deployed to Firebase Hosting, Vercel, Netlify
4. **No Server Required**: Fully client-side with Firebase backend
5. **Modern Stack**: React hooks, React Router, ES6+

## Deployment

### Firebase Hosting

```bash
npm run build
firebase init hosting
firebase deploy
```

### Vercel

```bash
npm run build
vercel deploy
```

### Netlify

```bash
npm run build
netlify deploy --prod
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License - Feel free to use for personal or commercial projects.
