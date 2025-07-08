import React, { useEffect, useState } from 'react';
import {Platform, TouchableOpacity, Text, Linking, View,  ScrollView,   StyleSheet, Modal, ActivityIndicator } from 'react-native';
import api from '../api';
import Constants from 'expo-constants';

function formatDateBR(dateStr: string) {
  // Espera formato YYYY-MM-DD
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

export default function AdminPanel() {
  const [stats, setStats] = useState<{ [date: string]: number }>({});
  const [links, setLinks] = useState<{ filename: string; url: string; dia: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  

  async function fetchPanel() {
    setLoading(true);
    setError(null);
    try {
      // Corrige endpoint para /api/admin
      const res = await api.get(`/admin`);
      if (!res.status) throw new Error('Erro ao buscar painel');
      const { stats, files } = await res.data;
      // Para cada filename, b 
      const linksWithUrl = await Promise.all(
        files.map(async ({ filename, dia }: { filename: string; dia: string }) => {
          try {
            return { filename, dia, url: Constants.expoConfig?.extra?.FRONT_BASE_URL +filename };
          } catch {
            return { filename, dia, url: null };
          }
        })
      );
      setStats(stats);
      setLinks(linksWithUrl);
      setLoading(false);
      setShowModal(false);
    } catch (err: any) {
      setError('Erro ao carregar painel: ' + err.message);
      setLoading(false);
      setShowModal(true);
    }
  }

  useEffect(() => {
    fetchPanel();
  }, []);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 12, color: '#222', fontSize: 16 }}>Carregando painel...</Text>
    </View>
  );
  
const handlePress = (filename: string, url: string | null) => {
  const linkUrl = `${Constants.expoConfig?.extra?.FRONT_BASE_URL || ''}/pages/download?filename=${encodeURIComponent(filename)}`;

  if (Platform.OS === 'web') {
    window.open(linkUrl, '_blank', 'noopener,noreferrer');
  } else if (url) {
    Linking.openURL(url);
  } else {
    console.warn('URL não disponível para o arquivo:', filename);
  }
};


  // Soma total de participações
  const total = Object.values(stats).reduce((acc, n) => acc + n, 0);

  return (
    <View style={styles.bg}>
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Backend indisponível</Text>
            <Text style={styles.modalText}>Não foi possível conectar ao servidor. Verifique se o backend está ativo e tente novamente.</Text>
            <TouchableOpacity style={styles.modalButton} onPress={fetchPanel}>
              <Text style={styles.modalButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {error && <View style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></View>}
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.container}>
        <Text style={styles.title}>Painel Administrativo</Text>
        <View style={styles.card}>
          <Text style={styles.subtitle}>Participações por dia</Text>
          <Text style={styles.totalText}>Total: <Text style={styles.totalQtd}>{total}</Text></Text>
          {Object.entries(stats).length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma participação registrada.</Text>
          ) : (
            Object.entries(stats).map(([dia, qtd]) => (
              <View key={dia} style={styles.statRow}>
                <Text style={styles.statDia}>{formatDateBR(dia)}</Text>
                <Text style={styles.statQtd}>{qtd} {qtd === 1 ? 'participação' : 'participações'}</Text>
              </View>
            ))
         ) }
        </View>
        <View style={styles.card}>
          <Text style={styles.subtitle}>Links das fotos geradas</Text>
          {links.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma foto gerada ainda.</Text>
          ) : (
            links.map(({ filename, dia, url }) => (
             <TouchableOpacity
                    key={filename}
                    onPress={() => handlePress(filename, url)}  
                    style={styles.linkRow}
                  >
                    <Text style={styles.linkDia}>[{formatDateBR(dia)}]</Text>
                    <Text style={[styles.linkItem, !url && { color: '#aaa' }]}>{filename}</Text>
                  </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f8fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#222',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#007AFF',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statDia: {
    fontSize: 16,
    color: '#333',
  },
  statQtd: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  totalText: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  totalQtd: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkDia: {
    fontSize: 15,
    color: '#555',
    marginRight: 8,
  },
  linkItem: {
    fontSize: 15,
    color: '#007AFF',
    textDecorationLine: 'underline',
    flexShrink: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
