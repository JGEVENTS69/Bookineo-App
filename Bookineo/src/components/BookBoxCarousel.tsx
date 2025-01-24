// src/components/BookBoxCarousel.tsx
import React from 'react';
import { View, StyleSheet, Image, Text, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

interface BookBox {
  id: string;
  name: string;
  description: string;
  photo_url: string;
  latitude: number;
  longitude: number;
  creator_id: string;
}

interface BookBoxCarouselProps {
  bookBoxes: BookBox[];
}

const BookBoxCarousel: React.FC<BookBoxCarouselProps> = ({ bookBoxes }) => {
  return (
    <View style={styles.carouselContainer}>
      <Carousel
        width={Dimensions.get('window').width}
        height={250}
        autoPlay={false}
        data={bookBoxes}
        mode="parallax"
        scrollAnimationDuration={1000}
        renderItem={({ item }) => (
          <View style={styles.carouselItem}>
            <Image source={{ uri: item.photo_url }} style={styles.carouselImage} />
            <View style={styles.carouselTextContainer}>
              <Text style={styles.carouselTitle}>{item.name}</Text>
              <Text style={styles.carouselDescription}>{item.description}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    height: 250,
  },
  carouselItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
    padding: 10,
  },
  carouselImage: {
    width: '100%',
    height: '60%',
    resizeMode: 'cover',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  carouselTextContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  carouselDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666666',
  },
});

export default BookBoxCarousel;