import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('onboarding_complete').then((val) => {
      if (val === 'true') {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    });
  }, []);

  return null;
}
