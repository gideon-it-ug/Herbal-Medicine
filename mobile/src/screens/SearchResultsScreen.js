import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function SearchResultsScreen({ route, navigation }) {
  const { query } = route.params;
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    if (query) {
      api.get(`/plants?search=${query}`)
        .then(res => setPlants(res.data))
        .catch(err => console.log(err));
    }
  }, [query]);

  return (
    <View style={{ flex: 1, padding: 20 }}>

      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        Results for "{query}"
      </Text>

      {plants.length === 0 ? (
        <Text>No results found</Text>
      ) : (
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
              <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
              <Text>{item.ailments_treated}</Text>
            </TouchableOpacity>
          )}
        />
      )}

    </View>
  );
}