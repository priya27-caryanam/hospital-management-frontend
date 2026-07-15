# Assets Directory

This folder contains static assets used throughout the HMS application.

## Structure

```
assets/
  images/       — Hospital logo, banners, placeholder images
  fonts/        — Custom font files (if used)
  icons/        — Custom icon assets (SVG/PNG)
```

## Usage

Import assets directly in components:
```js
const logo = require('../assets/images/hospital_logo.png');
```

Or link fonts in android/app/src/main/assets/fonts/ and ios/HospitalManagementFrontend/Info.plist.
