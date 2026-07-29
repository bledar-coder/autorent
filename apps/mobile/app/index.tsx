import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { ApiVehicle } from "@autorent/api-client";
import { api } from "@/lib/api";
import { colors, space, font } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { VehicleCard } from "@/components/VehicleCard";

export default function FleetScreen() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      setVehicles(await api.listVehicles());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t("errorLoad")}</Text>
        <Pressable onPress={load} style={styles.retry}>
          <Text style={styles.retryText}>{t("retry")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <FlatList
        data={vehicles}
        keyExtractor={(v) => v.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{t("fleet")}</Text>
            <Text style={styles.subtitle}>{t("subtitle")}</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>{t("empty")}</Text>}
        renderItem={({ item }) => (
          <VehicleCard vehicle={item} onPress={() => router.push(`/vehicle/${item.slug}`)} />
        )}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.muted} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, gap: space[3] },
  list: { padding: space[4] },
  header: { marginBottom: space[4] },
  title: { color: colors.foreground, fontSize: font["3xl"], fontWeight: "700" },
  subtitle: { color: colors.muted, fontSize: font.base, marginTop: space[1] },
  empty: { color: colors.muted, textAlign: "center", marginTop: space[6] },
  errorText: { color: colors.muted },
  retry: { backgroundColor: colors.primary, paddingHorizontal: space[4], paddingVertical: space[2], borderRadius: 8 },
  retryText: { color: colors.primaryForeground, fontWeight: "600" },
});
