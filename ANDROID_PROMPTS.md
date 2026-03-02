# Fix: NFC PendingIntent — Background Activity Launch Blocked

## Log
```
ActivityTaskManager  E  Background activity launch blocked!
intent: Intent { act=android.nfc.action.NDEF_DISCOVERED cmp=com.example.medilocker/.ui.UpdateCardActivity }
balAllowedByPiCreator: BSP.NONE
```

## Root Cause
The `PendingIntent` used in `enableForegroundDispatch()` inside `UpdateCardActivity` is created **without `FLAG_MUTABLE`**. On Android 14+ (targetSdk 35), this causes the NFC system to be blocked from launching the activity.

The key log clue is `balAllowedByPiCreator: BSP.NONE` — the PendingIntent creator (your app) has not opted in to allow background activity launches.

## Fix

**File:** `app/src/main/java/com/example/medilocker/ui/UpdateCardActivity.java`

Find the `onResume()` method where `enableForegroundDispatch()` is called. Change the `PendingIntent` creation to:

```java
PendingIntent pendingIntent = PendingIntent.getActivity(
    this, 0, intent,
    PendingIntent.FLAG_MUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
);
```

**Do NOT** call `ActivityOptions.setPendingIntentBackgroundActivityStartMode()` — it crashes on Android 15.

## Ignore (OEM noise, not bugs)
- `callGcSupression NullPointerException` — Oppo/ColorOS internal
- `handleResized abandoned` — normal IME resize transitions
- `OplusScrollToTopManager unregisterSystemUIBroadcastReceiver failed` — Oppo internal
