// src/screens/HomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  const navigation = useNavigation();

  const openDrawer = () => {
    // @ts-ignore — safe because navigator structure is controlled by you
    navigation.getParent()?.openDrawer();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* === EXACT HEADER FROM YOUR SCREENSHOT === */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapText}>📍 Map View Here</Text>
      </View>

      {/* "Search Destination" Header */}
      <View style={styles.destinationHeader}>
        <Text style={styles.destinationTitle}>Search Destination</Text>
      </View>

      {/* Destination List */}
      <ScrollView style={styles.listContainer}>
        <View style={styles.destinationItem}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.destinationName}>6CMJ+43G DB Mall Square, DB City Mall</Text>
          <Text style={styles.arrowIcon}>➤</Text>
        </View>
        <View style={styles.destinationItem}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.destinationName}>6CMJ+43G DB Mall Square, DB City Mall</Text>
          <Text style={styles.arrowIcon}>➤</Text>
        </View>
      </ScrollView>

      {/* Banner Ad */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/300x150/1E40AF/FFFFFF?text=Marketing+Agency' }}
          style={styles.bannerImage}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuButton: {
    width: 56,
    height: 48,
    backgroundColor: '#1F344F', // Dark blue as in screenshot
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4
  },
  menuIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#6B7280',
    paddingVertical: 0,
  },
  searchIcon: {
    fontSize: 20,
    color: '#1E40AF', // Matches menu button
  },
  mapContainer: {
    height: 200,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  mapText: {
    fontSize: 16,
    color: '#6B7280',
  },
  destinationHeader: {
    backgroundColor: '#111827',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  destinationTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#1F2937',
  },
  destinationName: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#6B7280',
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  bannerImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
});