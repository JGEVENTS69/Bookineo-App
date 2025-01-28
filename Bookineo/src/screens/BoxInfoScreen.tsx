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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';



const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BoxInfoScreen = ({ route, navigation }) => {
  const { selectedBox } = route.params; // Récupérer les données transmises depuis MapScreen
  const [isLiked, setIsLiked] = useState(false);
  const headerImageScale = new Animated.Value(1);

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    Animated.spring(headerImageScale, {
      toValue: isLiked ? 1 : 1.1,
      useNativeDriver: true,
    }).start();
  };

  if (!selectedBox) {
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
    <ScrollView bounces={true}>
      {/* Header Image */}
      <View style={styles.headerContainer}>
        <Animated.Image
          source={{ uri: selectedBox.photo_url }}
          style={[styles.headerImage, { transform: [{ scale: headerImageScale }] }]}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
          style={styles.headerOverlay}
        >
          <View style={styles.headerContent}>
            <View style={styles.bookCountBadge}>
              <MaterialCommunityIcons name="archive-marker" size={18} color="#3a7c6a" />
              <Text style={styles.bookCountText}>
                {selectedBox.books_count || 0} visites
              </Text>
            </View>
            <Text style={styles.title}>{selectedBox.name}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: selectedBox.creator_avatar || 'https://picsum.photos/40/40' }}
              style={styles.avatar}
            />
            <View style={styles.userTexts}>
              <Text style={styles.username}>
                {selectedBox.creator_username || 'Utilisateur inconnu'}
              </Text>
              <Text style={styles.date}>
                Ajoutée le {new Date(selectedBox.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLikePress}
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
          <Text style={styles.description}>
            {selectedBox.description || "Aucune description disponible."}
          </Text>
        </View>

        {/* Location Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emplacement</Text>
          <View style={styles.mapPreview}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: selectedBox.latitude,
                longitude: selectedBox.longitude,
                latitudeDelta: 0.01, // Niveau de zoom
                longitudeDelta: 0.01, // Niveau de zoom
              }}
              scrollEnabled={true} // Désactive le déplacement de la carte
              zoomEnabled={true} // Désactive le zoom
              rotateEnabled={true} // Désactive la rotation
            >
              <Marker
                coordinate={{
                  latitude: selectedBox.latitude,
                  longitude: selectedBox.longitude,
                }}
                title={selectedBox.name}
                description="Boîte à livres"
              >
                <View style={styles.markerContainer}>
                  <Image
                    source={require('../assets/icons/book-marker.png')}
                    style={styles.markerImage}
                  />
                </View>
              </Marker>
            
            </MapView>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="navigate" size={20} color="white" />
            <Text style={styles.primaryButtonText}>S'y rendre</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="camera" size={20} color="#3a7c6a" />
            <Text style={styles.secondaryButtonText}>Marqué comme visité</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10, 
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
    backgroundColor: '#6C5CE7',
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
    overflow: 'hidden',
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
    gap: 10,
  },
  bookCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 245, 245, 1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  bookCountText: {
    color: '#3a7c6a',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
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
    gap: 10,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3a7c6a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
    maxWidth: '100%',
  },
  secondaryButtonText: {
    color: '#6C5CE7',
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerImage: {
    width: 50, // Ajustez la taille selon vos besoins
    height: 50, // Ajustez la taille selon vos besoins
    resizeMode: 'contain', // Pour s'assurer que l'image conserve ses proportions
  },
  
});

export default BoxInfoScreen;