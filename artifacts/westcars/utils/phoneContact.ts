import { Alert, Linking } from "react-native";

/** Normalize Ghana numbers for tel: and WhatsApp (digits only, 233 prefix). */
export function normalizeGhanaPhoneDigits(phone?: string | null): string | null {
  if (!phone?.trim()) return null;
  let digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("0")) digits = `233${digits.slice(1)}`;
  else if (!digits.startsWith("233")) digits = `233${digits}`;
  return digits.length >= 11 ? digits : null;
}

export function openPhoneCall(phone?: string | null): void {
  const digits = normalizeGhanaPhoneDigits(phone);
  if (!digits) {
    Alert.alert("No phone number", "This seller has not added a phone number yet.");
    return;
  }
  Linking.openURL(`tel:+${digits}`).catch(() =>
    Alert.alert("Cannot open phone", "Could not open the phone dialler."),
  );
}

export function openWhatsApp(phone?: string | null, message?: string): void {
  const digits = normalizeGhanaPhoneDigits(phone);
  if (!digits) {
    Alert.alert("No phone number", "This seller has not added a WhatsApp number yet.");
    return;
  }
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  const appUrl = `whatsapp://send?phone=${digits}${text}`;
  const webUrl = `https://wa.me/${digits}${text}`;
  Linking.canOpenURL(appUrl)
    .then((ok) => (ok ? Linking.openURL(appUrl) : Linking.openURL(webUrl)))
    .catch(() => Linking.openURL(webUrl).catch(() => Alert.alert("Cannot open WhatsApp", "Install WhatsApp or try again.")));
}
