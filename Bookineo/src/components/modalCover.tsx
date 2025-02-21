import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, Alert, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { supabase } from '../services/supabase';

interface ModalCoverProps {
  visible: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  title: string;
  bucket: string;
  column: string;
}

const ModalCover: React.FC<ModalCoverProps> = ({ visible, onClose, onSave, title, bucket, column }) => {
  const [newImage, setNewImage] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      fetchUserData();
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        resetModal();
      });
    }
  }, [visible]);

  const fetchUserData = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error fetching user:', error);
    } else if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('banner_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
      } else if (data) {
        setBannerUrl(data.banner_url);
      }
    } else {
      console.error('No user is logged in');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
      console.log('Image selected:', result.assets[0].uri);
    }
  };

  const generateUniqueFileName = () => {
    const timestamp = new Date().getTime();
    const randomNumber = Math.floor(Math.random() * 10000);
    return `image_${timestamp}_${randomNumber}.jpg`;
  };

  const saveImage = async () => {
    if (!newImage) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erreur', 'Utilisateur non authentifié.');
        return;
      }

      const fileName = generateUniqueFileName();

      const formData = new FormData();
      formData.append('file', {
        uri: newImage,
        name: fileName,
        type: 'image/jpeg',
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, formData, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        console.error('Erreur upload:', uploadError);
        Alert.alert('Erreur', `Échec de l'upload: ${uploadError.message}`);
        return;
      }

      const { data: { publicUrl } } = await supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      if (!publicUrl) {
        Alert.alert('Erreur', "L'URL de l'image n'a pas pu être générée.");
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ [column]: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erreur mise à jour profil:', updateError);
        Alert.alert('Erreur', "Impossible de mettre à jour l'image.");
        return;
      }

      onSave(publicUrl);
      onClose();

      Alert.alert('Succès', `Votre ${title.toLowerCase()} a été mise à jour !`);

    } catch (error) {
      console.error('Erreur inattendue:', error);
      Alert.alert('Erreur', "Une erreur inattendue est survenue.");
    }
  };

  const resetModal = () => {
    setNewImage(null);
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <BlurView
          intensity={10}
          style={StyleSheet.absoluteFill}
          tint="dark"
        />
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Pressable onPress={() => {}} style={{ width: '100%' }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close-circle-outline" size={28} color="#555" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {newImage || bannerUrl ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: newImage || bannerUrl }}
                    style={styles.image}
                  />
                  <TouchableOpacity
                    style={styles.changePhotoButton}
                    onPress={pickImage}
                  >
                    <Ionicons name="camera" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    !newImage && styles.disabledButton,
                  ]}
                  onPress={newImage ? saveImage : null}
                  disabled={!newImage}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '85%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomColor: '#f2f2f2',
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 24,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  image: {
    width: 300, // Largeur rectangulaire
    height: 150, // Hauteur rectangulaire
    backgroundColor: '#f0f0f0',
    borderWidth: 4,
    borderRadius: 15,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  changePhotoButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#3A7C6A',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#3A7C6A',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#3A7C6A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default ModalCover;