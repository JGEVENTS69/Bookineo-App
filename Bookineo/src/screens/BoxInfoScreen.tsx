import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Share, Linking } from 'react-native';
import { supabase } from 'src/services/supabase';
import { User, Share2, Map, ChevronLeft, ExternalLink } from 'lucide-react-native';

interface BookBox {
  id: string;
  name: string;
  photo_url: string;
  latitude: number;
  longitude: number;
  created_id: string;
  creator_username?: string;
  description?: string;
  books_count?: number;
}

const BoxInfoScreen = ({ route, navigation }) => {
  const { boxId } = route.params;
  const [bookBox, setBookBox] = useState<BookBox | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookBoxDetails = async () => {
      const { data, error } = await supabase
        .from('book_boxes')
        .select('*')
        .eq('id', boxId)
        .single();

      if (!error && data) {
        setBookBox(data);
      }
      setLoading(false);
    };

    fetchBookBoxDetails();
  }, [boxId]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvrez cette boîte à livres: ${bookBox?.name} à ${bookBox?.latitude}, ${bookBox?.longitude}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${bookBox?.latitude},${bookBox?.longitude}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (!bookBox) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Boîte à livres introuvable</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: bookBox.photo_url }} style={styles.bookBoxImage} />
        
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.bookBoxName}>{bookBox.name}</Text>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Share2 size={24} color="#0066CC" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{bookBox.books_count || 0}</Text>
              <Text style={styles.statLabel}>Livres</Text>
            </View>
          </View>

          <View style={styles.creatorContainer}>
            <User size={20} color="#666" />
            <Text style={styles.creatorText}>
              Ajouté par {bookBox.creator_username || 'Utilisateur'}
            </Text>
          </View>

          {bookBox.description && (
            <Text style={styles.description}>{bookBox.description}</Text>
          )}

          <TouchableOpacity style={styles.mapButton} onPress={openInMaps}>
            <Map size={20} color="#fff" />
            <Text style={styles.mapButtonText}>Voir sur la carte</Text>
            <ExternalLink size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  bookBoxImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 44,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  contentContainer: {
    padding: 20,
    marginTop: -30,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bookBoxName: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  shareButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
  },
  creatorText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 20,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BoxInfoScreen;