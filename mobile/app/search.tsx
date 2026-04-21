import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { searchPlants } from '../src/services/api';

export default function SearchScreen() {
  const { query } = useLocalSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    searchPlants(query).then(res => { setResults(res.data); setLoading(false); });
  }, [query]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1a3a2a" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{`Results for "${query}"`}</Text>
      {results.length === 0 && <Text style={styles.empty}>No plants found. Try another search.</Text>}
      <FlatList
        data={results}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/plant/[id]', params: { id: item.id } })}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.ailment}>Treats: {item.ailments_treated}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#1a3a2a', padding: 16 },
  empty: { textAlign: 'center', color: '#777', marginTop: 40 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  name: { fontSize: 16, fontWeight: '700', color: '#1a3a2a', marginBottom: 4 },
  ailment: { fontSize: 14, color: '#555' },
});
