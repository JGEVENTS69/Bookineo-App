// Bookineo/src/screens/MapScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from 'src/services/supabase';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LocateFixed, Search, MapPin, User, Clock, Star, X, HousePlus, MapPinned, Info } from 'lucide-react-native';
import { getDistance } from 'geolib';

interface BookBox {
  id: string;
  name: string;
  photo_url: string;
  latitude: number;
  longitude: number;
  created_id: string;
  creator_username?: string;
}

const MapScreen = ({ navigation }) => {
  const mapRef = useRef<MapView | null>(null);
  const searchBarAnimation = useRef(new Animated.Value(0)).current;
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [bookBoxes, setBookBoxes] = useState<BookBox[]>([]);
  const [filteredBookBoxes, setFilteredBookBoxes] = useState<BookBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [selectedBookBox, setSelectedBookBox] = useState<BookBox | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  const handleBookBoxPress = async (box: BookBox) => {
    if (mapRef.current) {
      if (!box.creator_username) {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('id', box.created_id)
          .single();

        if (!error && data) {
          box.creator_username = data.username;
        }
      }

      mapRef.current.animateToRegion(
        {
          latitude: box.latitude,
          longitude: box.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );
      setSelectedBookBox(box);
      getVisitCount(box.id);
      getAverageRating(box.id);
    }
  };

  const getVisitCount = async (boxId: string) => {
    const { count, error } = await supabase
      .from('box_visits')
      .select('id', { count: 'exact' })
      .eq('box_id', boxId);

    if (!error && count !== null) {
      setVisitCount(count);
    }
  };

  const getAverageRating = async (boxId: string) => {
    const { data, error } = await supabase
      .from('box_visits')
      .select('rating')
      .eq('box_id', boxId);

    if (!error && data && data.length > 0) {
      const ratings = data.map((visit) => visit.rating);
      const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      setAverageRating(average);
    } else {
      setAverageRating(null); // Si aucune visite n'est trouvée, affichez null
    }
  };

  const recenterToUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000
      );
    }
  };

  const toggleSearchBar = () => {
    const toValue = showSearchBar ? 0 : 1;
    setShowSearchBar(!showSearchBar);

    Animated.spring(searchBarAnimation, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 40
    }).start();
  };

  const openNavigationInfo = () => {
    if (selectedBookBox) {
      navigation.navigate('BoxInfoScreen', { selectedBox: selectedBookBox });
    }
  };

  const handleOutsidePress = () => {
    setSelectedBookBox(null);
    if (showSearchBar) {
      toggleSearchBar();
    }
  };

  const refreshData = async () => {
    const { data, error } = await supabase.from('book_boxes').select('*');
    if (!error && data) {
      setBookBoxes(data);
      if (userLocation) {
        const filtered = data.filter((box) =>
          getDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: box.latitude, longitude: box.longitude }
          ) <= 10000
        );
        setFilteredBookBoxes(filtered);
      }
    }
  };

  useEffect(() => {
    const initializeMap = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(newRegion);
      setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });

      const { data, error } = await supabase.from('book_boxes').select('*');
      if (!error && data) {
        setBookBoxes(data);
        const filtered = data.filter((box) =>
          getDistance(
            { latitude: location.coords.latitude, longitude: location.coords.longitude },
            { latitude: box.latitude, longitude: box.longitude }
          ) <= 10000
        );
        setFilteredBookBoxes(filtered);
      }

      setLoading(false);
    };

    initializeMap();
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshData, 10000); // Rafraîchir toutes les 10 secondes
    return () => clearInterval(interval);
  }, [userLocation]);

  useEffect(() => {
    const filtered = bookBoxes.filter((box) =>
      box.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBookBoxes(filtered);
  }, [searchQuery, bookBoxes]);

  if (loading || !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  const searchBarWidth = searchBarAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '80%']
  });

  const searchBarOpacity = searchBarAnimation.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0, 1]
  });

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {filteredBookBoxes.map((box) => (
            <Marker
              key={box.id}
              coordinate={{ latitude: box.latitude, longitude: box.longitude }}
              onPress={() => handleBookBoxPress(box)}
            >
              <View style={styles.markerContainer}>
                <Image
                  source={require('../assets/icons/book-marker.png')}
                  style={styles.markerImage}
                />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Barre de recherche modernisée */}
        <View style={styles.searchBarContainer}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={toggleSearchBar}
          >
            <Search size={24} color="#3a7c6a" />
          </TouchableOpacity>

          <Animated.View style={[
            styles.searchInputContainer,
            {
              width: searchBarWidth,
              opacity: searchBarOpacity
            }
          ]}>
            <Search size={20} color="#9e9e9e" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une boîte à livres..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9e9e9e"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <X size={18} color="#9e9e9e" />
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>

        <TouchableOpacity style={styles.recenterButton} onPress={recenterToUserLocation}>
          <LocateFixed size={24} color="#3a7c6a" />
        </TouchableOpacity>

        {selectedBookBox && (
          <Animated.View style={styles.bookBoxInfoContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>{selectedBookBox.name}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedBookBox(null)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedBookBox.photo_url && (
              <Image
                source={{ uri: selectedBookBox.photo_url }}
                style={styles.bookBoxImage}
              />
            )}

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MapPin size={20} color="#3a7c6a" />
                <Text style={styles.statText}>
                  {userLocation
                    ? `${(getDistance(
                      { latitude: userLocation.latitude, longitude: userLocation.longitude },
                      { latitude: selectedBookBox.latitude, longitude: selectedBookBox.longitude }
                    ) / 1000).toFixed(1)} km`
                    : 'N/A'}
                </Text>
              </View>

              <View style={styles.statItem}>
                <MaterialCommunityIcons name="archive-marker-outline" size={20} color="#3a7c6a" />
                <Text style={styles.statText}>{visitCount !== null ? `${visitCount} visites` : 'N/A'}</Text>
              </View>

              <View style={styles.statItem}>
                <Star size={20} color="#3a7c6a" />
                <Text style={styles.statText}>
                  {averageRating !== null ? `${averageRating.toFixed(1)}/5` : `${visitCount}/5`}
                </Text>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              <View style={styles.tag}>
                <User size={16} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.tagText}>
                  Ajouté par {selectedBookBox.creator_username || 'Utilisateur inconnu'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.navigateButton} onPress={openNavigationInfo}>
              <Info size={20} color="white" />
              <Text style={styles.navigateButtonText}>Voir les détails</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60
  },
  markerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },

  // Nouvelle section de barre de recherche
  searchBarContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  searchInputContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  clearButton: {
    padding: 5,
  },

  recenterButton: {
    position: 'absolute',
    top: 80,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  bookBoxInfoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    flexShrink: 1,
    marginRight: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a7c6a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  bookBoxImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  navigateButton: {
    backgroundColor: '#3a7c6a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  navigateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
});

export default MapScreen;