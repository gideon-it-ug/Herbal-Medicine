import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getPlant } from '../../src/services/api';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const [plant, setPlant] = useState(null);

  useEffect(() => { getPlant(id).then(res => setPlant(res.data)); }, [id]);

  if (!plant) return <View style={styles.center}><ActivityIndicator size="large" color="#1a3a2a" /></View>;

  const Field = ({ label, value }) => value ? (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.name}>{plant.name}</Text>
          {plant.scientific_name && <Text style={styles.sci}>🔬 {plant.scientific_name}</Text>}
          {plant.local_language && <Text style={styles.badge}>{plant.local_language}</Text>}
        </View>
        <View style={styles.body}>
          <Field label="DISEASE CURED" value={plant.disease_cured} />
          <Field label="PREPARATION METHOD" value={plant.preparation_method} />
          <Field label="DOSAGE" value={plant.dosage} />
          <Field label="SIDE EFFECTS" value={plant.side_effects} />
          <Field label="CULTURAL SIGNIFICANCE" value={plant.cultural_significance} />
          <Field label="GEOGRAPHIC DISTRIBUTION" value={plant.geographic_distribution} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#1a3a2a', padding: 24 },
  name: { fontSize: 26, fontWeight: '800', color: '#F5E6C8', marginBottom: 6 },
  sci: { color: '#A8D5B5', fontSize: 14, marginBottom: 6 },
  badge: { backgroundColor: '#2d5a3d', color: 'white', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, fontSize: 12, alignSelf: 'flex-start' },
  body: { padding: 16 },
  field: { backgroundColor: 'white', borderRadius: 10, padding: 14, marginBottom: 10, elevation: 1 },
  label: { fontSize: 11, fontWeight: '700', color: '#C8860A', letterSpacing: 1.5, marginBottom: 4 },
  value: { fontSize: 15, color: '#333', lineHeight: 22 },
});
