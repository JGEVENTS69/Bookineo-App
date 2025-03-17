// src/components/ModalDeleteAccount.tsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface ModalDeleteAccountProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ModalDeleteAccount: React.FC<ModalDeleteAccountProps> = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <BlurView intensity={10} style={StyleSheet.absoluteFill} tint="dark" />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Supprimer le compte</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle-outline" size={28} color="#555" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalText}>
              Êtes-vous sûr de vouloir supprimer votre compte ?
            </Text>
            <Text style={styles.modalText}>
              Cette action est irréversible.
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Ionicons name="close-circle-outline" size={20} color="#555" style={styles.buttonIcon} />
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#ff4444',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
  },
  confirmButtonText: {
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
});

export default ModalDeleteAccount;