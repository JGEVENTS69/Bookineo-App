// BoxInfoScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, Button } from 'react-native';
import { supabase } from 'src/services/supabase';
import { User } from 'lucide-react-native';

interface BookBox {
  id: string;
  name: string;
  photo_url: string;
  latitude: number;
  longitude: number;
  created_id: string;
  creator_username?: string;
}

const BoxInfoScreen = ({ route, navigation }) => {
  const { boxId } = route.params; // Récupérer l'ID de la boîte depuis la navigation
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (!bookBox) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Book box not found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: bookBox.photo_url }} style={styles.bookBoxImage} />
      <View style={styles.detailsContainer}>
        <Text style={styles.bookBoxName}>{bookBox.name}</Text>
        <View style={styles.creatorContainer}>
          <User size={16} color="black" />
          <Text style={styles.creatorText}>
            Ajouté par {bookBox.creator_username || 'Utilisateur'}
          </Text>
        </View>
        <Text style={styles.locationText}>
          Latitude: {bookBox.latitude}, Longitude: {bookBox.longitude}
        </Text>
      </View>
      
      {/* Bouton pour revenir à la carte (ou au TabNavigator principal) */}
      <Button
        title="Retour à la carte"
        onPress={() => navigation.navigate('Main')} // Navigue vers 'Main', qui est ton TabNavigator
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBoxImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
    borderRadius: 15,
    marginBottom: 20,
  },
  detailsContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  bookBoxName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  creatorText: {
    marginLeft: 5,
    fontSize: 16,
  },
  locationText: {
    fontSize: 16,
    color: '#555',
  },
});

export default BoxInfoScreen;
