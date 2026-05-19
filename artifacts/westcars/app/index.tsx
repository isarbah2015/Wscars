import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const check = async () => {
      if (user) {
        router.replace('/(tabs)');
        return;
      }
      const done = await AsyncStorage.getItem('onboarding_complete');
      if (done === 'true') {
        router.replace('/auth/welcome');
      } else {
        router.replace('/onboarding');
      }
    };
    check();
  }, [user, loading]);

  return null;
}
