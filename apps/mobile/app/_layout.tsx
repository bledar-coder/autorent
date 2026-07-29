import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StripeProvider } from "@stripe/stripe-react-native";
import { colors } from "@/lib/theme";

const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={publishableKey} merchantIdentifier="merchant.com.autorent">
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: "AutoRent" }} />
        <Stack.Screen name="vehicle/[slug]" options={{ title: "" }} />
        <Stack.Screen name="book/[slug]" options={{ title: "Booking" }} />
      </Stack>
    </StripeProvider>
  );
}
