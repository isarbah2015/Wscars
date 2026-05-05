/**
 * Web stub for firebase-persistence (loaded on web / non-native platforms).
 * Web auth uses browser localStorage persistence automatically via getAuth().
 */
import { getAuth } from "firebase/auth";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";

export function initAuthNative(app: FirebaseApp): Auth {
  return getAuth(app);
}
