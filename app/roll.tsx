import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { deletePhoto, getTimeRemainingLabel, listPhotos, TempPhoto } from "../lib/photoStore";

export default function RollScreen() {
  const [photos, setPhotos] = useState<TempPhoto[]>([]);
  const [message, setMessage] = useState("Loading temporary roll...");

  const refresh = useCallback(async () => {
    try {
      const nextPhotos = await listPhotos();
      setPhotos(nextPhotos);
      setMessage(nextPhotos.length ? "Photos delete automatically when expired." : "No temporary photos yet.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      setMessage(`Could not load roll: ${detail}`);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  async function handleDelete(id: string) {
    await deletePhoto(id);
    await refresh();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Temporary Roll</Text>
      <Text style={styles.subtitle}>{message}</Text>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={photos.length ? styles.list : styles.emptyList}
        ListEmptyComponent={<Text style={styles.empty}>Take a photo to test the disposable roll.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.fileUri }} style={styles.photo} resizeMode="cover" />
            <View style={styles.cardBody}>
              <Text style={styles.photoTitle}>Temporary photo</Text>
              <Text style={styles.photoMeta}>Deletes in {getTimeRemainingLabel(item.expiresAt)}</Text>
              <Pressable style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteButtonText}>Delete now</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f2e9", padding: 18 },
  title: { fontSize: 30, fontWeight: "900", color: "#1f2418", marginTop: 12 },
  subtitle: { color: "#4f5942", marginTop: 6, marginBottom: 16, fontSize: 15 },
  list: { paddingBottom: 30 },
  emptyList: { flexGrow: 1, justifyContent: "center" },
  empty: { textAlign: "center", color: "#68705b", fontSize: 16 },
  card: { flexDirection: "row", backgroundColor: "#fffaf0", borderRadius: 22, marginBottom: 14, overflow: "hidden", borderWidth: 1, borderColor: "#e1d8c8" },
  photo: { width: 112, height: 112, backgroundColor: "#ddd" },
  cardBody: { flex: 1, padding: 14 },
  photoTitle: { fontSize: 17, fontWeight: "800", color: "#1f2418" },
  photoMeta: { marginTop: 6, color: "#58614b" },
  deleteButton: { marginTop: 14, alignSelf: "flex-start", backgroundColor: "#2f3a22", borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  deleteButtonText: { color: "#fff", fontWeight: "800" },
});
