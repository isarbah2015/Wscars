import { connectFunctionsEmulator, getFunctions, type Functions } from "firebase/functions";
import { app } from "@/lib/firebase";

const REGION = process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? "us-central1";

let functionsInstance: Functions | null = null;

export function getFirebaseFunctions(): Functions {
  if (!functionsInstance) {
    functionsInstance = getFunctions(app, REGION);
    if (__DEV__ && process.env.EXPO_PUBLIC_USE_FUNCTIONS_EMULATOR === "1") {
      connectFunctionsEmulator(functionsInstance, "127.0.0.1", 5001);
    }
  }
  return functionsInstance;
}
