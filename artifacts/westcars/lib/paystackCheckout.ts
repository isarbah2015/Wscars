import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

/** Must match Paystack initialize callback_url and app scheme (app.json → scheme: westcars). */
export const PAYSTACK_CALLBACK_URL =
  process.env.EXPO_PUBLIC_PAYSTACK_CALLBACK_URL ?? "westcars://paystack/callback";

export function parsePaystackCallbackUrl(url: string): { reference?: string } {
  const parsed = Linking.parse(url);
  const raw =
    parsed.queryParams?.reference ??
    parsed.queryParams?.trxref ??
    parsed.queryParams?.ref;
  const reference = Array.isArray(raw) ? raw[0] : raw;
  return { reference: reference ? String(reference) : undefined };
}

export type HostedCheckoutResult =
  | { status: "success"; reference: string }
  | { status: "cancelled" }
  | { status: "dismissed" };

/**
 * Opens Paystack hosted checkout in an in-app browser session.
 * Returns when the user completes payment or closes the browser.
 */
export async function openPaystackHostedCheckout(
  authorizationUrl: string,
): Promise<HostedCheckoutResult> {
  const result = await WebBrowser.openAuthSessionAsync(
    authorizationUrl,
    PAYSTACK_CALLBACK_URL,
  );

  if (result.type === "success" && result.url) {
    const { reference } = parsePaystackCallbackUrl(result.url);
    if (reference) {
      return { status: "success", reference };
    }
  }

  if (result.type === "cancel") {
    return { status: "cancelled" };
  }

  return { status: "dismissed" };
}
