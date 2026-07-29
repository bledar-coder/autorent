import { Text, View, Pressable, StyleSheet } from "react-native";
import type { ApiVehicle } from "@autorent/api-client";
import { colors, radius, space, font } from "@/lib/theme";
import { formatPrice, formatClass } from "@/lib/format";
import { t } from "@/lib/i18n";

export function VehicleCard({ vehicle, onPress }: { vehicle: ApiVehicle; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.thumb}>
        <Text style={styles.thumbText}>{formatClass(vehicle.class)}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{vehicle.name}</Text>
        <Text style={styles.meta}>
          {vehicle.year} · {vehicle.seats} {t("seats").toLowerCase()} · {vehicle.transmission}
        </Text>
        <Text style={styles.price}>
          {formatPrice(vehicle.dailyRateCents)} <Text style={styles.perDay}>{t("perDay")}</Text>
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: space[3],
  },
  pressed: { opacity: 0.85 },
  thumb: {
    height: 140,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbText: { color: colors.muted, fontSize: font.lg, fontWeight: "600" },
  body: { padding: space[4] },
  name: { color: colors.foreground, fontSize: font.lg, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: font.sm, marginTop: space[1], textTransform: "capitalize" },
  price: { color: colors.foreground, fontSize: font.xl, fontWeight: "700", marginTop: space[2] },
  perDay: { color: colors.muted, fontSize: font.sm, fontWeight: "400" },
});
