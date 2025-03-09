import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { supabase } from '../services/supabase';

interface EmailModalProps {
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

const EmailModal: React.FC<EmailModalProps> = ({ visible, onClose }) => {
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
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
    setPassword('');
    setNewEmail('');
    setIsVerified(false);
  };

  // Vérifier le mot de passe
  const verifyPassword = async () => {
    if (!password) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe.');
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
        password: password,
      });

      if (error) {
        Alert.alert('Erreur', 'Mot de passe incorrect.');
        setIsVerified(false);
      } else {
        setIsVerified(true);
      }
    } catch (error) {
      console.error('Erreur de vérification :', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  // Mettre à jour l'adresse e-mail
  const updateEmail = async () => {
    if (!newEmail.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse e-mail valide.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) {
        Alert.alert('Erreur', error.message);
      } else {
        Alert.alert('Succès', 'Adresse e-mail mise à jour avec succès !');
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
              <Text style={styles.modalTitle}>Adresse emaill</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close-circle-outline" size={28} color="#555" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {!isVerified ? (
                <>
                  <Text style={styles.metadataText}>Entrez votre mot de passe</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    placeholderTextColor="#aaa"
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity style={styles.verifyButton} onPress={verifyPassword}>
                    <Text style={styles.verifyButtonText}>Vérifier</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.metadataText}>Nouvelle adresse e-mail</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nouvelle adresse e-mail"
                    placeholderTextColor="#aaa"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={newEmail}
                    onChangeText={setNewEmail}
                  />

                  <TouchableOpacity
                    style={[styles.saveButton, !newEmail.includes('@') && styles.disabledButton]}
                    onPress={updateEmail}
                    disabled={!newEmail.includes('@')}
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
  modalBody: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 24,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
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
});

export default EmailModal;