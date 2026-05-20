import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Switch, IconButton, Appbar, Button } from 'react-native-paper';
import { useAppContext } from '../context/AppContext';

const SettingsScreen = () => {
  const { language, toggleLanguage, isDarkMode, toggleTheme, t } = useAppContext();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={t('settings')} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <List.Section>
          <List.Subheader>{t('theme')}</List.Subheader>
          <List.Item
            title={t('darkMode')}
            left={() => <List.Icon icon="moon-waning-crescent" />}
            right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} />}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>{t('language')}</List.Subheader>
          <List.Item
            title={language === 'en' ? 'English' : 'Ikinyarwanda'}
            description={t('changeLanguage')}
            left={() => <List.Icon icon="translate" />}
            onPress={toggleLanguage}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>{t('voiceSpeed')}</List.Subheader>
          <View style={styles.speedRow}>
            <IconButton icon="minus-circle-outline" onPress={() => {}} />
            <Text variant="titleLarge">1.0x</Text>
            <IconButton icon="plus-circle-outline" onPress={() => {}} />
          </View>
        </List.Section>

        <Button 
          mode="outlined" 
          style={styles.logoutButton} 
          onPress={() => {}}
          textColor="#D93025"
        >
          {language === 'rw' ? 'Sohoka' : 'Logout'}
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  speedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  logoutButton: { marginTop: 40, borderColor: '#D93025' },
});

export default SettingsScreen;
