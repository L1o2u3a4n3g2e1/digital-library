import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Appbar, ActivityIndicator, FAB, useTheme } from 'react-native-paper';
import { api } from '../api/client';
import { useAppContext } from '../context/AppContext';
import * as Speech from 'expo-speech';

const ReaderScreen = ({ route, navigation }) => {
  const { bookId } = route.params;
  const [book, setBook] = useState(null);
  const [content, setContent] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { language, t, isDarkMode } = useAppContext();
  const theme = useTheme();

  useEffect(() => {
    fetchBook();
    fetchContent();
  }, [bookId, page, language]);

  const fetchBook = async () => {
    try {
      const response = await api.getBook(bookId);
      setBook(response.data);
    } catch (error) {
      console.error('Error fetching book:', error);
    }
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await api.getBookContent(bookId, page, language);
      setContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeech = () => {
    if (content?.page_text) {
      Speech.speak(content.page_text, {
        language: language === 'rw' ? 'fr' : 'en', // Using French fallback for Kinyarwanda
      });
    }
  };

  if (!book) return <ActivityIndicator style={styles.loader} />;

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}>
      <Appbar.Header style={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff' }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={book.title} subtitle={`Page ${page}`} titleStyle={{ color: isDarkMode ? '#fff' : '#000' }} />
        <Appbar.Action icon="translate" onPress={() => {}} color={isDarkMode ? '#fff' : '#000'} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text variant="bodyLarge" style={[styles.text, { color: isDarkMode ? '#e0e0e0' : '#202124' }]}>
            {content?.page_text || (language === 'rw' ? 'Nta birimo kuri uru rupapuro.' : 'No content found on this page.')}
          </Text>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', borderTopColor: isDarkMode ? '#333' : '#eee' }]}>
        <Button 
          mode="outlined" 
          onPress={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          textColor={isDarkMode ? '#8AB4F8' : '#1A73E8'}
          style={{ borderColor: isDarkMode ? '#333' : '#eee' }}
        >
          {t('back')}
        </Button>
        <Text style={{ color: isDarkMode ? '#aaa' : '#666' }}>{page}</Text>
        <Button 
          mode="contained" 
          onPress={() => setPage(p => p + 1)}
          buttonColor={isDarkMode ? '#8AB4F8' : '#1A73E8'}
        >
          {t('next')}
        </Button>
      </View>

      <FAB
        icon="volume-high"
        style={styles.fab}
        onPress={handleSpeech}
        label={t('listen')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 150 },
  text: { lineHeight: 32, fontSize: 20, textAlign: 'justify' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 100,
    backgroundColor: '#1A73E8',
  },
});

export default ReaderScreen;
