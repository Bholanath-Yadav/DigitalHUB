# Android App Wrapper

This package wraps the existing Digital HUB web app in a Capacitor Android shell.

## Build web assets

From the repo root:

```bash
pnpm --dir artifacts/gaming-store build
```

## Sync Android

From this folder:

```bash
pnpm cap:sync
```

## Open in Android Studio

```bash
pnpm cap:open
```

You can then build an APK or App Bundle from Android Studio.