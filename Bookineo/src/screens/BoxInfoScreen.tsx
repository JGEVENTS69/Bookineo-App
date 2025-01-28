import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { 
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5 
} from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BoxInfoScreen = ({ route, navigation }) => {
  const { boxId } = route.params;
  const [bookBox, setBookBox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchBookBoxDetails = async () => {
      // Simulation pour l'exemple
      setBookBox({
        name: "Boîte à Livres du Parc",
        photo_url: "https://picsum.photos/800/400",
        description: "Une belle boîte à livres située dans un endroit calme et verdoyant. Parfait pour les amateurs de lecture qui souhaitent découvrir de nouveaux livres ou partager leurs coups de cœur.",
        latitude: 48.8566,
        longitude: 2.3522,
        creator_username: "Jean Dupont",
        creator_avatar: "https://picsum.photos/40/40",
        books_count: 42,
        likes_count: 156,
        created_at: "2024-01-15"
      });
      setLoading(false);
    };

    fetchBookBoxDetails();
  }, [boxId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  if (!bookBox) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Boîte à livres introuvable</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView bounces={false}>
        {/* Header Image */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: bookBox.photo_url }}
            style={styles.headerImage}
          />
          <BlurView intensity={80} style={styles.headerOverlay}>
            <View style={styles.headerContent}>
              <View style={styles.bookCountBadge}>
                <MaterialCommunityIcons name="book-open-page-variant" size={16} color="white" />
                <Text style={styles.bookCountText}>{bookBox.books_count} livres</Text>
              </View>
              <Text style={styles.title}>{bookBox.name}</Text>
            </View>
          </BlurView>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* User Info */}
          <View style={styles.userInfoContainer}>
            <View style={styles.userInfo}>
              <Image
                source={{ uri: bookBox.creator_avatar }}
                style={styles.avatar}
              />
              <View style={styles.userTexts}>
                <Text style={styles.username}>{bookBox.creator_username}</Text>
                <Text style={styles.date}>
                  Créé le {new Date(bookBox.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setIsLiked(!isLiked)}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={24}
                  color={isLiked ? "#FF4B4B" : "#666"}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos de cette boîte</Text>
            <Text style={styles.description}>{bookBox.description}</Text>
          </View>

          {/* Location Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emplacement</Text>
            <View style={styles.mapPreview}>
              <FontAwesome5 name="map-marked-alt" size={32} color="#666" />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.primaryButton}>
              <Ionicons name="navigate" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Itinéraire</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="camera" size={20} color="#0066FF" />
              <Text style={styles.secondaryButtonText}>Ajouter une photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#0066FF',
    borderRadius: 12,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    height: SCREEN_HEIGHT * 0.6,
    width: SCREEN_WIDTH,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  headerContent: {
    gap: 12,
  },
  bookCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 102, 255, 0.8)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  bookCountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 20,
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userTexts: {
    gap: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 13,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
  },
  mapPreview: {
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066FF',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#0066FF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BoxInfoScreen;