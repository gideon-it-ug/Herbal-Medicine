import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { register } from '../src/services/api';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username.trim() || password.length < 8) {
      Alert.alert('Error', 'Username required and password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register({
        username,
        password,
        email,
        first_name: firstName,
        last_name: lastName,
      });
      Alert.alert('Success', 'Account created. Please login.');
      router.replace('/login');
    } catch {
      Alert.alert('Error', 'Registration failed. Check your details and try again.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Contributor Signup</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Username" placeholderTextColor="#999" autoCapitalize="none" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password (min 8 chars)" placeholderTextColor="#999" secureTextEntry />
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email (optional)" placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" placeholderTextColor="#999" />
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" placeholderTextColor="#999" />
        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Sign Up</Text>}
        </TouchableOpacity>
        <Link href="/login" style={styles.link}>Already have an account? Login</Link>
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
});
