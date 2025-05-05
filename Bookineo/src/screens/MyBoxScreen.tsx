// MyBoxScreen.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 200;

interface BookBox {
  id: number;
  name: string;
  created_at: string;
  photo_url: string;
  status: boolean;
}

const MyBoxScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('added');
  const [bookBoxes, setBookBoxes] = useState<BookBox[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = new Animated.Value(0);
  const navigation = useNavigation();
  const swipeableRefs = useRef([]);

  const closeOtherSwipeables = (index) => {
    swipeableRefs.current.forEach((ref, i) => {
      if (ref && i !== index) {
        ref.close();
      }
    });
  };

  const fetchUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
    return user;
  };

  const fetchBookBoxes = async () => {
    const user = await fetchUser();
    if (user) {
      const { data, error } = await supabase
        .from('book_boxes')
        .select('*')
        .eq('created_id', user.id);

      if (error) {
        console.error('Erreur lors de la récupération des boîtes à livres:', error);
      } else {
        setBookBoxes(data);
      }
    } else {
      console.log('No user logged in');
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookBoxes().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchBookBoxes();
  }, []);

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

  const handleDeleteBox = async (boxId) => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cette boîte à livres ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('book_boxes')
                .delete()
                .eq('id', boxId);

              if (error) {
                console.error("Erreur lors de la suppression:", error);
                Alert.alert("Erreur", "Impossible de supprimer cette boîte à livres.");
              } else {
                setBookBoxes(prevBoxes => prevBoxes.filter(box => box.id !== boxId));
                Alert.alert("Succès", "La boîte à livres a été supprimée avec succès.");
              }
            } catch (error) {
              console.error("Exception lors de la suppression:", error);
              Alert.alert("Erreur", "Une erreur s'est produite lors de la suppression.");
            }
          }
        }
      ]
    );
  };

  const handleEditBox = (bookBox) => {
    navigation.navigate('UpdateBox', { boxId: bookBox.id });
  };

  const renderRightActions = (bookBox, progress) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
    });
    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
    });

    return (
      <View style={styles.swipeActionsContainer}>
        <Animated.View
          style={[
            styles.deleteAction,
            {
              transform: [{ translateX: trans }],
              opacity,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => handleDeleteBox(bookBox.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={28} color="#D8596E" />
            <Text style={styles.actionText}>Supprimer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderLeftActions = (bookBox, progress) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0],
    });
    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
    });

    return (
      <View style={styles.swipeActionsContainer}>
        <Animated.View
          style={[
            styles.editAction,
            {
              transform: [{ translateX: trans }],
              opacity,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => handleEditBox(bookBox)}
            style={styles.actionButton}
          >
            <Ionicons name="create-outline" size={28} color="#3A7C6A" />
            <Text style={styles.actionText2}>Modifier</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderBookBox = (bookBox, index) => (
    <Swipeable
      ref={ref => swipeableRefs.current[index] = ref}
      renderRightActions={(progress) => renderRightActions(bookBox, progress)}
      renderLeftActions={(progress) => renderLeftActions(bookBox, progress)}
      onSwipeableOpen={() => closeOtherSwipeables(index)}
      friction={1.5}
      overshootFriction={8}
      leftThreshold={80}
      rightThreshold={80}
    >
      <View style={styles.bookBox}>
        <Image
          source={{ uri: bookBox.photo_url || 'https://via.placeholder.com/80' }}
          style={styles.bookBoxImage}
        />
        <View style={styles.bookBoxContent}>
          <Text style={styles.bookBoxTitle}>{bookBox.name}</Text>
          <Text style={styles.bookBoxAddTime}>Ajoutée le {new Date(bookBox.created_at).toLocaleDateString()}</Text>
        </View>
      </View>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.container}>
      

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
          <View style={styles.stats}>
            <TouchableOpacity
              style={[styles.statItem, activeTab === 'added' && styles.activeStatItem]}
              onPress={() => setActiveTab('added')}
            >
            </TouchableOpacity>
          </View>

          <View style={styles.booksList}>
            <View style={styles.instructions}>
              <Text style={styles.instructionsText}>
                {activeTab === 'added' ? '"Glissez vers la gauche pour modifier votre boîte à livres, ou vers la droite pour la supprimer."' : ''}
              </Text>
            </View>

            {activeTab === 'added' ? (
              bookBoxes.length > 0 ? (
                bookBoxes.map((bookBox, index) => (
                  <View key={index}>
                    {renderBookBox(bookBox, index)}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyStateText}>Vous n'avez pas encore ajouté de boîtes à livres.</Text>
              )
            ) : null}
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
  profileContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
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
    borderColor: '#E5E5E5',
    borderWidth: 1,
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
  swipeActionsContainer: {
    width: 100,
    height: '100%',
  },
  deleteAction: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  editAction: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  actionText: {
    color: '#D8596E',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  actionText2: {
    color: '#3A7C6A',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MyBoxScreen;