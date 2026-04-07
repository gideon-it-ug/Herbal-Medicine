import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';

const API = 'http://192.168.1.10:8000/api';

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'bot', text: '👋 Osiibire! Ask me about any medicinal plant or ailment.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/nlp/chat/`, { message: input });
      setMessages(prev => [...prev, { id: Date.now().toString() + '1', sender: 'bot', text: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString() + '1', sender: 'bot', text: 'Could not connect to server.' }]);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
              <Text style={item.sender === 'user' ? styles.userText : styles.botText}>{item.text}</Text>
            </View>
          )}
        />
        {loading && <Text style={{ textAlign: 'center', color: '#777', marginBottom: 8 }}>Thinking...</Text>}
        <View style={styles.inputRow}>
          <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Ask about a plant..." placeholderTextColor="#999" />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 12, marginBottom: 10 },
  userBubble: { backgroundColor: '#1a3a2a', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: '#F5F0E8', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e8e0d0' },
  userText: { color: 'white', fontSize: 14, lineHeight: 20 },
  botText: { color: '#1a1a1a', fontSize: 14, lineHeight: 20 },
  inputRow: { flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: '#e0ddd8', backgroundColor: 'white' },
  input: { flex: 1, borderWidth: 1.5, borderColor: '#e0ddd8', borderRadius: 50, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, backgroundColor: '#FAFAF8' },
  sendBtn: { backgroundColor: '#1a3a2a', borderRadius: 50, paddingHorizontal: 20, justifyContent: 'center' },
  sendText: { color: 'white', fontWeight: '700' },
});