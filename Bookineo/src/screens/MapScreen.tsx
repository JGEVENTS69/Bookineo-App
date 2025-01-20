import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from 'src/services/supabase';
import { LucideCrosshair, MapPin, Navigation } from 'lucide-react-native';

const MapScreen = () => {
const mapRef = useRef(null);
const [region, setRegion] = useState(null);
const [bookBoxes, setBookBoxes] = useState([]);
const [loading, setLoading] = useState(true);

const requestLocationPermission = async () => {
try {
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
Alert.alert(
'Permission refusée',
'Nous avons besoin de votre position pour afficher les boîtes à livres près de chez vous.',
[
{ text: 'Annuler', style: 'cancel' },
{ text: 'Paramètres', onPress: () => Location.openSettings() }
]
);
return false;
}
return true;
} catch (error) {
console.error('Erreur de permission:', error);
return false;
}
};

const updateUserLocation = async () => {
try {
const location = await Location.getCurrentPositionAsync({
accuracy: Location.Accuracy.Balanced
});


const newRegion = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  setRegion(newRegion);
  return newRegion;
} catch (error) {
  console.error('Erreur de localisation:', error);
  return null;
}
};

useEffect(() => {
const initializeMap = async () => {
const hasPermission = await requestLocationPermission();
if (!hasPermission) {
setLoading(false);
return;
}


await updateUserLocation();
  setLoading(false);
};

initializeMap();
}, []);

useEffect(() => {
const fetchBookBoxes = async () => {
try {
const { data, error } = await supabase
.from('book_boxes')
.select('*');


if (error) throw error;
    setBookBoxes(data || []);
  } catch (error) {
    console.error('Erreur lors du chargement des boîtes:', error);
    Alert.alert('Erreur', 'Impossible de charger les boîtes à livres');
  }
};

fetchBookBoxes();
}, []);

const handleLocateUser = async () => {
const newRegion = await updateUserLocation();
if (newRegion && mapRef.current) {
mapRef.current.animateToRegion(newRegion, 1000);
}
};

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
     provider={PROVIDER_DEFAULT}
     initialRegion={region}
     showsUserLocation
     showsMyLocationButton={false}
     showsCompass
     rotateEnabled
     loadingEnabled
     urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
     userInterfaceStyle="light"
   >
{bookBoxes.map((box) => (
<Marker
key={box.id}
coordinate={{
latitude: box.latitude,
longitude: box.longitude
}}
image={require('../assets/icons/book-marker.png')} // Remplacez par le chemin de votre icône
/>
))}
</MapView>


<TouchableOpacity
    style={styles.locateButton}
    onPress={handleLocateUser}
    activeOpacity={0.7}
  >
    <View style={styles.buttonContent}>
      <LucideCrosshair size={28} color="#3a7c6a" />
    </View>
  </TouchableOpacity>
</View>
);
};

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#fff',
},
map: {
...StyleSheet.absoluteFillObject,
},
loadingContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: '#FFFFFF',
},
markerContainer: {
padding: 8,
backgroundColor: '#FFFFFF',
borderRadius: 20,
...Platform.select({
ios: {
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.25,
shadowRadius: 3.84,
},
android: {
elevation: 5,
},
}),
},
locateButton: {
position: 'absolute',
bottom: 24,
right: 24,
backgroundColor: '#FFFFFF',
borderRadius: 30,
...Platform.select({
ios: {
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.25,
shadowRadius: 3.84,
},
android: {
elevation: 5,
},
}),
},
buttonContent: {
width: 48,
height: 48,
justifyContent: 'center',
alignItems: 'center',
},
});

export default MapScreen;