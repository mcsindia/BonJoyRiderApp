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
import { s, sf, sh, sw } from '../utils/scale';

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
    paddingHorizontal: sw(12),
    paddingVertical: sh(8),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuButton: {
    width: sw(56),
    height: sh(48),
    backgroundColor: '#1F344F', // Dark blue as in screenshot
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: s(4),
    borderBottomLeftRadius: s(4)
  },
  menuIcon: {
    fontSize: s(24),
    color: '#FFFFFF',
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: sh(48),
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderTopRightRadius: s(4),
    borderBottomRightRadius: s(4),
    paddingHorizontal: sw(12),
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontSize: sf(16),
    color: '#6B7280',
    paddingVertical: 0,
  },
  searchIcon: {
    fontSize: sf(20),
    color: '#1E40AF', // Matches menu button
  },
  mapContainer: {
    height: sh(200),
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: sh(16),
    marginTop: sh(12),
    borderRadius: s(12),
  },
  mapText: {
    fontSize: s(16),
    color: '#6B7280',
  },
  destinationHeader: {
    backgroundColor: '#111827',
    padding: s(12),
    marginHorizontal: sh(16),
    marginTop: sh(12),
    borderRadius: s(8),
  },
  destinationTitle: {
    color: '#FFFFFF',
    fontSize: sf(16),
    fontWeight: '600',
  },
  listContainer: {
    marginHorizontal: sw(16),
    marginTop: s(8),
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: s(12),
    borderRadius: s(8),
    marginBottom: s(8),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationIcon: {
    fontSize: s(18),
    marginRight: s(8),
    color: '#1F2937',
  },
  destinationName: {
    flex: 1,
    fontSize: s(16),
    color: '#1F2937',
  },
  arrowIcon: {
    fontSize: s(18),
    color: '#6B7280',
  },
  bannerContainer: {
    marginHorizontal: sh(16),
    marginTop: sh(12),
    marginBottom: sh(20),
  },
  bannerImage: {
    width: '100%',
    height: sh(150),
    borderRadius: s(12),
  },
});