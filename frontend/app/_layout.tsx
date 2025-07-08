import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from './api';
export default function Layout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [checkingBackend, setCheckingBackend] = useState(true);

  async function checkBackendAvailable() {
    try {
      
      const response = await api.get(`/health`);
     return response.status === 200;
    } catch  {
      return false;
    }
  }

  useEffect(() => {
    if (backendOk === false) setShowBackendModal(true);
    else if (backendOk === true) setShowBackendModal(false);
  }, [backendOk]);

  useEffect(() => {
    setCheckingBackend(true);
    checkBackendAvailable().then(ok => {
      setBackendOk(ok);
      setCheckingBackend(false);
    });
  }, []);

  function handleRetryBackend() {
    setShowBackendModal(false);
    setBackendOk(null);
    setCheckingBackend(true);
    checkBackendAvailable().then(ok => {
      setBackendOk(ok);
      setCheckingBackend(false);
    });
  }

  if (!loaded || checkingBackend) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: '#222', fontSize: 16 }}>Verificando servidor...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Modal visible={showBackendModal} transparent animationType="fade" style={{ marginTop: 5, marginBottom: 10, marginLeft: 15, marginRight: 20 }} >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', minWidth: 280 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 8, textAlign: 'center' }}>Backend indisponível</Text>
            <Text style={{ fontSize: 16, color: '#444', marginBottom: 24, textAlign: 'center' }}>
              Não foi possível conectar ao servidor. Verifique se o backend está ativo e tente novamente.
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8, alignItems: 'center' }}
              onPress={handleRetryBackend}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {backendOk && (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="pages/camera" />
          <Stack.Screen name="pages/download" />
          <Stack.Screen name="pages/adm" />
          <Stack.Screen name="+not-found" />
        </Stack>
      )}
    </ThemeProvider>
  );
}
