import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Alert,
  Text,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import Constants from 'expo-constants';
import { useLocalSearchParams } from 'expo-router';
import api from '../api';

const BACKEND_URL =
  Constants.expoConfig?.extra?.BACKEND_BASE_URL ||
  Constants.manifest?.extra?.BACKEND_BASE_URL ||
  '';

export default function DownloadScreen() {
  const { filename } = useLocalSearchParams<{ filename?: string }>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
const loadingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!filename) return;

    const fetchImage = async () => {
      try {
        setLoading(true);

        if (Platform.OS === 'web') {
const response = await api.get(`/uploads/${filename}`, {
  responseType: 'blob',
});
    const blobUrl = window.URL.createObjectURL(response.data);
          setImageUrl(blobUrl);
        } else {
          const remoteUrl = `${BACKEND_URL}/uploads/${filename}`;
          const fileUri = FileSystem.cacheDirectory + filename;

          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          if (!fileInfo.exists) {
            await FileSystem.downloadAsync(remoteUrl, fileUri);
          }
          setImageUrl(fileUri);
        }
      } catch (error) {
        console.error('Erro ao scarregar imagem:', error);
        Alert.alert('Erro', 'Não foi possível carregar av imagem.');
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (Platform.OS === 'web' && imageUrl != null) {
        window.URL.revokeObjectURL(imageUrl);
      }
    };

  },[filename]);


function handleImageLoad() {
  if (loadingTimeout.current) {
    clearTimeout(loadingTimeout.current);
  }
  loadingTimeout.current = setTimeout(() => {
    setLoading(false);
  }, 2000);
}
  async function handleDownload() {
    if (!imageUrl || !filename) {
      Alert.alert('Erro', 'Imagem ou nome do arquivo indisponível.');
      return;
    }

    try {
      setDownloading(true);

      if (Platform.OS === 'web') {
        // Download usando URL blob já criada
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        Alert.alert('Sucesso', 'Imagem baixada!');
      } else {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Não foi possível salvar a imagem.');
          return;
        }
        // Salva arquivo local já baixado na galeria
        await MediaLibrary.saveToLibraryAsync(imageUrl);
        Alert.alert('Sucesso', 'Imagem salva na galeria!');
      }
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
      Alert.alert('Erro', 'Falha ao salvar imagem.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <View style={styles.background}>
      {imageUrl && (
        <>
          
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
              onLoad={handleImageLoad}
              onError={handleImageLoad}
              accessibilityLabel="Imagem gerada para download"
            />
          </View>
        </>
      )}

      {(loading || !imageUrl) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      <Pressable
        style={[styles.buttonCard, downloading && { opacity: 0.6 }]}
        onPress={handleDownload}
        disabled={downloading || loading || !imageUrl}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {downloading ? 'Salvando...' : 'Salvar na galeria'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
 
  imageWrapper: {
       width: '100%',
                        aspectRatio: 9 / 16,
                        borderRadius: 24,
                        backgroundColor: '#fff',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.12,
                        shadowRadius: 8,
                        elevation: 4,
                        marginBottom: 32,
                        alignSelf: 'center',
                        overflow: 'hidden',
                        maxWidth: 400,
                        maxHeight: 700,
                        position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonCard: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    borderRadius: 24, // bordas arredondadas em todos os lados
    width: 180, // largura menor
    alignSelf: 'center', // centralizado
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15, // levemente menor
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
}
);   