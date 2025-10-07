# KenteKart Ghana - App Store Deployment Guide

## 📱 App Information
- **App Name:** KenteKart Ghana
- **Bundle ID (iOS):** app.lovable.3b4b6ddc110049e98f644efb2ab228ea
- **Package Name (Android):** app.lovable.3b4b6ddc110049e98f644efb2ab228ea
- **Privacy Policy URL:** https://yourdomain.com/privacy
- **Support URL:** https://yourdomain.com/contact

## 🎨 Required Assets

### App Icons
You'll need app icons in these sizes:

**iOS:**
- 1024x1024px (App Store)
- 180x180px (iPhone)
- 167x167px (iPad Pro)
- 152x152px (iPad)
- 120x120px (iPhone)
- 87x87px (iPhone)
- 80x80px (iPad)
- 76x76px (iPad)
- 60x60px (iPhone)
- 58x58px (iPad)
- 40x40px (iPad)
- 29x29px (iPhone/iPad)

**Android:**
- 512x512px (Play Store)
- 192x192px (xxxhdpi)
- 144x144px (xxhdpi)
- 96x96px (xhdpi)
- 72x72px (hdpi)
- 48x48px (mdpi)

### Screenshots Required

**iOS:**
- iPhone 6.7" (1290x2796px) - Required
- iPhone 6.5" (1242x2688px) - Required
- iPad Pro 12.9" (2048x2732px) - Required if iPad support
- Minimum 3-10 screenshots per device size

**Android:**
- Phone (1080x1920px minimum)
- 7" Tablet (1200x1920px)
- 10" Tablet (1600x2560px)
- Minimum 2-8 screenshots

### Feature Graphic (Android Only)
- 1024x500px banner for Play Store listing

## 📝 App Store Metadata

### App Description (4000 character limit)
```
KenteKart Ghana - Ghana's Premier Marketplace for Swapping & Trading

Discover Ghana's most innovative platform for buying, selling, and swapping items locally. KenteKart connects Ghanaians across all regions to trade goods safely and efficiently.

✨ KEY FEATURES:
• Buy, sell, or swap items with verified local sellers
• Browse featured stores and verified distributors
• Secure messaging system for safe transactions
• Location-based search to find items near you
• Multiple categories: Electronics, Fashion, Home & Garden, Vehicles, and more
• User ratings and reviews for trusted transactions
• Easy-to-use interface designed for Ghanaians

🛡️ SAFE & SECURE:
• Verified seller badges
• User rating system
• Report inappropriate listings
• Secure in-app messaging

🌍 MADE FOR GHANA:
• Supports all Ghana regions
• Local currency (GHS)
• Optimized for Ghana's marketplace needs
• Community-driven platform

Whether you're looking to declutter your home, find great deals, or swap items you no longer need, KenteKart makes it simple and safe.

Join thousands of Ghanaians already using KenteKart to buy, sell, and swap!
```

### Short Description (80 characters - Google Play)
```
Ghana's premier marketplace for buying, selling & swapping items locally
```

### Keywords (100 characters - iOS)
```
marketplace,ghana,swap,trade,buy,sell,local,classifieds,items,deals
```

### What's New (4000 character limit)
```
Welcome to KenteKart Ghana v1.0!

This is our initial release featuring:
• Complete marketplace functionality
• Verified distributors and featured stores
• Secure messaging system
• User profiles and ratings
• Location-based search
• Multiple payment options
• Beautiful, easy-to-use interface

We're excited to serve Ghana's trading community!
```

## 🔐 iOS App Store Submission

### Prerequisites
1. **Apple Developer Account** ($99/year)
   - Sign up at: https://developer.apple.com/programs/

2. **Mac with Xcode** (latest version)

### Step-by-Step Process

1. **Initial Setup:**
   ```bash
   # After cloning your repo locally
   npm install
   npx cap add ios
   npm run build
   npx cap sync ios
   npx cap open ios
   ```

2. **In Xcode:**
   - Select your team in "Signing & Capabilities"
   - Set deployment target to iOS 13.0+
   - Configure app icons in Assets.xcassets
   - Update display name if needed

3. **App Store Connect:**
   - Create new app at https://appstoreconnect.apple.com/
   - Fill in app information
   - Upload screenshots
   - Add privacy policy URL
   - Set pricing (Free)
   - Select age rating
   - Add app description and keywords

4. **Build & Archive:**
   - In Xcode: Product → Archive
   - Upload to App Store Connect
   - Wait for processing (15-30 minutes)

5. **Submit for Review:**
   - Add build to your app version
   - Complete all required information
   - Submit for review
   - Wait 1-7 days for approval

## 🤖 Google Play Store Submission

### Prerequisites
1. **Google Play Developer Account** ($25 one-time)
   - Sign up at: https://play.google.com/console/signup

2. **Android Studio** (latest version)

### Step-by-Step Process

1. **Initial Setup:**
   ```bash
   # After cloning your repo locally
   npm install
   npx cap add android
   npm run build
   npx cap sync android
   npx cap open android
   ```

2. **Generate Signing Key:**
   ```bash
   # In your project root
   keytool -genkey -v -keystore kentekart-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias kentekart
   ```
   
   **IMPORTANT:** Save the password and key info securely!

3. **Configure Android Signing:**
   - Create `android/key.properties`:
   ```properties
   storePassword=YOUR_STORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=kentekart
   storeFile=../kentekart-release-key.jks
   ```
   
   - Update `android/app/build.gradle`:
   ```gradle
   // Add before android block
   def keystoreProperties = new Properties()
   def keystorePropertiesFile = rootProject.file('key.properties')
   if (keystorePropertiesFile.exists()) {
       keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
   }

   // In android block, add:
   signingConfigs {
       release {
           keyAlias keystoreProperties['keyAlias']
           keyPassword keystoreProperties['keyPassword']
           storeFile file(keystoreProperties['storeFile'])
           storePassword keystoreProperties['storePassword']
       }
   }

   buildTypes {
       release {
           signingConfig signingConfigs.release
           // ... other config
       }
   }
   ```

4. **Build Release AAB:**
   - In Android Studio: Build → Generate Signed Bundle/APK
   - Select "Android App Bundle"
   - Choose your signing key
   - Build Release

5. **Google Play Console:**
   - Create new app at https://play.google.com/console/
   - Complete app details
   - Upload screenshots and graphics
   - Add privacy policy URL
   - Set content rating
   - Complete pricing & distribution
   - Upload AAB file
   - Submit for review

## 📋 Pre-Submission Checklist

### Both Platforms
- [ ] App icons created in all required sizes
- [ ] Screenshots captured for all required device sizes
- [ ] Privacy policy published and URL ready
- [ ] Support/contact URL ready
- [ ] App description written and reviewed
- [ ] Content rating questionnaire completed
- [ ] Tested app thoroughly on physical devices
- [ ] All required permissions justified and documented

### iOS Specific
- [ ] Apple Developer account active
- [ ] Xcode configured with signing certificates
- [ ] App ID created in App Store Connect
- [ ] Keywords optimized (100 character limit)
- [ ] Age rating selected
- [ ] Export compliance information completed

### Android Specific
- [ ] Google Play Developer account active
- [ ] Release signing key generated and secured
- [ ] Feature graphic created (1024x500px)
- [ ] Short description written (80 characters)
- [ ] Full description written (4000 characters)
- [ ] Target age group selected
- [ ] Data safety section completed

## 🎯 Post-Submission

### Expected Timeline
- **iOS:** 1-7 days review time (typically 24-48 hours)
- **Android:** Few hours to 2-3 days (typically same day)

### Common Rejection Reasons
1. Missing privacy policy
2. Insufficient app functionality
3. Broken features or crashes
4. Misleading screenshots or descriptions
5. Missing required metadata
6. Privacy issues or data handling concerns

### After Approval
1. Monitor user reviews and ratings
2. Respond to user feedback
3. Plan regular updates
4. Track analytics and crashes
5. Gather user feedback for improvements

## 🔄 Updating Your App

When you make changes:

```bash
# Update web version
npm run build

# Sync to native platforms
npx cap sync

# Test thoroughly
npx cap run ios
npx cap run android

# Then submit new version to stores
```

## 📞 Need Help?

- **iOS Issues:** https://developer.apple.com/support/
- **Android Issues:** https://support.google.com/googleplay/android-developer/
- **Capacitor Docs:** https://capacitorjs.com/docs

---

**Note:** Update the URLs (privacy policy, support) with your actual deployed domain before submission!
