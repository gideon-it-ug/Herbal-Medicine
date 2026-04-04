import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { getPlants } from '../services/api';

export default function PlantListScreen({ navigation }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlants().then(res => { setPlants(res.data); setLoading(false); });
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size='large' color='#1B5E20' /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={plants}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PlantDetail', { id: item.id })}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.lang}>{item.local_language}  📍 {item.geographic_distribution}</Text>
            <Text style={styles.ailment}>Treats: {item.ailments_treated}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: 'white', borderRadius: 10, padding: 16, marginBottom: 12, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#1B5E20', marginBottom: 4 },
  lang: { fontSize: 12, color: '#777', marginBottom: 6 },
  ailment: { fontSize: 14, color: '#444' },
});
