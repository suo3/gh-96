# App Store Asset Requirements

## Icon Specifications

### Design Guidelines for KenteKart Icon
Your app icon should:
- Feature the KenteKart branding
- Use the primary brand color (#059669)
- Include recognizable kente pattern elements
- Be simple and recognizable at small sizes
- Work well on both light and dark backgrounds
- No transparency (fill with background color)

### Icon Sizes Needed

You can generate all sizes from a single 1024x1024px source file using online tools:
- **iOS Icon Generator:** https://www.appicon.co/
- **Android Icon Generator:** https://romannurik.github.io/AndroidAssetStudio/

#### iOS Icons (place in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`)
```
Icon-1024.png         (1024x1024)
Icon-App-20x20@2x.png (40x40)
Icon-App-20x20@3x.png (60x60)
Icon-App-29x29@2x.png (58x58)
Icon-App-29x29@3x.png (87x87)
Icon-App-40x40@2x.png (80x80)
Icon-App-40x40@3x.png (120x120)
Icon-App-60x60@2x.png (120x120)
Icon-App-60x60@3x.png (180x180)
Icon-App-76x76@1x.png (76x76)
Icon-App-76x76@2x.png (152x152)
Icon-App-83.5x83.5@2x.png (167x167)
```

#### Android Icons (place in respective drawable folders)
```
android/app/src/main/res/mipmap-mdpi/ic_launcher.png      (48x48)
android/app/src/main/res/mipmap-hdpi/ic_launcher.png      (72x72)
android/app/src/main/res/mipmap-xhdpi/ic_launcher.png     (96x96)
android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png    (144x144)
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png   (192x192)
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png   (512x512) - Play Store
```

## Screenshots

### iOS Screenshot Sizes
Capture on these simulators in Xcode:
1. **iPhone 15 Pro Max** (6.7") - 1290x2796px
2. **iPhone 15 Pro** (6.1") - 1179x2556px
3. **iPhone SE** (4.7") - 750x1334px
4. **iPad Pro 12.9"** - 2048x2732px (if supporting iPad)

### Android Screenshot Sizes
Capture using Android emulators:
1. **Phone** - 1080x1920px or higher
2. **7" Tablet** - 1200x1920px
3. **10" Tablet** - 1600x2560px

### Screenshot Guidelines
Capture these key screens:
1. **Home/Browse screen** - Show featured items and categories
2. **Item detail** - Show a detailed listing
3. **Messaging** - Show the chat interface
4. **Profile/Dashboard** - Show user profile features
5. **Search/Filter** - Show category browsing

Tips:
- Use actual content (not lorem ipsum)
- Show best-case UI (clean, well-populated)
- Consider adding text overlays highlighting features
- Maintain consistent device frames
- Use tools like [Previewed](https://previewed.app/) or [Shotsnapp](https://shotsnapp.com/) for professional frames

## Feature Graphic (Android Only)

**Size:** 1024x500px

Design a banner featuring:
- KenteKart branding/logo
- Tagline: "Ghana's Premier Marketplace"
- Key visual elements (kente pattern, marketplace imagery)
- Brand colors

Tools:
- Canva (has templates)
- Figma
- Adobe Photoshop/Illustrator

## Promotional Material (Optional but Recommended)

### App Preview Videos
- **iOS:** Up to 3 videos, 15-30 seconds each
- **Android:** Up to 8 videos, 30 seconds - 2 minutes

### Promo Images
- Create variations for social media announcements
- 1200x628px for Facebook/Twitter
- 1080x1080px for Instagram

## Quick Asset Checklist

- [ ] 1024x1024px master icon design
- [ ] All iOS icon sizes generated
- [ ] All Android icon sizes generated
- [ ] 3-10 iPhone screenshots (at least 2 sizes)
- [ ] 2-8 Android phone screenshots
- [ ] 1024x500px Android feature graphic
- [ ] Privacy policy page URL
- [ ] Support/contact page URL
- [ ] App description text reviewed
- [ ] Keywords researched and optimized

## Tools & Resources

**Icon Generators:**
- https://www.appicon.co/
- https://romannurik.github.io/AndroidAssetStudio/
- https://icon.kitchen/

**Screenshot Tools:**
- https://previewed.app/
- https://shotsnapp.com/
- https://www.mockuphone.com/

**Graphic Design:**
- https://www.canva.com/
- https://www.figma.com/
- Adobe Creative Suite

**Testing:**
- Xcode Simulator (iOS)
- Android Studio Emulator (Android)

---

**Next Steps:**
1. Design your 1024x1024px master icon
2. Generate all required sizes
3. Capture screenshots from the live app
4. Create Android feature graphic
5. Review all assets against guidelines
6. Upload to respective app stores
