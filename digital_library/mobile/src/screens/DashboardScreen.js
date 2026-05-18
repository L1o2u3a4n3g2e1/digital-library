import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Text, Card, Title, Paragraph, ActivityIndicator, IconButton, Appbar } from 'react-native-paper';
import { api } from '../api/client';
import { useAppContext } from '../context/AppContext';

const DashboardScreen = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { language, t, toggleLanguage, toggleTheme, isDarkMode, userId } = useAppContext();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (userId) fetchDashboard();
  }, [language, userId]);

  const fetchDashboard = async () => {
    try {
      const response = await api.getDashboard(userId);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = selectedCategory 
    ? data?.recommended?.filter(book => book.category_id === selectedCategory)
    : data?.recommended;

  const isTablet = width > 768;

  if (loading) return <ActivityIndicator style={styles.loader} />;

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}>
      <Appbar.Header>
        <Appbar.Content title={t('library')} />
        <IconButton icon="translate" onPress={toggleLanguage} />
        <IconButton icon={isDarkMode ? 'brightness-7' : 'brightness-4'} onPress={toggleTheme} />
      </Appbar.Header>

      <ScrollView style={styles.scroll}>
        <View style={[styles.content, isTablet && styles.tabletContent]}>
          
          {/* Categories */}
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>{t('categories')}</Text>
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity 
                style={[
                  styles.categoryCard, 
                  { backgroundColor: !selectedCategory ? '#1A73E8' : (isDarkMode ? '#333' : '#eee') }
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={{ color: !selectedCategory ? '#fff' : (isDarkMode ? '#bbb' : '#666'), fontWeight: 'bold' }}>
                  {language === 'rw' ? 'Byose' : 'All'}
                </Text>
              </TouchableOpacity>
              {data?.categories?.map((item) => (
                <TouchableOpacity 
                  key={item.category_id}
                  style={[
                    styles.categoryCard, 
                    { 
                      backgroundColor: selectedCategory === item.category_id ? item.color_hex : (isDarkMode ? '#333' : '#eee'),
                      borderWidth: 2,
                      borderColor: selectedCategory === item.category_id ? '#fff' : 'transparent'
                    }
                  ]}
                  onPress={() => setSelectedCategory(item.category_id)}
                >
                  <Text style={{ color: selectedCategory === item.category_id ? '#fff' : (isDarkMode ? '#bbb' : '#666'), fontWeight: 'bold' }}>
                    {language === 'rw' ? item.name_rw : item.name_en}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Recommended - Grid for Tablets */}
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
            {selectedCategory ? t('books') : t('recommended')}
          </Text>
          <View style={isTablet ? styles.grid : styles.list}>
            {filteredBooks?.map((book) => (
              <Card 
                key={book.book_id} 
                style={[
                  styles.bookCard, 
                  isTablet && { width: (width - 64) / 3 },
                  { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }
                ]} 
                onPress={() => navigation.navigate('Reader', { bookId: book.book_id })}
              >
                {book.cover_image_url ? (
                  <Card.Cover source={{ uri: book.cover_image_url }} style={styles.cardCover} />
                ) : (
                  <View style={[styles.placeholderCover, { backgroundColor: isDarkMode ? '#333' : '#eee' }]}>
                    <IconButton icon="book" size={40} />
                  </View>
                )}
                <Card.Content>
                  <Title numberOfLines={1} style={{ color: isDarkMode ? '#fff' : '#000', marginTop: 10 }}>{book.title}</Title>
                  <Paragraph numberOfLines={1} style={{ color: isDarkMode ? '#aaa' : '#666' }}>{book.author}</Paragraph>
                </Card.Content>
              </Card>
            ))}
            {filteredBooks?.length === 0 && (
              <Text style={{ textAlign: 'center', marginTop: 20, color: isDarkMode ? '#aaa' : '#666' }}>
                {language === 'rw' ? 'Nta bitabo bibonetse.' : 'No books found in this category.'}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center' },
  content: { padding: 16 },
  tabletContent: { alignSelf: 'center', width: '90%' },
  sectionTitle: { marginVertical: 15, fontWeight: 'bold' },
  categoryCard: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  categoryText: { color: '#fff', fontWeight: 'bold' },
  bookCard: { marginBottom: 15, elevation: 2, overflow: 'hidden' },
  cardCover: { height: 200, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  placeholderCover: { height: 200, justifyContent: 'center', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  list: { flexDirection: 'column' },
});

export default DashboardScreen;
