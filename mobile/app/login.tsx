import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../src/services/api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Error', 'Enter username and password');
      return;
    }
    setLoading(true);
    try {
      const { data } = await login(username, password);
      await AsyncStorage.setItem('access', data.access);
      await AsyncStorage.setItem('refresh', data.refresh);
      router.replace('/upload');
    } catch {
      Alert.alert('Error', 'Invalid credentials or server unavailable');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Contributor Login</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
        />
        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Login</Text>}
        </TouchableOpacity>
        <Link href="/register" style={styles.link}>Create a researcher account</Link>
        <Link href="/" style={styles.backLink}>← Back to Home</Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 24, elevation: 2 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a3a2a', marginBottom: 20 },
  input: { borderWidth: 1.5, borderColor: '#e0ddd8', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 15, backgroundColor: '#FAFAF8' },
  btn: { backgroundColor: '#1a3a2a', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 4 },
  btnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  link: { color: '#1a3a2a', textAlign: 'center', marginTop: 16, fontWeight: '600' },
  backLink: { color: '#777', textAlign: 'center', marginTop: 12 },
});
