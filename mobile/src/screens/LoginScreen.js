import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.X.X:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save tokens
        await AsyncStorage.setItem('access', data.access);
        await AsyncStorage.setItem('refresh', data.refresh);

        Alert.alert('Success', 'Login successful');

        // Navigate after login
        navigation.navigate('Home');

      } else {
        Alert.alert('Error', 'Login failed');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Cannot connect to server');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Login</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
          borderRadius: 5
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
          borderRadius: 5
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: 'green',
          padding: 12,
          borderRadius: 5,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white' }}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}