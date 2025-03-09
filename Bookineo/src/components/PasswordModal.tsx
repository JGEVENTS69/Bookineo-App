// Bookineo/src/components/PasswordModal.tsx
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { supabase } from '../services/supabase';

interface PasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

const PasswordInput = ({ value, onChangeText, secureTextEntry, placeholder, editable }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, !editable && styles.disabledInput]}
        placeholder={placeholder}
        placeholderTextColor="#ffffff80"
        secureTextEntry={!showPassword}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
      />
      <TouchableOpacity
        style={styles.eyeIconContainer}
        onPress={() => setShowPassword(!showPassword)}
      >
        <Ionicons
          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color="#555"
        />
      </TouchableOpacity>
    </View>
  );
};

const PasswordModal: React.FC<PasswordModalProps> = ({ visible, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isCurrentPasswordDisabled, setIsCurrentPasswordDisabled] = useState(false); // État pour désactiver l'input du mot de passe actuel
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
        }),
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

  const resetModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setIsVerified(false);
    setIsCurrentPasswordDisabled(false); // Réinitialiser l'état de désactivation
  };

  // Vérifier l'ancien mot de passe
  const verifyCurrentPassword = async () => {
    if (!currentPassword) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe actuel.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erreur', 'Utilisateur non authentifié.');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (error) {
        Alert.alert('Erreur', 'Mot de passe incorrect.');
        setIsVerified(false);
      } else {
        setIsVerified(true);
        setIsCurrentPasswordDisabled(true); // Désactiver l'input du mot de passe actuel
      }
    } catch (error) {
      console.error('Erreur de vérification :', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  // Mettre à jour le mot de passe
  const updatePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        Alert.alert('Erreur', error.message);
      } else {
        Alert.alert('Succès', 'Mot de passe mis à jour avec succès !');
        onClose();
      }
    } catch (error) {
      console.error('Erreur mise à jour :', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  return (
    <Modal animationType="none" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <BlurView intensity={10} style={StyleSheet.absoluteFill} tint="dark" />
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
              <Text style={styles.modalTitle}>Mot de passe</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close-circle-outline" size={28} color="#555" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.metadataText}>Entrez votre mot de passe actuel</Text>
              <PasswordInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={true}
                placeholder="Mot de passe actuel"
                editable={!isCurrentPasswordDisabled}
              />
              {!isVerified && (
                <TouchableOpacity style={styles.verifyButton} onPress={verifyCurrentPassword}>
                  <Text style={styles.verifyButtonText}>Vérifier</Text>
                </TouchableOpacity>
              )}

              {isVerified && (
                <>
                  <Text style={styles.metadataText}>Entrez un nouveau mot de passe</Text>
                  <PasswordInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={true}
                    placeholder="Nouveau mot de passe"
                    editable={true}
                  />

                  <TouchableOpacity
                    style={[styles.saveButton, newPassword.length < 6 && styles.disabledButton]}
                    onPress={updatePassword}
                    disabled={newPassword.length < 6}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                  </TouchableOpacity>
                </>
              )}
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
  inputContainer: {
    width: '100%',
    position: 'relative',
    paddingBottom: 20,  // Permet de positionner l'icône à l'intérieur
  },
  input: {
    width: '100%',
    padding: 12,
    paddingRight: 40, // Laisse de la place pour l'icône
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 12, // Positionne l'icône à droite
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,  // Assure que l'icône reste cliquable
  },
  metadataText: {
    color: '#555',
    fontSize: 14,
    marginBottom: 12,
  },
  verifyButton: {
    backgroundColor: '#3A7C6A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3A7C6A',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
  disabledInput: {
    backgroundColor: '#f0f0f0',
  },
});

export default PasswordModal;