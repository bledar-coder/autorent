import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";
import { ApiClientError } from "@autorent/api-client";
import { api } from "@/lib/api";
import { colors, space, font, radius } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { toDateInput } from "@/lib/format";

function defaultDates() {
  const now = new Date();
  const start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  return { start: toDateInput(start), end: toDateInput(end) };
}

export default function BookScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const defaults = defaultDates();

  const [from, setFrom] = useState(defaults.start);
  const [to, setTo] = useState(defaults.end);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid =
    /^\d{4}-\d{2}-\d{2}$/.test(from) &&
    /^\d{4}-\d{2}-\d{2}$/.test(to) &&
    to > from &&
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    phone.trim().length >= 6;

  async function onSubmit() {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const booking = await api.createBooking({
        vehicleSlug: slug,
        startAt: new Date(`${from}T10:00:00`).toISOString(),
        endAt: new Date(`${to}T10:00:00`).toISOString(),
        customer: { name: name.trim(), email: email.trim(), phone: phone.trim() },
      });

      const init = await initPaymentSheet({
        merchantDisplayName: "AutoRent",
        paymentIntentClientSecret: booking.clientSecret,
        style: "alwaysDark",
      });
      if (init.error) {
        setError(init.error.message);
        return;
      }

      const result = await presentPaymentSheet();
      if (result.error) {
        // user cancelled or payment failed — the hold expires on its own
        if (result.error.code !== "Canceled") setError(result.error.message);
        return;
      }

      Alert.alert(t("confirmedTitle"), t("confirmedText"), [
        { text: "OK", onPress: () => router.replace("/") },
      ]);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : t("errorLoad"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label={t("pickup")}>
          <TextInput
            value={from}
            onChangeText={setFrom}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoCapitalize="none"
          />
        </Field>
        <Field label={t("return")}>
          <TextInput
            value={to}
            onChangeText={setTo}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoCapitalize="none"
          />
        </Field>
        <Field label={t("name")}>
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholderTextColor={colors.muted} />
        </Field>
        <Field label={t("email")}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.muted}
          />
        </Field>
        <Field label={t("phone")}>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
            placeholderTextColor={colors.muted}
          />
        </Field>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.payBtn, (!valid || busy) && styles.disabled]}
          onPress={onSubmit}
          disabled={!valid || busy}
        >
          {busy ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={styles.payText}>{t("payAndBook")}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: space[4] },
  field: { marginBottom: space[4] },
  label: { color: colors.muted, fontSize: font.sm, marginBottom: space[2] },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    color: colors.foreground,
    fontSize: font.base,
  },
  error: { color: colors.destructive, marginTop: space[2] },
  footer: { padding: space[4], borderTopWidth: 1, borderTopColor: colors.border },
  payBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: space[4], alignItems: "center" },
  disabled: { opacity: 0.5 },
  payText: { color: colors.primaryForeground, fontWeight: "700", fontSize: font.base },
});
