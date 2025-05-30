
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, Alert, Animated, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';
import supabaseAdmin from '../services/supabaseAdmin';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import ModalCover from '../components/modalCover';
import UsernameModal from '../components/usernameModal';
import PasswordModal from '../components/PasswordModal';
import ModalDeleteAccount from '../components/modalDeleteAccount';

const EditProfile = () => {
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [coverUrl, setCoverUrl] = useState(null);
  const [coverModalVisible, setCoverModalVisible] = useState(false);
  const [newAvatar, setNewAvatar] = useState(null);
  const [usernameModalVisible, setUsernameModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    if (modalVisible) {
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
      }).start();
    }
  }, [modalVisible]);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setNewAvatar(null);
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error);
      } else if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('username, avatar_url, banner_url')
          .eq('id', user.id);

        if (error) {
          console.error('Error fetching user data:', error);
        } else if (data && data.length > 0) {
          setUsername(data[0].username);
          setAvatarUrl(data[0].avatar_url);
          setCoverUrl(data[0].banner_url);
          console.log('User data fetched:', data[0]);
        }
      } else {
        console.error('No user is logged in');
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
  
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
        Alert.alert('Erreur', 'Impossible de se déconnecter. Veuillez réessayer.');
        return;
      }
  
      // Rediriger vers la page de connexion après la déconnexion
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Une erreur inattendue est survenue.');
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
      setNewAvatar(result.assets[0].uri);
      console.log('Image selected:', result.assets[0].uri);
    }
  };

  const generateUniqueFileName = () => {
    const timestamp = new Date().getTime();
    const randomNumber = Math.floor(Math.random() * 10000);
    return `avatar_${timestamp}_${randomNumber}.jpg`;
  };

  const saveProfileImage = async () => {
    if (!newAvatar) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erreur', 'Utilisateur non authentifié.');
        return;
      }

      const { data, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();

      if (userError || !data?.username) {
        console.error('Erreur récupération username:', userError);
        Alert.alert('Erreur', "Impossible de récupérer le nom d'utilisateur.");
        return;
      }

      const fileName = generateUniqueFileName();

      const formData = new FormData();
      formData.append('file', {
        uri: newAvatar,
        name: fileName,
        type: 'image/jpeg',
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, formData, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        console.error('Erreur upload:', uploadError);
        Alert.alert('Erreur', `Échec de l'upload: ${uploadError.message}`);
        return;
      }

      const { data: { publicUrl } } = await supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!publicUrl) {
        Alert.alert('Erreur', "L'URL de l'image n'a pas pu être générée.");
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erreur mise à jour profil:', updateError);
        Alert.alert('Erreur', "Impossible de mettre à jour l'image de profil.");
        return;
      }

      setAvatarUrl(publicUrl);
      setModalVisible(false);

      Alert.alert('Succès', 'Votre photo de profil a été mise à jour !');

    } catch (error) {
      console.error('Erreur inattendue:', error);
      Alert.alert('Erreur', "Une erreur inattendue est survenue.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erreur', 'Utilisateur non authentifié.');
        return;
      }

      // Supprimer l'utilisateur de la base de données d'authentification
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (authError) {
        console.error('Erreur suppression utilisateur auth:', authError);
        Alert.alert('Erreur', "Impossible de supprimer l'utilisateur de la base d'authentification.");
        return;
      }

      // Supprimer l'utilisateur de la table 'users'
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (userError) {
        console.error('Erreur suppression utilisateur:', userError);
        Alert.alert('Erreur', "Impossible de supprimer l'utilisateur de la base de données.");
        return;
      }

      Alert.alert('Succès', 'Votre compte a été supprimé.');
      navigation.navigate('Login'); // Rediriger vers la page de connexion après suppression
    } catch (error) {
      console.error('Erreur inattendue:', error);
      Alert.alert('Erreur', "Une erreur inattendue est survenue.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>

         {/* Section Informations Personnelles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={22} color="#3A7C6A" />
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
          </View>
          <TouchableOpacity style={styles.optionButton} onPress={() => setUsernameModalVisible(true)}>
            <Text style={styles.optionButtonText}>Modifier votre nom d'utilisateur</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.optionButtonText}>Modifier votre photo de profil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => setCoverModalVisible(true)}>
            <Text style={styles.optionButtonText}>Modifier votre photo de couverture</Text>
          </TouchableOpacity>
        </View>

        {/* Section Sécurité */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={22} color="#3A7C6A" />
            <Text style={styles.sectionTitle}>Sécurité</Text>
          </View>
          <TouchableOpacity style={styles.optionButton} onPress={() => setPasswordModalVisible(true)}>
            <Text style={styles.optionButtonText}>Modifier votre mot de passe</Text>
          </TouchableOpacity>
        </View>

      {/* Section Abonnement */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="crown" size={22} color="#3A7C6A" />
            <Text style={styles.sectionTitle}>Abonnement</Text>
          </View>
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionButtonText}>Gérer votre abonnement</Text>
          </TouchableOpacity>
        </View>

        {/* Section Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deletAccountButton} onPress={() => setDeleteAccountModalVisible(true)}>
          <Ionicons name="trash-bin-outline" size={20} color="#ff4444" />
          <Text style={styles.deletButtonText}>Supprimer mon compte</Text>
        </TouchableOpacity>
      </View>

      <ModalCover
        visible={coverModalVisible}
        onClose={() => setCoverModalVisible(false)}
        onSave={(url) => {
          setCoverUrl(url);
          setCoverModalVisible(false);
        }}
        title="Photo de couverture"
        bucket="banner"
        column="banner_url"
      />

      <UsernameModal
        visible={usernameModalVisible}
        onClose={() => setUsernameModalVisible(false)}
        onSave={(newUsername) => {
          setUsername(newUsername);
          setUsernameModalVisible(false);
        }}
      />

      <PasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />

<ModalDeleteAccount
        visible={deleteAccountModalVisible}
        onClose={() => setDeleteAccountModalVisible(false)}
        onConfirm={handleDeleteAccount}
      />

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={closeModal}
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
                <Text style={styles.modalTitle}>Photo de profil</Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Ionicons name="close-circle-outline" size={28} color="#555" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                {newAvatar || avatarUrl ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: newAvatar || avatarUrl }}
                      style={styles.profileImage}
                    />
                    <TouchableOpacity
                      style={styles.changePhotoButton}
                      onPress={pickImage}
                    >
                      <Ionicons name="camera" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.photoPlaceholder}
                    onPress={pickImage}
                  >
                    <Ionicons name="person-add-outline" size={34} color="#3A7C6A" />
                    <Text style={styles.uploadText}>Choisir une photo</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      !newAvatar && styles.disabledButton,
                    ]}
                    onPress={newAvatar ? saveProfileImage : null}
                    disabled={!newAvatar}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3A7C6A',
    marginLeft: 10,
  },
  optionButton: {
    paddingVertical: 10,
    paddingLeft: 15,
  },
  optionButtonText: {
    fontSize: 15,
    color: 'black',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginTop: 10,
    backgroundColor: '#3A7C6A',
    borderRadius: 12,
  },
  deletAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginTop: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  deletButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
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
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f0f0f0',
    borderWidth: 4,
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
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  uploadText: {
    color: '#3A7C6A',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  cancelButton: {
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default EditProfile;