import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    navigation.navigate('PlantList', { query });
  };

  return (
    <View style={{ padding: 20 }}>
      
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        Herbal Medicine Repository
      </Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by plant or ailment..."
        style={{
          borderWidth: 1,
          marginVertical: 10,
          padding: 10,
          borderRadius: 5
        }}
      />

      <TouchableOpacity
        onPress={handleSearch}
        style={{
          backgroundColor: 'green',
          padding: 12,
          borderRadius: 5,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white' }}>Search</Text>
      </TouchableOpacity>

    </View>
  );
}