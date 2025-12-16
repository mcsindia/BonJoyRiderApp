import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { getFontFamily } from '../../../utils/fontFamily';
import { s, sf, sh, sw } from '../../../utils/scale';

import {
  getAllUserContacts,
  syncUserContacts,
  UserContact,
} from '../../../Services/BonjoyApi';

const EmergencyContactsScreen = () => {
  const navigation = useNavigation();
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch contacts
  const fetchContacts = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      const allContacts = await getAllUserContacts();
      setContacts(allContacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      Alert.alert('Error', 'Failed to load contacts. Please try again.');
      setContacts([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchContacts(false);
    }, [fetchContacts])
  );

  // Manual refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await syncUserContacts();
      await fetchContacts(false);
    } catch (error) {
      console.error('Error refreshing contacts:', error);
      Alert.alert('Error', 'Failed to refresh contacts.');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle contact press
  const handleContactPress = (contact: UserContact) => {
    navigation.navigate('EmergencyContactDetail', { contactId: contact.id });
  };

  // Navigate to add contact screen
  const handleAddContactPress = () => {
    navigation.navigate('AddEmergencyContact');
  };

  // Relationship options for display
  const relationshipOptions = [
    { label: 'Mother', value: 'mother' },
    { label: 'Father', value: 'father' },
    { label: 'Sister', value: 'sister' },
    { label: 'Brother', value: 'brother' },
    { label: 'Husband', value: 'husband' },
    { label: 'Wife', value: 'wife' },
    { label: 'Friend', value: 'friend' },
    { label: 'Son', value: 'son' },
    { label: 'Daughter', value: 'daughter' },
    { label: 'Uncle', value: 'uncle' },
    { label: 'Aunty', value: 'aunty' },
  ];

  // Get relationship label from value
  const getRelationshipLabel = (value: string) => {
    const option = relationshipOptions.find(opt => opt.value === value);
    return option ? option.label : 'Friend';
  };

  // Render Contact Item
  const renderContactItem = (contact: UserContact) => {
    const isPrimary = contact.is_primary === 1;
    
    return (
      <TouchableOpacity
        key={contact.id}
        style={styles.contactItem}
        onPress={() => handleContactPress(contact)}
        disabled={loading}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={require('../../../assets/images/contact.png')}
            style={styles.avatar}
          />
          {isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryBadgeText}>Primary</Text>
            </View>
          )}
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.contactName}</Text>
          <Text style={styles.contactNumber}>
            {contact.contactNumber ? `+91 ${contact.contactNumber}` : 'No number'}
          </Text>
          <Text style={styles.contactStatus}>
            {isPrimary ? 'Primary emergency contact' : 'Emergency contact'}
          </Text>
          {/* {contact.relationship && (
            <Text style={styles.relationshipText}>
              {getRelationshipLabel(contact.relationship)}
            </Text>
          )} */}
        </View>
        <Image
          source={require('../../../assets/icons/right_arrow_circle.png')}
          style={styles.arrowIcon}
        />
      </TouchableOpacity>
    );
  };

  // Render Empty State
  const renderEmptyState = () => (
    <>
      <Text style={styles.emptyTitle}>Setup Emergency Contacts</Text>
      <Text style={styles.instruction}>
        You can add up to 5 people to your emergency contacts. 
        In case of emergency you can choose to inform them when you raise an alert
      </Text>
      <TouchableOpacity 
        style={styles.addContactBtn} 
        onPress={handleAddContactPress}
        disabled={loading}
      >
        <Image
          source={require('../../../assets/icons/add.png')}
          style={styles.plusIcon}
        />
        <Text style={styles.addContactText}>Add Emergency Contact</Text>
      </TouchableOpacity>
    </>
  );

  // Render List with contacts
  const renderListState = () => {
    const primaryContacts = contacts.filter(c => c.is_primary === 1);
    const otherContacts = contacts.filter(c => c.is_primary !== 1);

    return (
      <>
        <Text style={styles.instruction}>
          You can add up to 5 people to your emergency contacts. 
          In case of emergency you can choose to inform them when you raise an alert
        </Text>

        {/* PRIMARY CONTACT SECTION */}
        {primaryContacts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Primary Emergency Contact</Text>
            {primaryContacts.map(contact => renderContactItem(contact))}
          </>
        )}

        {/* OTHER CONTACTS SECTION */}
        {otherContacts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              {primaryContacts.length > 0 ? 'Other Emergency Contacts' : 'Emergency Contacts'}
            </Text>
            {otherContacts.map(contact => renderContactItem(contact))}
          </>
        )}

        {/* ADD BUTTON */}
        {contacts.length < 5 && (
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddContactPress}
            disabled={loading}
          >
            <Image
              source={require('../../../assets/icons/add.png')}
              style={styles.plusIcon2}
            />
          </TouchableOpacity>
        )}

        {/* MAX CONTACTS MESSAGE */}
        {contacts.length >= 5 && (
          <Text style={styles.maxContactsMessage}>
            Maximum 5 emergency contacts reached
          </Text>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E293B']}
            tintColor="#1E293B"
          />
        }
      >
        {/* YELLOW HEADER */}
        <Image
          source={require('../../../assets/images/profile_bg.png')}
          style={styles.headerBg}
          resizeMode="stretch"
        />
        
        {/* HEADER ROW */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Image
              source={require('../../../assets/icons/left_arrow.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            Emergency Contacts
          </Text>
        </View>

        {/* WHITE CARD */}
        <View style={styles.card}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1E293B" />
              <Text style={styles.loadingText}>Loading contacts...</Text>
            </View>
          ) : (
            <>
              {contacts.length === 0 && renderEmptyState()}
              {contacts.length > 0 && renderListState()}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmergencyContactsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    paddingTop: sh(20),
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: sh(180),
    width: '100%',
    zIndex: -1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(20),
    paddingHorizontal: sw(20),
  },
  backIcon: {
    width: sw(8),
    height: sh(15),
    tintColor: '#0F172A',
    marginRight: sw(16),
  },
  headerTitle: {
    fontSize: sf(20),
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: getFontFamily('bold')
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: s(24),
    padding: s(15),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: s(10),
    shadowOffset: { width: 0, height: sh(4) },
    elevation: s(1),
    marginTop: sh(10),
    marginHorizontal: sw(15),
    minHeight: sh(300),
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: sh(50),
  },
  loadingText: {
    marginTop: sh(20),
    fontSize: sf(16),
    color: '#6B7280',
    fontFamily: getFontFamily('regular'),
  },
  emptyTitle: {
    fontSize: sf(18),
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: sh(20),
    fontFamily: getFontFamily('medium'),
  },
  instruction: {
    fontSize: sf(12),
    color: '#374151',
    marginBottom: sh(24),
    lineHeight: sh(20),
    fontFamily: getFontFamily('regular')
  },
  sectionTitle: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: sh(12),
    marginTop: sh(8),
    fontFamily: getFontFamily('semiBold'),
  },
  addContactBtn: {
    backgroundColor: '#111827',
    borderRadius: s(14),
    paddingVertical: sh(12),
    paddingHorizontal: sw(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  plusIcon: {
    width: sw(20),
    height: sh(20),
    tintColor: '#FFFFFF',
    marginRight: sw(8),
    alignSelf: 'center',
  },
  plusIcon2: {
    width: sw(45),
    height: sh(45),
    alignItems: 'center',
    margin: s(10)
  },
  addContactText: {
    color: '#FFFFFF',
    fontSize: sf(16),
    fontFamily: getFontFamily('regular'),
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: s(16),
    padding: s(8),
    marginBottom: sh(12),
    borderWidth: s(1),
    borderColor: '#CBD5E1',
    borderStyle: 'dashed'
  },
  avatarContainer: {
    position: 'relative',
    marginRight: sw(12),
  },
  avatar: {
    width: sw(45),
    height: sh(45),
  },
  primaryBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#10B981',
    borderRadius: s(5),
    paddingHorizontal: sw(6)
  },
  primaryBadgeText: {
    color: '#FFFFFF',
    fontSize: sf(6),
    fontFamily: getFontFamily('regular'),
  },
  contactInfo: {
    flex: 1
  },
  contactName: {
    fontSize: sf(14),
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: getFontFamily('semiBold'),
  },
  contactNumber: {
    fontSize: sf(12),
    color: '#374151',
    fontFamily: getFontFamily('regular'),
    marginVertical: sh(2),
  },
  contactStatus: {
    fontSize: sf(10),
    color: '#6B7280',
    fontFamily: getFontFamily('regular'),
  },
  relationshipText: {
    fontSize: sf(12),
    color: '#4F46E5',
    fontFamily: getFontFamily('semiBold'),
    marginTop: sh(2),
  },
  arrowIcon: {
    width: sw(24),
    height: sh(24),
    tintColor: '#0F172A',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: sh(20)
  },
  maxContactsMessage: {
    fontSize: sf(14),
    color: '#6B7280',
    textAlign: 'center',
    marginTop: sh(20),
    fontFamily: getFontFamily('regular'),
    fontStyle: 'italic',
  },
});