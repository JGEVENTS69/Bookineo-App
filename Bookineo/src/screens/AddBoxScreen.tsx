import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { supabase } from '../services/supabase';
import { decode } from 'base64-arraybuffer';
import { Camera, X } from 'lucide-react-native';
import * as Location from 'expo-location';

interface BookBox {
  name: string;
  description: string;
  photo_url: string;
  latitude: number;
  longitude: number;
}

const { width } = Dimensions.get('window');

const AddBoxScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [bookBox, setBookBox] = useState<BookBox>({
    name: '',
    description: '',
    photo_url: '',
    latitude: 48.8566,
    longitude: 2.3522,
  });
  const [image, setImage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    const setupLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La géolocalisation est nécessaire pour placer votre boîte à livres');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        setBookBox(prev => ({
          ...prev,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }));
      } catch (error) {
        console.error('Erreur de géolocalisation:', error);
        Alert.alert('Erreur', 'Impossible de récupérer votre position');
      }
    };

    getCurrentUser();
    setupLocation();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'L\'accès à la galerie est nécessaire pour ajouter une photo'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImage(result.assets[0].base64);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Current userId:', userId);
      
      if (!userId) {
        console.log('No user ID found');
        Alert.alert('Erreur', 'Utilisateur non authentifié');
        return;
      }

      if (!bookBox.name || !bookBox.description || !image) {
        Alert.alert('Champs manquants', 'Merci de remplir tous les champs requis');
        return;
      }

      const fileExt = 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Attempting to upload image...');

      const { error: storageError, data: storageData } = await supabase.storage
        .from('book_boxes')
        .upload(filePath, decode(image), {
          contentType: 'image/jpeg',
          upsert: true
        });

      console.log('Storage response:', { error: storageError, data: storageData });

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('book_boxes')
        .getPublicUrl(filePath);

      console.log('Attempting to insert with data:', {
        ...bookBox,
        photo_url: publicUrl,
        created_id: userId,
      });

      const { error, data } = await supabase
        .from('book_boxes')
        .insert([{
          ...bookBox,
          photo_url: publicUrl,
          created_id: userId,
        }])
        .select();

      console.log('Insert response:', { error, data });

      if (error) throw error;

      Alert.alert(
        'Succès !',
        'Votre boîte à livres a été ajoutée avec succès',
        [{ text: 'OK', onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Map' }],
          });
        }}]
      );
    } catch (error) {
      console.error('Detailed error:', error);
      Alert.alert(
        'Erreur',
        'Un problème est survenu lors de l\'ajout de la boîte à livres'
      );
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2].map((num) => (
        <View
          key={num}
          style={[
            styles.stepDot,
            step === num && styles.activeStepDot,
            step > num && styles.completedStepDot,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.stepContainer}
    >
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nom de la boîte à livres</Text>
        <TextInput
          style={styles.input}
          value={bookBox.name}
          onChangeText={(text) => setBookBox({ ...bookBox, name: text })}
          placeholder="Ex: Boîte du Parc Central"
          placeholderTextColor="#A0AEC0"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bookBox.description}
          onChangeText={(text) => setBookBox({ ...bookBox, description: text })}
          placeholder="Décrivez l'emplacement et l'état de la boîte..."
          placeholderTextColor="#A0AEC0"
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={[styles.photoContainer, image && styles.photoContainerWithImage]}
        onPress={pickImage}
      >
        {image ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${image}` }}
              style={styles.preview}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setImage(null)}
            >
              <X size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoPlaceholder}>
            <Camera size={32} color="#A0AEC0" />
            <Text style={styles.photoText}>Ajouter une photo</Text>
          </View>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.label}>Emplacement de la boîte</Text>
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={userLocation ? {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          } : undefined}
          onPress={(e) => {
            setBookBox({
              ...bookBox,
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude,
            });
          }}
        >
          <Marker
            coordinate={{
              latitude: bookBox.latitude,
              longitude: bookBox.longitude,
            }}
          >
            <Image 
              source={require('../assets/icons/book-marker.png')}
              style={styles.customMarker}
            />
          </Marker>
        </MapView>
      </View>
      <Text style={styles.mapHelper}>
        Appuyez sur la carte pour placer le marqueur à l'emplacement exact de la boîte
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          {step === 1 ? 'Informations' : 'Localisation'}
        </Text>
        {renderStepIndicator()}
        {step === 1 ? renderStep1() : renderStep2()}
        
        <TouchableOpacity
          style={[
            styles.mainButton,
            (!bookBox.name || !bookBox.description || !image) && styles.disabledButton
          ]}
          onPress={step === 1 ? () => setStep(2) : handleSubmit}
          disabled={step === 1 ? (!bookBox.name || !bookBox.description || !image) : false}
        >
          <Text style={styles.mainButtonText}>
            {step === 1 ? 'Suivant' : 'Ajouter la boîte'}
          </Text>
        </TouchableOpacity>

        {step === 2 && (
          <TouchableOpacity
            style={styles.backTextButton}
            onPress={() => setStep(1)}
          >
            <Text style={styles.backButtonText}>Retour aux informations</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  activeStepDot: {
    backgroundColor: '#4299E1',
    width: 24,
  },
  completedStepDot: {
    backgroundColor: '#48BB78',
  },
  stepContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  photoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 200,
  },
  photoContainerWithImage: {
    borderStyle: 'solid',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    marginTop: 12,
    fontSize: 16,
    color: '#A0AEC0',
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 400,
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  customMarker: {
    width: 40,
    height: 40,
    resizeMode: 'contain'
  },
  mapHelper: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  mainButton: {
    backgroundColor: '#4299E1',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 12,
  },
  mainButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  backTextButton: {
    padding: 12,
    marginBottom: 24,
  },
  backButtonText: {
    color: '#4A5568',
    textAlign: 'center',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
  },
});

export default AddBoxScreen;