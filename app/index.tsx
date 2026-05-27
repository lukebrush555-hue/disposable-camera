import { CameraView, useCameraPermissions } from "expo-camera";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { saveTempPhoto } from "../lib/photoStore";

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("Deletes in 30 seconds for testing");

  async function takePhoto() {
    if (!cameraRef.current || isSaving) return;

    try {
      setIsSaving(true);
      setMessage("Saving...");
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });

      if (!photo?.uri) {
        throw new Error("No photo URI returned by camera.");
      }

      await saveTempPhoto(photo.uri);
      setMessage("Saved. Deletes in 30 seconds.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      setMessage(`Save failed: ${detail}`);
    } finally {
      setIsSaving(false);
    }
  }

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.body}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Camera permission needed</Text>
        <Text style={styles.body}>Disposable Camera needs camera access to take temporary photos.</Text>
        <Pressable style={styles.secondaryButton} onPress={requestPermission}>
          <Text style={styles.secondaryButtonText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      <View style={styles.overlayTop}>
        <Text style={styles.appName}>Disposable Camera</Text>
        <Text style={styles.expiration}>{message}</Text>
      </View>

      <View style={styles.controls}>
        <Link href="/roll" asChild>
          <Pressable style={styles.rollButton}>
            <Text style={styles.rollButtonText}>Temporary Roll</Text>
          </Pressable>
        </Link>

        <Pressable style={styles.shutterOuter} onPress={takePhoto} disabled={isSaving}>
          <View style={styles.shutterInner} />
        </Pressable>

        <View style={styles.placeholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlayTop: {
    position: "absolute",
    top: 56,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  appName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  expiration: {
    color: "#f2f2f2",
    marginTop: 4,
    fontSize: 14,
  },
  controls: {
    position: "absolute",
    bottom: 36,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rollButton: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rollButtonText: {
    color: "#111",
    fontWeight: "700",
  },
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 999,
    borderWidth: 5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  placeholder: {
    width: 104,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#111",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    color: "#ddd",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
  },
  secondaryButton: {
    marginTop: 22,
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  secondaryButtonText: {
    color: "#111",
    fontWeight: "800",
  },
});
