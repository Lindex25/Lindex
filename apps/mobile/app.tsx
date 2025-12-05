import { ClerkProvider, SignedIn, SignedOut, useAuth, useSignIn, useUser } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { ActivityIndicator, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

// Use environment variable for Clerk publishable key
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

// API URL from environment (defaults to Android emulator address)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";

// Token cache so Clerk can persist session securely
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error("SecureStore getItemAsync error: ", err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error("SecureStore setItemAsync error: ", err);
    }
  },
};

function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSignInPress = async () => {
    setError(null);
    if (!isLoaded) return;

    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      await setActive({ session: result.createdSessionId });
    } catch (err: unknown) {
      console.error(err);
      const clerkError = err as { errors?: { message?: string }[] };
      setError(clerkError?.errors?.[0]?.message ?? "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>LINDEX – Sign In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Button title="Sign In" onPress={onSignInPress} />
      )}
    </SafeAreaView>
  );
}

function HomeScreen() {
  const { getToken, signOut } = useAuth();
  const { user } = useUser();
  const [pingResult, setPingResult] = React.useState<string>("(not called yet)");
  const [protectedResult, setProtectedResult] = React.useState<string>("(not called yet)");
  const [loading, setLoading] = React.useState(false);

  // Call public /api/ping endpoint (no auth required)
  const callPing = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ping`);
      const json = await res.json();
      setPingResult(JSON.stringify(json, null, 2));
    } catch (err: unknown) {
      console.error(err);
      setPingResult(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Call protected /api/protected endpoint (requires Clerk auth token)
  const callProtected = async () => {
    setLoading(true);
    try {
      // Get the Clerk session token
      const token = await getToken();

      if (!token) {
        setProtectedResult("Error: No auth token available");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/protected`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();
      setProtectedResult(JSON.stringify(json, null, 2));
    } catch (err: unknown) {
      console.error(err);
      setProtectedResult(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LINDEX – Home</Text>
        <Text style={styles.userInfo}>
          Signed in as: {user?.emailAddresses[0]?.emailAddress ?? "Unknown"}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Loading..." : "Call /api/ping (Public)"}
          onPress={callPing}
          disabled={loading}
        />
      </View>

      <View style={styles.resultBox}>
        <Text style={styles.resultLabel}>Ping Result:</Text>
        <Text selectable style={styles.resultText}>
          {pingResult}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Loading..." : "Call /api/protected (Auth)"}
          onPress={callProtected}
          disabled={loading}
          color="#28a745"
        />
      </View>

      <View style={styles.resultBox}>
        <Text style={styles.resultLabel}>Protected Result:</Text>
        <Text selectable style={styles.resultText}>
          {protectedResult}
        </Text>
      </View>

      <View style={styles.signOutContainer}>
        <Button title="Sign Out" onPress={handleSignOut} color="#dc3545" />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  if (!CLERK_PUBLISHABLE_KEY || !CLERK_PUBLISHABLE_KEY.startsWith("pk_")) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Configuration Error</Text>
        <Text style={styles.errorText}>
          Missing or invalid Clerk publishable key.{"\n"}
          Please check your .env file.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <SignedIn>
        <HomeScreen />
      </SignedIn>
      <SignedOut>
        <SignInScreen />
      </SignedOut>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "flex-start",
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    fontWeight: "600",
  },
  userInfo: {
    fontSize: 14,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  error: {
    color: "red",
    marginBottom: 12,
  },
  buttonContainer: {
    marginVertical: 8,
  },
  resultBox: {
    marginTop: 12,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    maxHeight: 150,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  resultText: {
    fontFamily: "monospace",
    fontSize: 11,
  },
  signOutContainer: {
    marginTop: "auto",
    paddingTop: 20,
  },
  errorContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#dc3545",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
