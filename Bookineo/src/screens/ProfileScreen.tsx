import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 250;

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState('added');
  const [user, setUser] = useState(null);
  const [addedBoxes, setAddedBoxes] = useState([]);
  const [visitedBoxes, setVisitedBoxes] = useState([]);
  const scrollY = new Animated.Value(0);
  const navigation = useNavigation();

  useEffect(() => {
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

    const fetchAddedBoxes = async () => {
      const { data, error } = await supabase
        .from('book_boxes')
        .select('*')
        .eq('created_id', user.id);
      if (error) {
        console.error(error);
      } else {
        setAddedBoxes(data);
      }
    };

    const fetchVisitedBoxes = async () => {
      const { data: visitData, error: visitError } = await supabase
        .from('box_visits')
        .select('box_id, created_at')
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
            };
          });
          setVisitedBoxes(visitedBoxesWithDates);
        }
      }
    };

    fetchUser().then(() => {
      fetchAddedBoxes();
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

  const renderBookBox = (bookBox) => (
    <TouchableOpacity style={styles.bookBox}>
      <Image
        source={{ uri: bookBox.photo_url || 'https://via.placeholder.com/80' }}
        style={styles.bookBoxImage}
      />
      <View style={styles.bookBoxContent}>
        <Text style={styles.bookBoxTitle}>{bookBox.name}</Text>
        <Text style={styles.bookBoxAddTime}>Ajoutée le {new Date(bookBox.created_at).toLocaleDateString()}</Text>
        <View style={styles.statusContainer}>
        <View style={bookBox.status ? styles.statusDotAvailable : styles.statusDotUnavailable} />
        <Text style={bookBox.status ? styles.statusTextAvailable : styles.statusTextUnavailable}>
      {bookBox.status ? 'Disponible' : 'Indisponible'}
    </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  const BookVisit = ({ bookBox }) => (
  <TouchableOpacity style={styles.bookBox}>
    <Image
      source={{ uri: bookBox.photo_url || 'https://via.placeholder.com/80' }}
      style={styles.bookBoxImage}
    />
    <View style={styles.bookBoxContent}>
      <Text style={styles.bookBoxTitle}>{bookBox.name}</Text>
      <Text style={styles.bookBoxAddTime}>
        Visitée le {bookBox.visited_at ? new Date(bookBox.visited_at).toLocaleDateString() : 'Date inconnue'}
      </Text>
      <View style={styles.statusContainer}>
        <View style={bookBox.status ? styles.statusDotAvailable : styles.statusDotUnavailable} />
        <Text style={bookBox.status ? styles.statusTextAvailable : styles.statusTextUnavailable}>
          {bookBox.status ? 'Disponible' : 'Indisponible'}
        </Text>
      </View>
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
      >
        <View style={styles.profileContainer}>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="settings-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.avatar_url || 'https://vjwctbtqyipqsnexjukq.supabase.co/storage/v1/object/public/avatars//Empty-PhotoProfile.png' }}
              style={styles.avatar}
            />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.username}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          <View style={styles.userMetadata}>
            <View style={styles.metadataItem}>
              <Ionicons name="calendar-outline" size={18} color="#666" />
              <Text style={styles.metadataText}>Membre depuis le {new Date(user?.created_at).toLocaleDateString()}. </Text>
            </View>
            <View style={styles.metadataItem}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={styles.metadataText}>Paris, France</Text>
            </View>
          </View>

          <View style={styles.stats}>
            <TouchableOpacity
              style={[styles.statItem, activeTab === 'added' && styles.activeStatItem]}
              onPress={() => setActiveTab('added')}
            >
              <Text style={[styles.statNumber, activeTab === 'added' && styles.activeStatText]}>{addedBoxes.length}</Text>
              <Text style={[styles.statLabel, activeTab === 'added' && styles.activeStatText]}>Boîtes ajoutées</Text>
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
              {activeTab === 'added' ? 'Vos boîtes à livres ajoutées' : 'Vos boîtes à livres visitées'}
            </Text>
            {activeTab === 'added' ? (
              addedBoxes.map((bookBox, index) => (
                <View key={index}>
                  {renderBookBox(bookBox)}
                </View>
              ))
            ) : (
              visitedBoxes.map((bookBox, index) => (
                <View key={index}>
              <BookVisit bookBox={bookBox} />
                </View>
              ))
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
    backgroundColor: '#F8F9FA',
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
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userMetadata: {
    marginTop: 16,
    gap: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    marginBottom: 16,
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
  }
});

export default ProfileScreen;