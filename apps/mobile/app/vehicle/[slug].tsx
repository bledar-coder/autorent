import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import type { ApiVehicleDetail } from "@autorent/api-client";
import { api } from "@/lib/api";
import { colors, space, font, radius } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { formatPrice, formatClass, titleCase } from "@/lib/format";

export default function VehicleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [vehicle, setVehicle] = useState<ApiVehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .getVehicle(slug)
      .then((v) => {
        if (!active) return;
        setVehicle(v);
        navigation.setOptions({ title: v.name });
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug, navigation]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!vehicle) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{t("errorLoad")}</Text>
      </View>
    );
  }

  const specs: [string, string | number][] = [
    [t("seats"), vehicle.seats],
    [t("doors"), vehicle.doors],
    [t("transmission"), titleCase(vehicle.transmission)],
    [t("fuel"), titleCase(vehicle.fuelType)],
    [t("year"), vehicle.year],
  ];
  const avg =
    vehicle.reviews.length > 0
      ? (vehicle.reviews.reduce((s, r) => s + r.rating, 0) / vehicle.reviews.length).toFixed(1)
      : null;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroText}>{formatClass(vehicle.class)}</Text>
        </View>

        <Text style={styles.name}>{vehicle.name}</Text>
        <Text style={styles.meta}>
          {vehicle.year} · {formatClass(vehicle.class)}
          {avg ? ` · ★ ${avg}` : ""}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(vehicle.dailyRateCents)}</Text>
          <Text style={styles.perDay}>{t("perDay")}</Text>
        </View>
        <Text style={styles.tiers}>
          {formatPrice(vehicle.weeklyRateCents)} / week · {formatPrice(vehicle.monthlyRateCents)} / month
        </Text>

        <View style={styles.specGrid}>
          {specs.map(([label, value]) => (
            <View key={label} style={styles.specCard}>
              <Text style={styles.specLabel}>{label}</Text>
              <Text style={styles.specValue}>{value}</Text>
            </View>
          ))}
        </View>

        {vehicle.description ? <Text style={styles.description}>{vehicle.description}</Text> : null}

        {vehicle.features.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("features")}</Text>
            <View style={styles.chips}>
              {vehicle.features.map((f) => (
                <Text key={f} style={styles.chip}>
                  {f}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("reviews")}</Text>
          {vehicle.reviews.length === 0 ? (
            <Text style={styles.muted}>{t("noReviews")}</Text>
          ) : (
            vehicle.reviews.map((r) => (
              <View key={r.id} style={styles.review}>
                <Text style={styles.stars}>{"★".repeat(r.rating)}</Text>
                <Text style={styles.reviewName}>{r.user.name}</Text>
                {r.comment ? <Text style={styles.muted}>{r.comment}</Text> : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.bookBtn} onPress={() => router.push(`/book/${vehicle.slug}`)}>
          <Text style={styles.bookText}>
            {t("bookNow")} — {formatPrice(vehicle.dailyRateCents)}
            {t("perDay")}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  content: { padding: space[4], paddingBottom: space[8] },
  hero: {
    height: 180,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space[4],
  },
  heroText: { color: colors.muted, fontSize: font.xl, fontWeight: "600" },
  name: { color: colors.foreground, fontSize: font["2xl"], fontWeight: "700" },
  meta: { color: colors.muted, marginTop: space[1], textTransform: "capitalize" },
  priceRow: { flexDirection: "row", alignItems: "flex-end", marginTop: space[4], gap: space[1] },
  price: { color: colors.foreground, fontSize: font["3xl"], fontWeight: "700" },
  perDay: { color: colors.muted, fontSize: font.base, marginBottom: space[1] },
  tiers: { color: colors.muted, fontSize: font.sm, marginTop: space[1] },
  specGrid: { flexDirection: "row", flexWrap: "wrap", gap: space[2], marginTop: space[4] },
  specCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: space[3],
    minWidth: 90,
  },
  specLabel: { color: colors.muted, fontSize: font.xs },
  specValue: { color: colors.foreground, fontSize: font.base, fontWeight: "600", marginTop: 2, textTransform: "capitalize" },
  description: { color: colors.foreground, marginTop: space[5], lineHeight: 22 },
  section: { marginTop: space[5] },
  sectionTitle: { color: colors.foreground, fontSize: font.lg, fontWeight: "600", marginBottom: space[2] },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
  chip: {
    color: colors.muted,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    fontSize: font.sm,
  },
  review: { backgroundColor: colors.surface, borderRadius: radius.md, padding: space[3], marginBottom: space[2] },
  stars: { color: colors.warning },
  reviewName: { color: colors.foreground, fontWeight: "600", marginTop: 2 },
  muted: { color: colors.muted },
  footer: { padding: space[4], borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
  bookBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: space[4], alignItems: "center" },
  bookText: { color: colors.primaryForeground, fontWeight: "700", fontSize: font.base },
});
