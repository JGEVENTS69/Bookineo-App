import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  Text,
  Linking,
  TouchableWithoutFeedback,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from 'src/services/supabase';
import { LocateFixed, Navigation, MapPin, User, Clock, Star, X, HousePlus, MapPinned, Info } from 'lucide-react-native';
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

  const openNavigationInfo = () => {
    if (selectedBookBox) {
      navigation.navigate('BoxInfoScreen', { boxId: selectedBookBox.id });
    }
  };

  const handleOutsidePress = () => {
    setSelectedBookBox(null);
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

  if (loading || !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

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
          {bookBoxes.map((box) => (
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
        <TouchableOpacity style={styles.recenterButton} onPress={recenterToUserLocation}>
          <LocateFixed size={30} color="black" />
        </TouchableOpacity>
        {selectedBookBox && (
          <View style={styles.bookBoxInfoContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>{selectedBookBox.name}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedBookBox(null)}>
                <X size={24} color="black" />
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
                <MapPin size={24} color="#3a7c6a" />
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
                <MapPinned size={24} color="#3a7c6a" />
                <Text style={styles.statText}>5-10 min</Text>
              </View>

              <View style={styles.statItem}>
                <Star size={24} color="#3a7c6a" />
                <Text style={styles.statText}>4.2 (33)</Text>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              <View style={styles.tag}>
                <HousePlus size={16} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.tagText}>
                  Ajouté par {selectedBookBox.creator_username || 'Utilisateur inconnu'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.navigateButton} onPress={openNavigationInfo}>
              <Info size={24} color="white" />
              <Text style={styles.navigateButtonText}>Détails de la boîte</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerContainer: { alignItems: 'center', justifyContent: 'center', width: 60, height: 60 },
  markerImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  recenterButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bookBoxInfoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    padding: 16,
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    color: '#333',
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
    backgroundColor: 'rgba(124, 124, 124, 0.57)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  tagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },

  bookBoxImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'cover',
  },

  navigateButton: {
    backgroundColor: '#3a7c6a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
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