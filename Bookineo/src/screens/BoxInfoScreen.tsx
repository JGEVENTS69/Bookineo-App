import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from 'src/services/supabase'; // Importe Supabase

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BoxInfoScreen = ({ route, navigation }) => {
  const { selectedBox } = route.params;
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const headerImageScale = new Animated.Value(1);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('box_visits')
        .select('*')
        .eq('box_id', selectedBox.id);

      if (error) {
        throw error;
      }

      setComments(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [selectedBox.id]);

  const handleSubmitComment = async () => {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Utilisateur non connecté');
        return;
      }
      
      const { data, error } = await supabase
        .from('box_visits')
        .insert([
          {
            box_id: selectedBox.id,
            comment: newComment,
            rating: rating,
            visitor_id: user.user.id,
          },
        ]);
  
      if (error) {
        throw error;
      }
  
      await fetchComments();
      setIsModalVisible(false);
      setNewComment('');
      setRating(0);
    } catch (error) {
      console.error('Erreur lors de la soumission du commentaire:', error);
    }
  };

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    Animated.spring(headerImageScale, {
      toValue: isLiked ? 1 : 1.1,
      useNativeDriver: true,
    }).start();
  };

  if (!selectedBox) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Boîte à livres introuvable</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView bounces={true}>
      {/* Header Image */}
      <View style={styles.headerContainer}>
        <Animated.Image
          source={{ uri: selectedBox.photo_url }}
          style={[styles.headerImage, { transform: [{ scale: headerImageScale }] }]}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
          style={styles.headerOverlay}
        >
          <View style={styles.headerContent}>
            <View style={styles.bookCountBadge}>
              <MaterialCommunityIcons name="archive-marker" size={18} color="#3a7c6a" />
              <Text style={styles.bookCountText}>
                {selectedBox.books_count || 0} visites
              </Text>
            </View>
            <Text style={styles.title}>{selectedBox.name}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: selectedBox.creator_avatar || 'https://picsum.photos/40/40' }}
              style={styles.avatar}
            />
            <View style={styles.userTexts}>
              <Text style={styles.username}>
                {selectedBox.creator_username || 'Utilisateur inconnu'}
              </Text>
              <Text style={styles.date}>
                Ajoutée le {new Date(selectedBox.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLikePress}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#FF4B4B" : "#666"}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos de cette boîte</Text>
          <Text style={styles.description}>
            {selectedBox.description || "Aucune description disponible."}
          </Text>
        </View>

        {/* Location Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emplacement</Text>
          <View style={styles.mapPreview}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: selectedBox.latitude,
                longitude: selectedBox.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={true}
              zoomEnabled={true}
              rotateEnabled={true}
            >
              <Marker
                coordinate={{
                  latitude: selectedBox.latitude,
                  longitude: selectedBox.longitude,
                }}
                title={selectedBox.name}
                description="Boîte à livres"
              >
                <View style={styles.markerContainer}>
                  <Image
                    source={require('../assets/icons/book-marker.png')}
                    style={styles.markerImage}
                  />
                </View>
              </Marker>
            </MapView>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="navigate" size={20} color="white" />
            <Text style={styles.primaryButtonText}>S'y rendre</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setIsModalVisible(true)}
          >
            <MaterialCommunityIcons name="archive-marker" size={20} color="#3a7c6a" />
            <Text style={styles.secondaryButtonText} numberOfLines={1} ellipsizeMode="tail">
              Marqué comme visité
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commentaires</Text>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <View key={index} style={styles.commentCard}>
                <Text style={styles.commentText}>{comment.comment || "J'ai visité cette boîte à livres."}</Text>
                <View style={styles.ratingContainer}>
                  {[...Array(comment.rating)].map((_, i) => (
                    <Ionicons key={i} name="star" size={16} color="#FFD700" />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noCommentsText}>Aucun commentaire pour le moment.</Text>
          )}
        </View>
      </View>

      {/* Modal for Adding Comment */}
      <Modal
  visible={isModalVisible}
  animationType="fade"
  transparent={true}
  onRequestClose={() => setIsModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Noter cette boîte à livres</Text>
      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i + 1)}>
            <Ionicons
              name={i < rating ? "star" : "star-outline"}
              size={32}
              color="#FFD700"
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.commentLabel}>Commentaire (optionnel)</Text>
      <TextInput
        style={styles.commentInput}
        placeholder="Partagez votre expérience..."
        placeholderTextColor="#999"
        value={newComment}
        onChangeText={setNewComment}
        multiline
      />
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setIsModalVisible(false)}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmitComment}
        >
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#6C5CE7',
    borderRadius: 12,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    height: SCREEN_HEIGHT * 0.6,
    width: SCREEN_WIDTH,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  headerContent: {
    gap: 10,
  },
  bookCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 245, 245, 1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  bookCountText: {
    color: '#3a7c6a',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 20,
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userTexts: {
    gap: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 13,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
  },
  mapPreview: {
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGroup: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 32,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3a7c6a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#3a7c6a',
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  commentCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  commentLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  commentInput: {
    height: 100,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3a7c6a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BoxInfoScreen;