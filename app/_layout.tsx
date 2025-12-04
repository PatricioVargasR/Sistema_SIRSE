import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useReportPolling } from '@/hooks/useReportPolling';

export default function RootLayout() {

  useReportPolling();
  const router = useRouter();

  useEffect(() => {
    // Manejar deep links cuando la app se abre desde un link
    const handleDeepLink = (event: { url: string }) => {
      const { path, queryParams } = Linking.parse(event.url);
      
      if (path) {
        // Navegar a la ruta correspondiente
        router.push(path as any);
      }
    };

    // Escuchar eventos de deep linking
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Verificar si la app se abrió con un deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="modal" 
        options={{ 
          presentation: 'modal',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="report/[id]" 
        options={{ 
          headerShown: false 
        }} 
      />
    </Stack>
  );
}