# 🚀 Lifeasy Interior - Quotation Builder Deployment Guide

## Quick Start

1. **Double-click `Deploy.bat`**
2. **Select option 2** for Firebase Hosting
3. **Follow the prompts**

## Firebase Setup (One-time)

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Your Project Details
- **Project ID**: `quotationbuilder-d79e9`
- **Hosting URL**: `https://quotationbuilder-d79e9.firebaseapp.com`
- **Console**: https://console.firebase.google.com/project/quotationbuilder-d79e9

## Deployment Options

### 🔥 Firebase Hosting (Recommended)
```bash
# Using Deploy.bat
Deploy.bat → Option 2

# Manual deployment
npm run build
firebase deploy --only hosting
```

### 🌐 Netlify
```bash
# Using Deploy.bat
Deploy.bat → Option 3

# Manual deployment
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=dist
```

### ⚡ Vercel
```bash
# Using Deploy.bat
Deploy.bat → Option 4

# Manual deployment
npm install -g vercel
vercel login
vercel --prod
```

## Build Only (No Deployment)
```bash
# Using Deploy.bat
Deploy.bat → Option 1

# Manual build
npm run build
# Files will be in 'dist' folder
```

## Configuration Files Created

✅ `firebase.json` - Firebase hosting configuration  
✅ `.firebaserc` - Firebase project settings  
✅ `firestore.rules` - Database security rules  
✅ `firestore.indexes.json` - Database indexes  
✅ `storage.rules` - Storage security rules  
✅ `src/firebase.js` - Updated with your config  

## Troubleshooting

### Firebase Login Issues
```bash
firebase logout
firebase login
```

### Build Failures
```bash
# Clean build
Deploy.bat → Option 6
```

### Permission Errors
- Run Command Prompt as Administrator
- Or use PowerShell instead of CMD

## Production URLs

After deployment, your app will be available at:
- **Firebase**: https://quotationbuilder-d79e9.firebaseapp.com
- **Custom Domain**: Configure in Firebase Console

## Security Notes

⚠️ **Important**: The current Firestore and Storage rules allow public access.  
For production, consider adding authentication:

```javascript
// firestore.rules - Example with auth
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quotations/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Support

If you encounter issues:
1. Check the Firebase Console for errors
2. Verify your project ID matches: `quotationbuilder-d79e9`
3. Ensure you're logged into the correct Google account
4. Try a clean build (Deploy.bat → Option 6)