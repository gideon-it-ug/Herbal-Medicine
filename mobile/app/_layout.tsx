import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: '🌿 Herbal Medicine' }} />
      <Stack.Screen name="plants" options={{ title: 'All Plants' }} />
      <Stack.Screen name="plant/[id]" options={{ title: 'Plant Detail' }} />
      <Stack.Screen name="search" options={{ title: 'Search Results' }} />
      <Stack.Screen name="chatbot" options={{ title: 'Chatbot' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="upload" options={{ title: 'Upload Recording' }} />
    </Stack>
  );
}