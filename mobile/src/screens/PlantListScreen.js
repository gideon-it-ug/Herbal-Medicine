import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function PlantListScreen({ navigation, route }) {
  const [plants, setPlants] = useState([]);

  // Optional: get search query from Home
  const query = route?.params?.query;

  useEffect(() => {
    let url = '/plants';

    if (query) {
      url = `/plants?search=${query}`;
    }

    api.get(url)
      .then(res => setPlants(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>

      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        {query ? `Results for "${query}"` : 'All Plants'}
      </Text>

      <FlatList
        data={plants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('PlantDetail', { id: item.id })}
            style={{
              padding: 15,
              borderBottomWidth: 1,
              borderColor: '#ccc'
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              {item.name}
            </Text>

            <Text>{item.ailments_treated}</Text>
          </TouchableOpacity>
        )}
      />

    </View>
  );
}