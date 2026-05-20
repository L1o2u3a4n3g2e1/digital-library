import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, IconButton, Appbar, useTheme, ActivityIndicator } from 'react-native-paper';
import { api } from '../api/client';
import { useAppContext } from '../context/AppContext';
import * as Speech from 'expo-speech';

const TranslatorScreen = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const { language, t, isDarkMode } = useAppContext();
  const theme = useTheme();

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    try {
      const targetLang = language === 'en' ? 'rw' : 'en';
      const response = await api.translate(inputText, targetLang);
      setTranslatedText(response.data.translated);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('Error in translation');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text, lang) => {
    Speech.speak(text, {
      language: lang === 'rw' ? 'fr' : 'en',
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Appbar.Header>
        <Appbar.Content title={t('translate')} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.label}>
              {language === 'en' ? 'English' : 'Ikinyarwanda'}
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Type text to translate..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              numberOfLines={4}
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <IconButton 
                icon="volume-high" 
                onPress={() => handleSpeak(inputText, language)} 
                disabled={!inputText}
              />
              <Button 
                mode="contained" 
                onPress={handleTranslate} 
                loading={loading}
                disabled={!inputText || loading}
                style={styles.translateButton}
              >
                {t('translate')}
              </Button>
            </View>
          </Card.Content>
        </Card>

        <IconButton 
          icon="swap-vertical" 
          style={styles.swapIcon} 
          size={30}
        />

        <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.label}>
              {language === 'en' ? 'Ikinyarwanda' : 'English'}
            </Text>
            <View style={styles.resultContainer}>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text variant="bodyLarge" style={styles.resultText}>
                  {translatedText || 'Translation will appear here...'}
                </Text>
              )}
            </View>
            <View style={styles.buttonRow}>
              <IconButton 
                icon="volume-high" 
                onPress={() => handleSpeak(translatedText, language === 'en' ? 'rw' : 'en')} 
                disabled={!translatedText}
              />
              <IconButton 
                icon="content-copy" 
                onPress={() => {}} 
                disabled={!translatedText}
              />
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  card: { marginBottom: 10, elevation: 1 },
  label: { marginBottom: 8, opacity: 0.7 },
  input: { backgroundColor: 'transparent' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8 },
  translateButton: { marginLeft: 8 },
  swapIcon: { alignSelf: 'center', marginVertical: 4 },
  resultContainer: { minHeight: 80, justifyContent: 'center', paddingVertical: 10 },
  resultText: { fontStyle: 'italic' },
});

export default TranslatorScreen;
