import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, StatusBar } from 'react-native';
import { supabase } from '../services/supabase';
import { Heart, Trash2 } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

const FavorisScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error.message);
    } else {
      setUser(data.user);
    }
  };

  const fetchFavorites = async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('*, book_boxes(*, photo_url, created_at, created_id:users(username))')
      .eq('user_id', user.id);

    if (error) {
      console.error('Erreur lors de la récupération des favoris:', error);
    } else {
      setFavorites(data);
    }

    setLoading(false);
  };

  const removeFavorite = async (favoriteId) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId);

    if (!error) {
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const renderEmptyState = () => (
    <Animated.View 
      entering={FadeIn} 
      style={styles.emptyStateContainer}
    >
      <Heart size={80} color="#3a7c6a" />
      <Text style={styles.emptyStateTitle}>Aucune boîte dans les favoris</Text>
      <Text style={styles.emptyStateSubtitle}>
        Explorez les environs et commencez à ajouter vos boîtes préférées.</Text>
      <Text style={styles.emptyScroll}>
        Si aucune boîte n'apparaît, scrollez vers le bas pour actualiser.
      </Text>
    </Animated.View>
  );

  const renderFavoriteItem = ({ item }) => (
    <Animated.View 
      layout={Layout.springify()}
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.favoriteCard}
    >
      <View style={styles.cardContent}>
        <Image
          source={{ uri: item.book_boxes?.photo_url || 'https://via.placeholder.com/150' }}
          style={styles.bookImage}
          blurRadius={1}
        />
        <View style={styles.textContainer}>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {item.book_boxes?.name || 'Nom inconnu'}
          </Text>
          <Text style={styles.bookDescription} numberOfLines={2}>
            Par {item.book_boxes.created_id.username}
          </Text>
          <Text style={styles.bookDate}>
            Ajouté le {item.book_boxes?.created_at ? new Date(item.book_boxes.created_at).toLocaleDateString() : 'Date inconnue'}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => removeFavorite(item.id)} 
          style={styles.removeButton}
        >
          <Trash2 size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFavoriteItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchFavorites}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 5,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  favoriteCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  bookImage: {
    width: 80,
    height: 80,
    borderRadius: 15,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 5,
  },
  bookDescription: {
    fontSize: 15,
    color: '#34495E',
    marginBottom: 3,
  },
  bookDate: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  removeButton: {
    padding: 10,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
  },
emptyScroll: {
  fontSize: 16,
  color: '#7F8C8D',
  textAlign: 'center',
  marginTop: 50,
  paddingHorizontal: 40,
},
});

export default FavorisScreen;