# Disposable Camera

Camera-only Expo MVP for temporary photos.

## Current MVP

- Take a photo inside the app.
- Save it to app-private storage.
- Show it in Temporary Roll.
- Delete expired photos when the roll loads.
- Use a 30-second expiration for testing.

## Run locally

```powershell
npm install --legacy-peer-deps
npx expo start -c
```

Open with Expo Go on Android.

## First test

1. Open the app in Expo Go.
2. Grant camera access.
3. Take a photo.
4. Open Temporary Roll and confirm the photo appears.
5. Check the normal phone gallery and confirm the photo is not there.
6. Wait 30 seconds.
7. Reopen Temporary Roll and confirm the photo deletes.

## Notes

This is intentionally not using screenshots, URL capture, accounts, cloud sync, OCR, or gallery export yet.
