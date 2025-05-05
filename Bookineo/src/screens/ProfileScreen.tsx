// Bookineo/src/screens/ProfileScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  Animated,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 200;

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState('favorites');
  const [user, setUser] = useState(null);
  const [favoriteBoxes, setFavoriteBoxes] = useState([]);
  const [visitedBoxes, setVisitedBoxes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = new Animated.Value(0);
  const navigation = useNavigation();

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) {
        console.error(error);
      } else {
        setUser(data);
      }
    }
  };

  const fetchFavoriteBoxes = async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select('box_id')
      .eq('user_id', user.id);
    if (error) {
      console.error(error);
    } else {
      const boxIds = data.map(favorite => favorite.box_id);
      const { data: bookBoxesData, error: bookBoxesError } = await supabase
        .from('book_boxes')
        .select('*')
        .in('id', boxIds);

      if (bookBoxesError) {
        console.error(bookBoxesError);
      } else {
        setFavoriteBoxes(bookBoxesData);
      }
    }
  };

  const fetchVisitedBoxes = async () => {
    const { data: visitData, error: visitError } = await supabase
      .from('box_visits')
      .select('box_id, created_at, rating')
      .eq('visitor_id', user.id);
    if (visitError) {
      console.error(visitError);
    } else {
      const bookBoxIds = visitData.map(visit => visit.box_id);
      const { data: bookBoxesData, error: bookBoxesError } = await supabase
        .from('book_boxes')
        .select('*')
        .in('id', bookBoxIds);

      if (bookBoxesError) {
        console.error(bookBoxesError);
      } else {
        const visitedBoxesWithDates = bookBoxesData.map(bookBox => {
          const visit = visitData.find(v => v.box_id === bookBox.id);
          return {
            ...bookBox,
            visited_at: visit ? visit.created_at : null,
            rating: visit ? visit.rating : null,
          };
        });
        setVisitedBoxes(visitedBoxesWithDates);
      }
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUser().then(() => {
      fetchFavoriteBoxes();
      fetchVisitedBoxes();
    }).finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchUser().then(() => {
      fetchFavoriteBoxes();
      fetchVisitedBoxes();
    });
  }, [user]);

  const headerHeight = scrollY.interpolate({
    inputRange: [-30, HEADER_HEIGHT - 100],
    outputRange: [HEADER_HEIGHT, 90],
    extrapolate: 'clamp'
  });

  const opacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 90],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const handleRemoveFromFavorites = async (boxId) => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir retirer cette boîte à livres de vos favoris ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Retirer",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('box_id', boxId)
                .eq('user_id', user.id);

              if (error) {
                console.error("Erreur lors du retrait des favoris:", error);
                Alert.alert("Erreur", "Impossible de retirer cette boîte à livres de vos favoris.");
              } else {
                // Mettre à jour la liste des boîtes après retrait
                setFavoriteBoxes(prevBoxes => prevBoxes.filter(box => box.id !== boxId));
                Alert.alert("Succès", "La boîte à livres a été retirée de vos favoris avec succès.");
              }
            } catch (error) {
              console.error("Exception lors du retrait des favoris:", error);
              Alert.alert("Erreur", "Une erreur s'est produite lors du retrait des favoris.");
            }
          }
        }
      ]
    );
  };

  const renderBookBox = (bookBox, index) => (
    <View style={styles.bookBox}>
      <Image
        source={{ uri: bookBox.photo_url || 'https://via.placeholder.com/80' }}
        style={styles.bookBoxImage}
      />
      <View style={styles.bookBoxContent}>
        <Text style={styles.bookBoxTitle}>{bookBox.name}</Text>
        <Text style={styles.bookBoxAddTime}>Ajoutée le {new Date(bookBox.created_at).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveFromFavorites(bookBox.id)}
        style={styles.deleteIcon}
      >
        <Ionicons name="heart-dislike-outline" size={28} color="#D8596E" />
      </TouchableOpacity>
    </View>
  );

  const BookVisit = ({ bookBox, index }) => (
    <TouchableOpacity style={styles.bookBox}>
      <Image
        source={{ uri: bookBox.photo_url || 'https://via.placeholder.com/80' }}
        style={styles.bookBoxImage}
      />
      <View style={styles.bookBoxContent}>
        <View style={styles.bookBoxHeader}>
          <Text style={styles.bookBoxTitle}>{bookBox.name}</Text>
          <View style={styles.ratingContainer}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons
                key={i}
                name={i < bookBox.rating ? 'star' : 'star-outline'}
                size={18}
                color="#FFD700"
              />
            ))}
          </View>
        </View>
        <Text style={styles.bookBoxAddTime}>
          Visitée le {bookBox.visited_at ? new Date(bookBox.visited_at).toLocaleDateString() : 'Date inconnue'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header animé */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Image
          source={{ uri: user?.banner_url || 'https://vjwctbtqyipqsnexjukq.supabase.co/storage/v1/object/public/banner//Banner_Empty.png' }}
          style={styles.coverImage}
        />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.avatar_url || 'https://vjwctbtqyipqsnexjukq.supabase.co/storage/v1/object/public/avatars//Empty-PhotoProfile.png' }}
              style={styles.avatar}
            />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.username}</Text>
            <View style={styles.subscriptionContainer}>
              <View style={styles.metadataItem2}>
                <Text style={user?.subscription ? styles.subscriptionTextPremium : styles.subscriptionTextFreemium}>
                  {user?.subscription ? 'PREMIUM' : 'FREEMIUM'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.userMetadata}>
            <View style={styles.metadataItem}>
              <MaterialCommunityIcons name="email" size={22} color="#666" />
              <Text style={styles.metadataText}>{user?.email}</Text>
            </View>
            <View style={styles.metadataItem}>
              <MaterialCommunityIcons name="calendar-clock" size={22} color="#666" />
              <Text style={styles.metadataText}>Membre depuis le {new Date(user?.created_at).toLocaleDateString()}. </Text>
            </View>
          </View>

          <View style={styles.stats}>
            <TouchableOpacity
              style={[styles.statItem, activeTab === 'favorites' && styles.activeStatItem]}
              onPress={() => setActiveTab('favorites')}
            >
              <Text style={[styles.statNumber, activeTab === 'favorites' && styles.activeStatText]}>{favoriteBoxes.length}</Text>
              <Text style={[styles.statLabel, activeTab === 'favorites' && styles.activeStatText]}>Boîtes favoris</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statItem, activeTab === 'visited' && styles.activeStatItem]}
              onPress={() => setActiveTab('visited')}
            >
              <Text style={[styles.statNumber, activeTab === 'visited' && styles.activeStatText]}>{visitedBoxes.length}</Text>
              <Text style={[styles.statLabel, activeTab === 'visited' && styles.activeStatText]}>Boîtes visitées</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.booksList}>
            <Text style={styles.sectionTitle}>
              {activeTab === 'favorites' ? 'Vos boîtes à livres favoris' : 'Vos boîtes à livres visitées'}
            </Text>

            {activeTab === 'favorites' ? (
              favoriteBoxes.length > 0 ? (
                favoriteBoxes.map((bookBox, index) => (
                  <View key={index}>
                    {renderBookBox(bookBox, index)}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyStateText}>Vous n'avez pas encore ajouté de boîtes à livres en favoris.</Text>
              )
            ) : (
              visitedBoxes.length > 0 ? (
                visitedBoxes.map((bookBox, index) => (
                  <View key={index}>
                    <BookVisit bookBox={bookBox} index={index} />
                  </View>
                ))
              ) : (
                <Text style={styles.emptyStateText}>Vous n'avez pas encore visité de boîtes à livres.</Text>
              )
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 15,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    marginTop: HEADER_HEIGHT - 50,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -90,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userMetadata: {
    marginTop: 25,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 3,
  },
  metadataText: {
    fontSize: 14,
    color: '#666',
  },
  stats: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  activeStatItem: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#3A7C6A',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  activeStatText: {
    color: '#3A7C6A',
  },
  booksList: {
    marginTop: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  instructions: {
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bookBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
  },
  bookBoxImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  bookBoxContent: {
    flex: 1,
    marginLeft: 12,
  },
  bookBoxTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  bookBoxAddTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDotAvailable: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3A7C6A',
    marginRight: 6,
  },
  statusDotUnavailable: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D8596E',
    marginRight: 6,
  },
  statusTextAvailable: {
    fontSize: 14,
    color: '#3A7C6A',
  },
  statusTextUnavailable: {
    fontSize: 14,
    color: '#D8596E',
  },
  subscriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionTextPremium: {
    color: '#3A7C6A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  metadataItem2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subscriptionTextFreemium: {
    color: 'gray',
    fontWeight: 'bold',
  },
  deleteIcon: {
    marginLeft: 12,
  },
  bookBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ProfileScreen;
