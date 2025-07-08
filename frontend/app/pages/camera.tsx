import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useState, useRef, useEffect } from 'react';
import { Button, Text, TouchableOpacity, View, Platform, Image,   ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QrCodeUniversal from '@/components/QrCodeUniversal';
import { useRouter } from 'expo-router';
import { generateFramedImage } from './generateFramedImage';
import Constants from 'expo-constants';

import api from '../api'

// dentro do componente
export default function CameraFlow() {
  const [facing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [step, setStep] = useState<'camera' | 'preview' | 'camera-loading' | 'qrcode' | 'thanks-modal' | 'thanks'>('camera-loading');
  const [capturedPhoto, setCapturedPhoto] = useState<any>(null);
  const [preCaptureCount, setPreCaptureCount] = useState<number | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [showThanksModal, setShowThanksModal] = useState(false);
  const router = useRouter();

  // Step: Camera loading
  useEffect(() => {
    if (step === 'camera-loading') {
      const timer = setTimeout(() => setStep('camera'), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Função para iniciar o contador e capturar a foto
  const handleCapture = async () => {
    if (preCaptureCount !== null || !cameraReady) return;
    setPreCaptureCount(3);
    for (let i = 3; i > 0; i--) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPreCaptureCount(c => (c !== null ? c - 1 : null));
    }
    setPreCaptureCount(0);
    // Captura a foto
    if (cameraRef.current) {
      try {
        const fotoOriginal = await cameraRef.current.takePictureAsync({ base64: true, skipProcessing: true });

        if (fotoOriginal.uri && fotoOriginal.base64) {
          // Garante que base64 está limpo (sem prefixo)
          const base64 = fotoOriginal.base64.startsWith('data:image')
            ? fotoOriginal.base64.replace(/^data:image\/\w+;base64,/, '')
            : fotoOriginal.base64;
          const result = await generateFramedImage(base64);
          // Salva no estado
          setCapturedPhoto(result);
        }
        setStep('preview');
        setPreCaptureCount(null);
      } catch {
        setPreCaptureCount(null);
        setStep('camera');
      }
    } else {
      setPreCaptureCount(null);
    }
  };

  async function savePhotoToServer(base64Data: string): Promise<string | null> {
    try {
      const FRONT = Constants.expoConfig?.extra?.FRONT_BASE_URL || Constants.manifest?.extra?.FRONT_BASE_URL || '';
      // Garante que só envia PNG com prefixo correto
      const cleanBase64 = base64Data.startsWith('data:image/png;base64,')
        ? base64Data
        : `data:image/png;base64,${base64Data.replace(/^data:image\/(png|jpeg|jpg);base64,/, '')}`;
        const response = await api.post('/save', {
      imageBase64: cleanBase64,
    });


    const data = response.data;
      if (!data?.filename) {
        console.warn('Resposta do backend sem filename');
        return null;
      }

      const fullUrl = `${FRONT}/pages/download?filename=${encodeURIComponent(data.filename)}`;
      return fullUrl;

    } catch (error) {
      console.error('Erro ao salvar imagem no servidor:', error);
      return null;
    }
  }
  const [valueQrCode, setValueQrCode] = useState<string | null>(null);
  const [loadingQrCode, setLoadingQrCode] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  async function getQrCodeValue() {
    setLoadingQrCode(true);
    if (capturedPhoto) {
      const url = await savePhotoToServer(capturedPhoto);
      setValueQrCode(url);
    }
    setLoadingQrCode(false);
  }

  // Cálculo responsivo para web
  const isWeb = Platform.OS === 'web';
  let btnMainSize = 88;
  let btnSecSize = 60;
  let iconMainSize = 48;
  let iconSecSize = 32;
  let countFontSizeWeb = 80;
  if (isWeb && typeof window !== 'undefined') {
    // Baseado em 22% e 15% da largura do quadro (95vw, max 400px)
    const quadroW = Math.min(window.innerWidth * 0.95, 400);
    btnMainSize = quadroW * 0.22;
    btnSecSize = quadroW * 0.15;
    iconMainSize = btnMainSize * 0.6;
    iconSecSize = btnSecSize * 0.6;
    countFontSizeWeb = quadroW * 0.18;
  }

  // Remove o early return do backend
  // ...fluxo normal da câmera, preview, etc...
  return (
    <>

      {
        // CAMERA PERMISSION
        !permission ? <View /> :
          !permission.granted ? (
            <View style={{
              flex: 1,
              backgroundColor: '#111',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 0,
              paddingTop: 0,
            }}>
              <Text style={{ textAlign: 'center', paddingBottom: 10, color: '#fff' }}>Precisamos de permissão para usar a câmera</Text>
              <Button onPress={requestPermission} title="Conceder permissão" />
            </View>
          ) :
            step === 'camera-loading' ? (
              <View style={{
                flex: 1,
                backgroundColor: '#111',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 0,
                paddingTop: 0,
                position: 'relative',
              }}>
                {/* Carregamento animado igual ao download */}
                <View style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: 'rgba(0, 0, 0, 0.33)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10,
                }}>
                  <Text style={{ fontSize: 28, color: '#fff', marginBottom: 20 }}>Abrindo câmera...</Text>
                  <View style={{ marginTop: 32 }}>
                    <ActivityIndicator size="large" color="#007AFF" />
                  </View>
                </View>
              </View>
            ) :
              step === 'camera' ? (
            
                  <View style={{ flex: 1, backgroundColor: '#000' }}>
                    <CameraView
                      style={{ flex: 1, width: '100%', height: '100%' }}
                      facing={facing}
                      ref={cameraRef}
                      onCameraReady={() => setCameraReady(true)}
                    >
                      {preCaptureCount !== null && preCaptureCount > 0 && (
                        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10, backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
                          <Text style={{ fontSize: 80, color: '#fff', fontWeight: 'bold' }}>{preCaptureCount}</Text>
                        </View>
                      )}
                      <View style={{
                        position: 'absolute',
                        bottom: 32,
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'center', // centraliza o botão de captura
                        alignItems: 'center',
                        paddingHorizontal: 24,
                      }} pointerEvents={preCaptureCount !== null && preCaptureCount > 0 ? 'none' : 'auto'}>
                        {/* Botão de alternar câmera removido */}
                        <TouchableOpacity
                          style={{
                            backgroundColor: '#007AFF',
                            borderRadius: 40,
                            padding: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onPress={handleCapture}
                          disabled={preCaptureCount !== null && preCaptureCount > 0 || !cameraReady}
                        >
                          <Ionicons name="camera" size={56} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </CameraView>
                  </View>
            
              ) :
                step === 'preview' && capturedPhoto ? (
                  <View style={{
                    flex: 1,
                    backgroundColor: '#fff',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 0,
                    paddingTop: 0,
                  }}>
                    <View style={{
                      width: '95%',
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
                    }}>
                      <Image source={{ uri: capturedPhoto }} style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 24 }} />
                    </View>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 80,
                      paddingHorizontal: 24,
                      width: '100%',
                      marginTop: 15,
                    }}>
                      <TouchableOpacity style={{
                        backgroundColor: '#E5E7EB',
                        paddingVertical: 12,
                        paddingHorizontal: 30,
                        borderRadius: 12,
                        marginHorizontal: 4,
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        minWidth: 120,
                        alignItems: 'center',
                      }} onPress={() => { setCapturedPhoto(null); setStep('camera'); }} disabled={loadingPreview}>
                        <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 16 }}>Refazer</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{
                        backgroundColor: loadingPreview ? '#93c5fd' : '#2563EB',
                        paddingVertical: 20,
                        paddingHorizontal: 40,
                        borderRadius: 12,
                        marginHorizontal: 4,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 4,
                        elevation: 3,
                        minWidth: 120,
                        alignItems: 'center',
                        opacity: loadingPreview ? 0.7 : 1,
                      }}
                        onPress={async () => {
                          setLoadingPreview(true);
                          await getQrCodeValue();
                          setStep('qrcode');
                          setLoadingPreview(false);
                        }}
                        disabled={loadingPreview}
                      >
                        {loadingPreview ? (
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Carregando...</Text>
                        ) : (
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Continuar</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) :
                  step === 'qrcode' ? (
                    <View style={{
                      flex: 1,
                      backgroundColor: '#fff',
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 0,
                      paddingTop: 0,
                    }}>
                      <View style={{
                        width: '95%',
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
                      }}>
                        <Image source={{ uri: capturedPhoto }} style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 24 }} />
                        <View style={{ position: 'absolute', right: 24, bottom: 70, zIndex: 10 }}>
                          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 6, minWidth: 100, minHeight: 120, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 12, alignSelf: 'flex-start', color: '#222' }}>faça o download</Text>
                            <View style={{ backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#bbb', width: 90, height: 90, alignItems: 'center', justifyContent: 'center' }}>
                              {loadingQrCode ? (
                                <Text style={{ fontSize: 12,  color: '#111',}}>Gerando QR Code...</Text>
                              ) : valueQrCode ? (
                                <QrCodeUniversal value={valueQrCode} size={70} />
                              ) : null}
                            </View>
                          </View>
                        </View>
                        {/* Modal "Obrigado" aparece sobre a imagem */}
                        {showThanksModal && (
                          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center', zIndex: 20 }}>
                            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', justifyContent: 'center', minWidth: 280, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 }}>
                              <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 8, textAlign: 'center' }}>Obrigado!</Text>
                              <Text style={{ fontSize: 16, color: '#444', marginBottom: 24, textAlign: 'center' }}>Faça o download através do QR code.</Text>
                            </View>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity
                        style={{ backgroundColor: '#2563EB', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 6, marginTop: 10, minWidth: 220, alignItems: 'center', alignSelf: 'center' }}
                        onPress={async () => {
                          setShowThanksModal(true);      // mostra o modal
                          setTimeout(() => {
                            setShowThanksModal(false);   // oculta o modal após 3 segundos
                            setStep('thanks');           // muda para o step 'thanks'
                          }, 3000);
                        }}
                      >
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Finalizar</Text>
                      </TouchableOpacity>
                    </View>
                  ) :
                    step === 'thanks' ? (
                      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, width: '100%' }}>
                        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
                          <Image source={require('@/assets/images/logo.png')} style={{ width: 220, height: 220, resizeMode: 'contain' }} />
                        </View>
                        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 8, textAlign: 'center' }}>Obrigado por utilizar nosso serviço!</Text>
                        <Text style={{ fontSize: 16, color: '#444', marginBottom: 24, textAlign: 'center' }}>
                          Sua foto foi salva com sucesso. Agora você pode visualizar ou compartilhar conforme desejar.
                        </Text>
                        <View style={{ backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#bbb', width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
                          {loadingQrCode ? (
                                <Text style={{ fontSize: 12,  color: '#111',}}>Gerando QR Code...</Text>
                          ) : (
                            valueQrCode && <QrCodeUniversal value={valueQrCode} size={160} />
                          )}
                        </View>
                        <TouchableOpacity
                          style={{ backgroundColor: '#2563EB', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 6, marginTop: 36, minWidth: 220, alignItems: 'center', alignSelf: 'center' }}
                          onPress={() => router.push('/')}
                        >
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Finalizar</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null
      }

    </>
  );
}