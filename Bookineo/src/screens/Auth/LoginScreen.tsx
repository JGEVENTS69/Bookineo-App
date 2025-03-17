import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from 'src/services/supabase';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Erreur', 'Email ou mot de passe incorrect.');
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
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
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/Logo-Blanc.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Bienvenue.</Text>
              <Text style={styles.subtitleText}>Connectez-vous et explorez les boîtes à livres près de chez vous !</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Votre adresse email"
                  placeholderTextColor="#ffffff80"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mot de passe</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Votre mot de passe"
                  placeholderTextColor="#ffffff80"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Text>
              </TouchableOpacity>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Pas encore de compte ?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>S'inscrire</Text>
                </TouchableOpacity>
              </View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: width * 0.6,
    height: undefined,
    aspectRatio: 1,
  },
  formContainer: {
    width: '100%',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#ffffff80',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 15,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: '#ffffff',
    fontSize: 14,
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#E9C46A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#264653',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  registerText: {
    color: '#ffffff80',
    fontSize: 14,
  },
  registerLink: {
    color: '#E9C46A',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;