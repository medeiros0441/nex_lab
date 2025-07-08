import { StyleSheet, Pressable, View, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

import backgroundImage from '@/assets/images/logo.png';

export default function PreviewScreen() {
  const router = useRouter();

  return (
    <View style={styles.backgroundContainer}>
      <BlurView intensity={50} style={styles.blurOverlay}>
        <View style={styles.contentContainer}>
          <Image source={backgroundImage} style={styles.logo} />

          <Text style={styles.title}>Bem-vindo ao App!</Text>

          <Text style={styles.description}>
            Aqui você pode tirar fotos, salvar e compartilhar seus momentos favoritos com facilidade.
          </Text>

          <Pressable style={styles.button} onPress={() => router.push('/pages/camera')}>
            <Text style={styles.buttonText}>Abrir Câmera</Text>
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    zIndex: 0,
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    zIndex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)', // leve transparência para destacar o conteúdo
    padding: 24,
    aspectRatio: 9 / 16,
    maxWidth: 360, // 360x640 mantém 9:16, mas pode ser ajustado conforme o layout desejado
    width: '100%',
    maxHeight: '90%',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    color: '#111',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
