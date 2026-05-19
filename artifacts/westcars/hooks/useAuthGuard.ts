import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';

export function useAuthGuard() {
  const { user } = useAuth();
  const { isAuthenticated } = useApp();
  const isAuthed = isAuthenticated || !!user;

  const promptSignIn = (message = 'Please sign in to continue.') => {
    Alert.alert('Sign In Required', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign In', onPress: () => router.push('/auth/login') },
    ]);
  };

  const requireAuth = (action: () => void, message?: string): boolean => {
    if (!isAuthed) {
      promptSignIn(message);
      return false;
    }
    action();
    return true;
  };

  return { isAuthed, promptSignIn, requireAuth };
}
