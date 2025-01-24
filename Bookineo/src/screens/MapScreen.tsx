// src/screens/MapScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  Text,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from 'src/services/supabase';
import { LocateFixed } from 'lucide-react-native';
import BookBoxCarousel from '../components/BookBoxCarousel';
import { getDistance } from 'geolib';

interface BookBox {
  id: string;
  name: string;
  description: string;
  photo_url: string;
  latitude: number;
  longitude: number;
  creator_id: string;
}

const MapScreen = () => {
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

  const handleBookBoxPress = (box: BookBox) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: box.latitude,
          longitude: box.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );
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
      <BookBoxCarousel bookBoxes={filteredBookBoxes} />
    </View>
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
});

export default MapScreen;