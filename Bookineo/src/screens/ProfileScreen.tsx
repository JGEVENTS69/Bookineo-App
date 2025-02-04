import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booksAdded, setBooksAdded] = useState(0); // État pour le nombre de boîtes ajoutées
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        console.log('User data:', user);

        const { data, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        console.log('Profile data:', data);

        setUser({ ...user, ...data });

        // Récupérer le nombre de boîtes ajoutées par l'utilisateur
        const { count, error: booksError } = await supabase
          .from('book_boxes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (booksError) throw booksError;

        console.log('Books added count:', count);

        setBooksAdded(count);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const StatItem = ({ label, value }) => (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <Image
          source={{ uri: user.banner_url || 'https://via.placeholder.com/500x200' }}
          style={styles.coverImage}
        />

        {/* Profile Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
            <MaterialCommunityIcons name="cog" size={36} color="#9f9f9f" />
          </TouchableOpacity>
          <Image
            source={{ uri: user.avatar_url }}
            style={styles.profilePicture}
          />
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.infoText}>{user.email}</Text>
          <Text style={styles.infoDate}>
            Membre depuis le {new Date(user.created_at).toLocaleDateString()}.
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <StatItem label="Boîtes à livres ajoutées" value={booksAdded} />
          <View style={styles.statsDivider} />
          <StatItem label="Boîtes à livres visitées" value="14.3k" />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          {user.phone && (
            <View style={styles.infoItem}>
              <Ionicons name="call" size={20} color="#333333" />
              <Text style={styles.infoText}>{user.phone}</Text>
            </View>
          )}
          {user.location && (
            <View style={styles.infoItem}>
              <Ionicons name="location" size={20} color="#333333" />
              <Text style={styles.infoText}>{user.location}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    marginBottom: 20,
  },
  coverImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E5E5',
  },
  headerContainer: {
    alignItems: 'left',
    marginTop: -50,
    paddingHorizontal: 20,
    position: 'relative',
  },
  profilePicture: {
    width: 140,
    height: 140,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#E5E5E5',
  },
  username: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginTop: 12,
  },
  bio: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  editButton: {
    position: 'absolute',
    top: 60,
    right: 10,
    padding: 10,
  },
  editButtonText: {
    color: '#3A7C6A',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginTop: 16,
    backgroundColor: '#F8F8F8',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  statsDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5E5E5',
  },
  infoSection: {
    padding: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333333',
    fontStyle: 'italic',
  },
  infoDate: {
    fontSize: 14,
    color: '#333333',
    paddingTop: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;