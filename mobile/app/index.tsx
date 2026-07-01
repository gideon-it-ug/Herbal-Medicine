import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPlants, getTranscriptions } from '../src/services/api';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState({ plants: 0, transcriptions: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('access').then((token) => setIsLoggedIn(!!token));
    }, [])
  );

  useEffect(() => {
    getPlants().then(res => setStats(prev => ({ ...prev, plants: res.data.length })));
    getTranscriptions().then(res => setStats(prev => ({ ...prev, transcriptions: res.data.length })));
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['access', 'refresh']);
    setIsLoggedIn(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>🌿 Indigenous Herbal Knowledge</Text>
          <Text style={styles.heroSub}>Bukedi Sub-Region, Uganda</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="Search plant or ailment..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={() => router.push({ pathname: '/search', params: { query } })}>
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsBar}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{stats.plants}</Text>
            <Text style={styles.statLabel}>Plants</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>5</Text>
            <Text style={styles.statLabel}>Districts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>4</Text>
            <Text style={styles.statLabel}>Languages</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{stats.transcriptions}</Text>
            <Text style={styles.statLabel}>Recordings</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.card} onPress={() => router.push('/plants')}>
            <Text style={styles.cardIcon}>🌱</Text>
            <Text style={styles.cardTitle}>Browse Plants</Text>
            <Text style={styles.cardDesc}>All documented plants</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.card, { backgroundColor: '#C8860A' }]} onPress={() => router.push('/chatbot')}>
            <Text style={styles.cardIcon}>🤖</Text>
            <Text style={styles.cardTitle2}>Chatbot</Text>
            <Text style={styles.cardDesc2}>Ask about remedies</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: '#FF8F00' }]}
            onPress={() => router.push(isLoggedIn ? '/upload' : '/login')}
          >
            <Text style={styles.cardIcon}>🎤</Text>
            <Text style={styles.cardTitle2}>Upload</Text>
            <Text style={styles.cardDesc2}>{isLoggedIn ? 'Add plant data' : 'Contributor login'}</Text>
          </TouchableOpacity>
          {isLoggedIn && (
            <TouchableOpacity style={styles.card} onPress={handleLogout}>
              <Text style={styles.cardIcon}>🚪</Text>
              <Text style={styles.cardTitle}>Logout</Text>
              <Text style={styles.cardDesc}>End session</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  hero: { backgroundColor: '#1a3a2a', padding: 28, paddingTop: 40 },
  heroTitle: { color: '#F5E6C8', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  heroSub: { color: '#A8D5B5', fontSize: 13, marginBottom: 20 },
  searchRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 50, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  searchBtn: { backgroundColor: '#C8860A', borderRadius: 50, paddingHorizontal: 18, justifyContent: 'center' },
  searchBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  statsBar: { backgroundColor: '#2d5a3d', flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
  stat: { alignItems: 'center' },
  statNum: { color: '#F5E6C8', fontSize: 28, fontWeight: '800' },
  statLabel: { color: '#A8D5B5', fontSize: 11, marginTop: 2 },
  grid: { padding: 16, flexDirection: 'row', gap: 12 },
  card: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 20, alignItems: 'center', elevation: 2 },
  cardIcon: { fontSize: 36, marginBottom: 8 },
  cardTitle: { fontWeight: '700', fontSize: 15, color: '#1a3a2a', marginBottom: 4 },
  cardTitle2: { fontWeight: '700', fontSize: 15, color: 'white', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#777', textAlign: 'center' },
  cardDesc2: { fontSize: 12, color: '#FFF8E1', textAlign: 'center' },
});
