import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Disposable Camera" }} />
      <Stack.Screen name="roll" options={{ title: "Temporary Roll" }} />
    </Stack>
  );
}
