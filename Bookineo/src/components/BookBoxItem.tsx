import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image, Dimensions } from 'react-native';
import { MapPin, Navigation2 } from 'lucide-react-native';

const CARD_WIDTH = Dimensions.get('window').width * 0.8;
const CARD_HEIGHT = 180;

interface BookBoxItemProps {
  item: BookBox;
  onPress: (box: BookBox) => void;
  distance?: number; // Distance en mètres par rapport à l'utilisateur
}

const BookBoxItem = ({ item, onPress, distance }: BookBoxItemProps) => (
  <TouchableOpacity 
    style={styles.card}
    onPress={() => onPress(item)}
    activeOpacity={0.95}
  >
    <Image
      source={{ uri: item.photo_url }}
      style={styles.image}
      resizeMode="cover"
    />
    <View style={styles.overlay} />
    <View style={styles.cardContent}>
      <View style={styles.headerContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {item.name}
        </Text>
        {distance && (
          <View style={styles.distanceContainer}>
            <Navigation2 size={14} color="#FFFFFF" />
            <Text style={styles.distance}>
              {distance < 1000 
                ? `${Math.round(distance)}m` 
                : `${(distance / 1000).toFixed(1)}km`}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.locationContainer}>
        <MapPin size={14} color="#FFFFFF" style={styles.locationIcon} />
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distance: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    marginTop: 3,
    marginRight: 4,
  },
  description: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
});

export { BookBoxItem };