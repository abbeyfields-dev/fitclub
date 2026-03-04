import { useColorScheme } from 'react-native';
import { lightTheme } from './light';
import { darkTheme } from './dark';

export function useAppTheme() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
