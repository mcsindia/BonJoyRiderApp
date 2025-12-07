// src/screens/HomeScreenContent/DrawerContent.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const DrawerContent = ({ navigation }: any) => {
  const closeAndNavigate = (screen: string) => {
    navigation.closeDrawer();
    if (screen !== 'Home') {
      navigation.navigate(screen);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <Image
          source={{ uri: 'https://via.placeholder.com/60' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Sanjeev Kumar</Text>
        <Text style={styles.email}>sanjeev@example.com</Text>
      </View>

      <TouchableOpacity style={styles.item} onPress={() => closeAndNavigate('Home')}>
        <Text style={styles.itemText}>🏠 Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => closeAndNavigate('Profile')}>
        <Text style={styles.itemText}>👤 Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => closeAndNavigate('Settings')}>
        <Text style={styles.itemText}>⚙️ Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DrawerContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  profile: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
  },
  item: {
    paddingVertical: 12,
  },
  itemText: {
    fontSize: 16,
    color: '#1F2937',
  },
});