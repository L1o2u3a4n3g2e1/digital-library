import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1A73E8',
    secondary: '#5F6368',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#202124',
    accent: '#D93025',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#8AB4F8',
    secondary: '#BDC1C6',
    background: '#202124',
    surface: '#303134',
    text: '#E8EAED',
    accent: '#F28B82',
  },
};
