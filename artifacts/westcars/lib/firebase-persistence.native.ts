// @ts-nocheck
/**
 * Native-only persistence helper (loaded by Metro on Android/iOS).
 *
 * Metro resolves `firebase/auth` via the package's `react-native` conditional
 * export, which DOES include getReactNativePersistence. The TypeScript type
 * declarations omit it, so @ts-nocheck suppresses the false-positive error.
 */
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";

export function initAuthNative(app: FirebaseApp): Auth {
  return initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}
