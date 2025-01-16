import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, TouchableOpacity, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from 'src/services/supabase'; // Assurez-vous que le client est bien configuré
import { Crosshair } from 'lucide-react-native'; // Importez l'icône Lucide

const MapScreen = () => {
  const [region, setRegion] = useState(null); // Position de la carte
  const [bookBoxes, setBookBoxes] = useState([]); // Données des boîtes
  const [loading, setLoading] = useState(true); // État du chargement
  const [userLocation, setUserLocation] = useState(null); // Position de l'utilisateur
  const pulseAnim = useState(new Animated.Value(1))[0]; // Animation de pulsation

  // Demander la permission de géolocalisation
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission de localisation requise',
        'Cette application nécessite l\'accès à votre position pour fonctionner correctement.',
        [
          {
            text: 'Annuler',
            onPress: () => console.log('Permission de localisation refusée'),
            style: 'cancel',
          },
          {
            text: 'Paramètres',
            onPress: () => Location.openSettings(),
          },
        ],
        { cancelable: false }
      );
      setLoading(false);
      return false;
    }
    return true;
  };

  // Charger la position actuelle
  useEffect(() => {
    (async () => {
      const permissionGranted = await requestLocationPermission();
      if (!permissionGranted) return;

      const currentLocation = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setUserLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setLoading(false);
    })();
  }, []);

  // Charger les boîtes à livres depuis Supabase
  useEffect(() => {
    const fetchBookBoxes = async () => {
      try {
        const { data, error } = await supabase.from('book_boxes').select('*');
        if (error) {
          console.error('Erreur lors du chargement des boîtes :', error);
          return;
        }
        setBookBoxes(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchBookBoxes();
  }, []);

  // Animation de pulsation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleLocateUser = async () => {
    const currentLocation = await Location.getCurrentPositionAsync({});
    setRegion({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setUserLocation({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3a7c6a" />
      </View>
    );
  }

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3a7c6a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={(region) => setRegion(region)}
      >
        {bookBoxes.map((box) => (
          <Marker
            key={box.id}
            coordinate={{ latitude: box.latitude, longitude: box.longitude }}
            title={box.title}
            description={box.description}
            image={require('src/assets/icons/book-marker.png')}
            style={styles.markerImage}
          />
        ))}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Votre position"
          >
            <View style={styles.markerContainer}>
              <Animated.View style={[styles.userMarker, { transform: [{ scale: pulseAnim }] }]} />
            </View>
          </Marker>
        )}
      </MapView>
      <TouchableOpacity style={styles.locateButton} onPress={handleLocateUser}>
        <Crosshair size={30} color="red" /> {/* Utilisez l'icône Lucide */}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerImage: {
    width: 40, // Largeur souhaitée
    height: 60, // Hauteur souhaitée
    resizeMode: 'contain', // Garde les proportions de l'image
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'blue',
  },
  locateButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 10,
    elevation: 5,
  },
});

export default MapScreen;
