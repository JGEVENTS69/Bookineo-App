import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';
import { useNavigation } from '@react-navigation/native';

const UsernameScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const validateUsername = (username: string) => {
    if (username.length < 3) {
      Alert.alert('Erreur', 'Le pseudo doit contenir au moins 3 caractères');
      return false;
    }
    if (username.length > 20) {
      Alert.alert('Erreur', 'Le pseudo ne doit pas dépasser 20 caractères');
      return false;
    }
    // Regex pour vérifier que le pseudo ne contient que des lettres, chiffres et underscores
    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(username)) {
      Alert.alert('Erreur', 'Le pseudo ne peut contenir que des lettres, chiffres et underscores');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateUsername(username)) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Utilisateur non connecté');

      // Vérifier si le pseudo est déjà pris
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .not('id', 'eq', user.id);

      if (checkError) throw checkError;

      if (existingUsers && existingUsers.length > 0) {
        Alert.alert('Erreur', "Ce nom d'utilisateur est déjà pris");
        return;
      }

      // Mettre à jour le profil avec le nouveau pseudo
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          username,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      Alert.alert(
        'Succès',
        "Nom d'utilisateur enregistré !",
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#2A9D8F', '#264653']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Choisisser votre nom d'utilisateur Bookineo.</Text>
              <Text style={styles.subtitle}>Un pseudo unique qui vous représente.</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nom d'utilisateur</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre nom d'utilisateur"
                  placeholderTextColor="#ffffff80"
                  value={username}
                  onChangeText={setUsername}
                  maxLength={20}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>• 3 à 20 caractères.</Text>
                <Text style={styles.infoText}>• Lettres et chiffres uniquement.</Text>
                <Text style={styles.infoText}>• Doit être unique.</Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#264653" />
                ) : (
                  <Text style={styles.submitButtonText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff80',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoContainer: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  infoText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  submitButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#E9C46A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#264653',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '100%',
    height: 56,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UsernameScreen;