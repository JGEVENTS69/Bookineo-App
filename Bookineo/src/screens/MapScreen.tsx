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
import { LocateFixed, Navigation, X, MapPin, Info, User } from 'lucide-react-native';
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
      // Fetch creator's username if not already fetched
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

  const openGPSNavigation = () => {
    if (selectedBookBox) {
      const { latitude, longitude } = selectedBookBox;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  };

  const navigateToBoxInfo = () => {
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
            <Image source={{ uri: selectedBookBox.photo_url }} style={styles.bookBoxImage} />
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedBookBox(null)}>
              <X size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.distanceContainer}>
              <Navigation size={20} color="black" />
              <Text style={styles.distanceText}>
                {userLocation
                  ? `${getDistance(
                      { latitude: userLocation.latitude, longitude: userLocation.longitude },
                      { latitude: selectedBookBox.latitude, longitude: selectedBookBox.longitude }
                    )} m`
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.bookBoxDetails}>
              <Text style={styles.bookBoxName}>{selectedBookBox.name}</Text>
              <View style={styles.creatorContainer}>
                <User size={16} color="white" />
                <Text style={styles.creatorText}>
                  Ajouté par {selectedBookBox.creator_username || 'Utilisateur'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
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
    height: 60,
  },
  markerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
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
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookBoxInfoContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  bookBoxImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    borderRadius: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 5,
  },
  distanceText: {
    marginLeft: 5,
    fontSize: 14,
  },
  bookBoxDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  bookBoxName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 10,
    width: '48%',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default MapScreen;
