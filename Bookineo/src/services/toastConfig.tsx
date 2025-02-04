import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Pour les icônes

// Configuration des toasts
export const toastConfig = {
  success: ({ text1, text2 }) => (
    <View style={styles.successToast}>
      <Ionicons name="checkmark-circle" size={24} color="white" />
      <View>
        <Text style={styles.toastText1}>{text1}</Text>
        <Text style={styles.toastText2}>{text2}</Text>
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={styles.errorToast}>
      <Ionicons name="close-circle" size={24} color="white" />
      <View>
        <Text style={styles.toastText1}>{text1}</Text>
        <Text style={styles.toastText2}>{text2}</Text>
      </View>
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View style={styles.infoToast}>
      <Ionicons name="information-circle" size={24} color="white" />
      <View>
        <Text style={styles.toastText1}>{text1}</Text>
        <Text style={styles.toastText2}>{text2}</Text>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
    successToast: {
      backgroundColor: '#3a7c6a',
      padding: 16,
      borderRadius: 8,
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    errorToast: {
      backgroundColor: '#d8596e',
      padding: 16,
      borderRadius: 8,
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoToast: {
      backgroundColor: '#2196F3',
      padding: 16,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    toastText1: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
      marginLeft: 8,
    },
    toastText2: {
      color: 'white',
      fontSize: 14,
      marginLeft: 8,
    },
  });