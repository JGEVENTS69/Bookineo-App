import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';

const CustomTabBarButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.centerButtonContainer}
      onPress={onPress}
    >
      <View style={styles.centerButton}>
        <Plus color="#fff" size={28} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  centerButtonContainer: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  centerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#3a7c6a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default CustomTabBarButton;
