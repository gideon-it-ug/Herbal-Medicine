import { View, Text, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function PlantDetailScreen({ route }) {
  const { id } = route.params; // replaces useParams
  const [plant, setPlant] = useState(null);

  useEffect(() => {
    api.get(`/plants/${id}`)
      .then(res => setPlant(res.data))
      .catch(err => console.log(err));
  }, [id]);

  if (!plant) {
    return <Text style={{ padding: 20 }}>Loading...</Text>;
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>
        {plant.name}
      </Text>

      <Text><Text style={{ fontWeight: 'bold' }}>Scientific Name: </Text>{plant.scientific_name}</Text>

      <Text><Text style={{ fontWeight: 'bold' }}>Ailments Treated: </Text>{plant.ailments_treated}</Text>

      <Text><Text style={{ fontWeight: 'bold' }}>Preparation: </Text>{plant.preparation_method}</Text>

      <Text><Text style={{ fontWeight: 'bold' }}>Dosage: </Text>{plant.dosage}</Text>

      <Text><Text style={{ fontWeight: 'bold' }}>Side Effects: </Text>{plant.side_effects}</Text>

    </ScrollView>
  );
}