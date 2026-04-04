import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌿 Herbal Medicine</Text>
        <Text style={styles.headerSubtitle}>Bukedi Sub-Region Repository</Text>
      </View>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder='Search by plant or ailment...'
          placeholderTextColor='#999'
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => navigation.navigate('Search', { query })}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PlantList')}>
          <Text style={styles.cardIcon}>🌱</Text>
          <Text style={styles.cardTitle}>Browse Plants</Text>
          <Text style={styles.cardDesc}>All documented plants</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Chatbot')}>
          <Text style={styles.cardIcon}>🤖</Text>
          <Text style={styles.cardTitle}>Chatbot</Text>
          <Text style={styles.cardDesc}>Ask about remedies</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, { backgroundColor: '#FF8F00' }]} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.cardIcon}>🎤</Text>
          <Text style={[styles.cardTitle, { color: 'white' }]}>Upload</Text>
          <Text style={[styles.cardDesc, { color: '#FFF8E1' }]}>Researcher login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F0' },
  header: { backgroundColor: '#1B5E20', padding: 24, paddingTop: 40 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: '#C8E6C9', fontSize: 13, marginTop: 4 },
  searchSection: { padding: 16, flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: 'white', fontSize: 15 },
  searchBtn: { backgroundColor: '#1B5E20', paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  searchBtnText: { color: 'white', fontWeight: 'bold' },
  grid: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { backgroundColor: 'white', borderRadius: 10, padding: 16, width: '47%', alignItems: 'center', elevation: 2 },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  cardTitle: { fontWeight: 'bold', fontSize: 15, color: '#1B5E20', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#777', textAlign: 'center' },
});
