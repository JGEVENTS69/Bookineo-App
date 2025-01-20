import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { LucideUser } from 'lucide-react-native';

const BookBoxCarousel = ({ bookBoxes, userLocation }) => {
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const filteredBookBoxes = bookBoxes.filter((box) => {
    if (!userLocation) return false;
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      box.latitude,
      box.longitude
    );
    return distance <= 10;
  });

  return (
    <Carousel
      data={filteredBookBoxes}
      renderItem={({ item }) => (
        <View style={styles.carouselItem}>
          <Image
            source={{ uri: item.photo_url }}
            style={styles.carouselImage}
          />
          <Text style={styles.carouselTitle}>{item.name}</Text>
          <View style={styles.carouselInfo}>
            <LucideUser size={16} color="#777" />
            <Text style={styles.carouselUsername}>Ajouté par: {item.creator_id}</Text>
          </View>
          <Text style={styles.carouselDistance}>
            {calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              item.latitude,
              item.longitude
            ).toFixed(2)} km
          </Text>
        </View>
      )}
      sliderWidth={Dimensions.get('window').width}
      itemWidth={300}
      layout={'default'}
    />
  );
};

const styles = StyleSheet.create({
  carouselItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  carouselImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  carouselInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  carouselUsername: {
    fontSize: 14,
    color: '#777',
    marginLeft: 5,
  },
  carouselDistance: {
    fontSize: 14,
    color: '#777',
  },
});

export default BookBoxCarousel;
