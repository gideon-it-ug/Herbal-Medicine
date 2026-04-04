import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { getPlant } from '../services/api';

export default function PlantDetailScreen({ route }) {
  const { id } = route.params;
  const [plant, setPlant] = useState(null);

  useEffect(() => { getPlant(id).then(res => setPlant(res.data)); }, [id]);

  if (!plant) return <View style={styles.center}><Text>Loading...</Text></View>;

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
          <Field label='AILMENTS TREATED' value={plant.ailments_treated} />
          <Field label='PREPARATION METHOD' value={plant.preparation_method} />
          <Field label='DOSAGE' value={plant.dosage} />
          <Field label='SIDE EFFECTS' value={plant.side_effects} />
          <Field label='CULTURAL SIGNIFICANCE' value={plant.cultural_significance} />
          <Field label='CULTIVATION NOTES' value={plant.cultivation_notes} />
          <Field label='GEOGRAPHIC DISTRIBUTION' value={plant.geographic_distribution} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#1B5E20', padding: 24 },
  name: { fontSize: 26, fontWeight: 'bold', color: 'white', marginBottom: 6 },
  sci: { color: '#C8E6C9', fontSize: 14, marginBottom: 4 },
  badge: { backgroundColor: '#2E7D32', color: 'white', padding: 4, borderRadius: 4, fontSize: 12, alignSelf: 'flex-start' },
  body: { padding: 16 },
  field: { backgroundColor: 'white', borderRadius: 8, padding: 14, marginBottom: 10, elevation: 1 },
  label: { fontSize: 11, fontWeight: 'bold', color: '#1B5E20', letterSpacing: 1, marginBottom: 4 },
  value: { fontSize: 15, color: '#333' },
});
