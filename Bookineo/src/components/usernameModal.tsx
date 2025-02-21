import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { supabase } from '../services/supabase';

interface UsernameModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (username: string) => void;
}

const UsernameModal: React.FC<UsernameModalProps> = ({ visible, onClose, onSave }) => {
  const [newUsername, setNewUsername] = useState('');
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
        .select('username')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
      } else if (data) {
        setNewUsername(data.username);
      }
    } else {
      console.error('No user is logged in');
    }
  };

  const resetModal = () => {
    setNewUsername('');
  };

  const handleInputFocus = () => {
    if (newUsername === '') {
      setNewUsername('');
    }
  };

  const saveUsername = async () => {
    if (!newUsername) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erreur', 'Utilisateur non authentifié.');
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ username: newUsername })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erreur mise à jour username:', updateError);
        Alert.alert('Erreur', "Impossible de mettre à jour le nom d'utilisateur.");
        return;
      }

      onSave(newUsername);
      onClose();

      Alert.alert('Succès', 'Votre nom d\'utilisateur a été mis à jour !');

    } catch (error) {
      console.error('Erreur inattendue:', error);
      Alert.alert('Erreur', "Une erreur inattendue est survenue.");
    }
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
              <Text style={styles.modalTitle}>Modifier votre pseudo</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close-circle-outline" size={28} color="#555" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={styles.input}
                placeholder="Nouveau pseudo"
                value={newUsername}
                onChangeText={setNewUsername}
                onFocus={handleInputFocus}
              />

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    !newUsername && styles.disabledButton,
                  ]}
                  onPress={newUsername ? saveUsername : null}
                  disabled={!newUsername}
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
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
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

export default UsernameModal;