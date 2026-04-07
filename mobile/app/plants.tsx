import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API = 'http://192.168.1.10:8000/api';

export default function PlantListScreen() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios.get(`${API}/plants/`).then(res => { setPlants(res.data); setLoading(false); });
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1a3a2a" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={plants}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/plant/[id]', params: { id: item.id } })}>
            <Text style={styles.name}>{item.name}</Text>
            {item.local_language && <Text style={styles.badge}>{item.local_language}</Text>}
            <Text style={styles.ailment}>Treats: {item.ailments_treated}</Text>
            <Text style={styles.arrow}>View Details →</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  name: { fontSize: 18, fontWeight: '700', color: '#1a3a2a', marginBottom: 4 },
  badge: { backgroundColor: '#F0F7F2', color: '#2d5a3d', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 20, fontSize: 12, alignSelf: 'flex-start', marginBottom: 6 },
  ailment: { fontSize: 14, color: '#555', marginBottom: 8 },
  arrow: { color: '#C8860A', fontWeight: '600', fontSize: 13 },
});