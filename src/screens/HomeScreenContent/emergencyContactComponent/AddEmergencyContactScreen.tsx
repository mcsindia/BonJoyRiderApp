import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { getFontFamily } from '../../../utils/fontFamily';
import { s, sf, sh, sw } from '../../../utils/scale';

import {
  createUserContact,
  getAllUserContacts,
  getUserSession,
} from '../../../Services/BonjoyApi';

const AddEmergencyContactScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [relationship, setRelationship] = useState('friend');
  const [showRelationshipDropdown, setShowRelationshipDropdown] = useState(false);
  const [isPrimary, setIsPrimary] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);

  // Relationship options
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

  // Fetch user data and contacts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getUserSession();
        if (session) {
          setUserId(session.id);
        }
        
        const allContacts = await getAllUserContacts();
        setContacts(allContacts || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Get relationship label from value
  const getRelationshipLabel = (value: string) => {
    const option = relationshipOptions.find(opt => opt.value === value);
    return option ? option.label : 'Friend';
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter contact name');
      return false;
    }

    if (!mobile.trim() || mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return false;
    }

    if (!userId) {
      Alert.alert('Error', 'User session not found. Please try again.');
      return false;
    }

    if (!relationship.trim()) {
      Alert.alert('Error', 'Please select a relationship');
      return false;
    }

    if (contacts.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 emergency contacts');
      return false;
    }

    return true;
  };

  // Add new emergency contact
  const handleAddContact = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const shouldBePrimary = contacts.length === 0 ? 1 : isPrimary;
      
      await createUserContact(
        userId!,
        'emergency',
        name.trim(),
        mobile.trim(),
        shouldBePrimary,
        relationship
      );

      Alert.alert('Success', 'Emergency contact added successfully', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          }
        }
      ]);
      
    } catch (error: any) {
      console.error('Error adding contact:', error);
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const hasPrimaryContact = contacts.some((c: any) => c.is_primary === 1);
  const isFirstContact = contacts.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
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
            Add Emergency Contact
          </Text>
        </View>

        {/* WHITE CARD */}
        <View style={styles.card}>
          <TextInput
            placeholder="Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9CA3AF"
            fontFamily={getFontFamily('regular')}
            editable={!loading}
          />

          {/* MOBILE INPUT WITH COUNTRY CODE */}
          <View style={styles.mobileInputContainer}>
            <TouchableOpacity style={styles.countrySelector} disabled={loading}>
              <Image
                source={require('../../../assets/icons/india_flag.png')}
                style={styles.flag}
              />
              <Image
                source={require('../../../assets/icons/down_arrow.png')}
                style={styles.downArrow}
              />
            </TouchableOpacity>
            <View style={styles.divider} />
            <Text style={styles.callingCode}>+91</Text>
            <TextInput
              placeholder="Mobile number"
              style={styles.mobileInput}
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              maxLength={10}
              placeholderTextColor="#9CA3AF"
              fontFamily={getFontFamily('regular')}
              editable={!loading}
            />
          </View>

          {/* RELATIONSHIP DROPDOWN */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Relationship</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, loading && styles.disabled]}
              onPress={() => setShowRelationshipDropdown(!showRelationshipDropdown)}
              disabled={loading}
            >
              <Text style={styles.dropdownButtonText}>
                {getRelationshipLabel(relationship)}
              </Text>
              <Image
                source={require('../../../assets/icons/down_arrow.png')}
                style={[styles.dropdownArrow, showRelationshipDropdown && styles.dropdownArrowRotated]}
              />
            </TouchableOpacity>
            
            {showRelationshipDropdown && (
              <View style={styles.dropdownOptions}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                  {relationshipOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setRelationship(option.value);
                        setShowRelationshipDropdown(false);
                      }}
                      disabled={loading}
                    >
                      <Text style={styles.dropdownOptionText}>{option.label}</Text>
                      {relationship === option.value && (
                        <Image
                          source={require('../../../assets/icons/add.png')}
                          style={styles.checkIcon}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* PRIMARY CHECKBOX LOGIC */}
          {isFirstContact ? (
            <View style={styles.primaryNoteContainer}>
              <Text style={styles.primaryNote}>
                This will be set as your primary emergency contact since it's your first contact.
              </Text>
            </View>
          ) : !hasPrimaryContact && (
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsPrimary(isPrimary === 1 ? 0 : 1)}
              disabled={loading}
            >
              <View style={[styles.checkbox, isPrimary === 1 && styles.checkboxChecked]}>
                {isPrimary === 1 && (
                  <Image
                    source={require('../../../assets/icons/add.png')}
                    style={styles.checkIconSmall}
                  />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Set as primary emergency contact</Text>
            </TouchableOpacity>
          )}

          {/* SAVE / CANCEL BUTTONS */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.cancelBtn, loading && styles.disabledBtn]} 
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveBtn, loading && styles.disabledBtn]} 
              onPress={handleAddContact}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.saveText}>Add Contact</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Image
        source={require('../../../assets/images/bottom_bg.png')}
        style={styles.footerImage}
        resizeMode="stretch"
      />
    </SafeAreaView>
  );
};

export default AddEmergencyContactScreen;

// Keep the same styles as the original AddEmergencyContact component
const styles = StyleSheet.create({
  footerImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: sh(120),
    zIndex: 10,
  },
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
    padding: s(24),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: s(10),
    shadowOffset: { width: 0, height: sh(4) },
    elevation: s(5),
    marginTop: sh(40),
    marginHorizontal: sw(20),
    paddingVertical: sh(50),
    minHeight: sh(300),
    position: 'relative',
  },
  input: {
    borderWidth: s(1.2),
    borderColor: '#E2E8F0',
    borderRadius: s(12),
    paddingHorizontal: sw(16),
    paddingVertical: sh(12),
    fontSize: sf(16),
    marginBottom: sh(16),
    backgroundColor: '#F3F4F6',
    fontFamily: getFontFamily('regular'),
  },
  mobileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: s(1.2),
    borderColor: '#E2E8F0',
    borderRadius: s(12),
    backgroundColor: '#F3F4F6',
    paddingStart: sw(5),
    justifyContent: 'center',
    marginBottom: sh(16),
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(8),
  },
  flag: {
    width: sw(24),
    height: sh(16),
    resizeMode: 'cover',
  },
  downArrow: {
    width: sw(12),
    height: sh(12),
    tintColor: '#6B7280',
    marginLeft: sw(6),
  },
  divider: {
    width: s(1.2),
    height: '70%',
    backgroundColor: '#E2E8F0',
    marginHorizontal: sw(8),
  },
  callingCode: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#0F172A',
    marginHorizontal: sw(4),
    fontFamily: getFontFamily('semiBold'),
  },
  mobileInput: {
    flex: 1,
    fontSize: sf(16),
    fontFamily: getFontFamily('regular'),
    textAlignVertical: 'center',
    paddingVertical: sh(12),
    paddingHorizontal: sw(8),
  },
  dropdownContainer: {
    marginBottom: sh(16),
    position: 'relative',
    zIndex: 1,
  },
  dropdownLabel: {
    fontSize: sf(14),
    color: '#374151',
    marginBottom: sh(8),
    fontFamily: getFontFamily('regular'),
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: s(1.2),
    borderColor: '#E2E8F0',
    borderRadius: s(12),
    paddingHorizontal: sw(16),
    paddingVertical: sh(12),
    backgroundColor: '#F3F4F6',
  },
  dropdownButtonText: {
    fontSize: sf(16),
    color: '#0F172A',
    fontFamily: getFontFamily('regular'),
  },
  dropdownArrow: {
    width: sw(16),
    height: sh(16),
    tintColor: '#6B7280',
  },
  dropdownArrowRotated: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownOptions: {
    position: 'absolute',
    top: sh(70),
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: s(12),
    borderWidth: s(1),
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: s(10),
    shadowOffset: { width: 0, height: sh(4) },
    elevation: s(5),
    maxHeight: sh(200),
    zIndex: 1000,
  },
  dropdownScroll: {
    maxHeight: sh(200),
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sw(16),
    paddingVertical: sh(12),
    borderBottomWidth: s(1),
    borderBottomColor: '#F3F4F6',
  },
  dropdownOptionText: {
    fontSize: sf(16),
    color: '#0F172A',
    fontFamily: getFontFamily('regular'),
  },
  checkIcon: {
    width: sw(16),
    height: sh(16),
    tintColor: '#10B981',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(24),
  },
  checkbox: {
    width: sw(20),
    height: sh(20),
    borderWidth: s(2),
    borderColor: '#D1D5DB',
    borderRadius: s(4),
    marginRight: sw(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkIconSmall: {
    width: sw(12),
    height: sh(12),
    tintColor: '#FFFFFF',
  },
  checkboxLabel: {
    fontSize: sf(14),
    color: '#0F172A',
    fontFamily: getFontFamily('regular'),
  },
  primaryNoteContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: s(12),
    padding: s(12),
    marginBottom: sh(24),
    borderWidth: s(1),
    borderColor: '#BAE6FD',
  },
  primaryNote: {
    fontSize: sf(14),
    color: '#0369A1',
    fontFamily: getFontFamily('regular'),
    lineHeight: sh(20),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: sh(30),
    gap: sw(12),
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: s(14),
    paddingVertical: sh(14),
    paddingHorizontal: sw(12),
    borderWidth: s(1),
    borderColor: '#E5E7EB',
  },
  cancelText: {
    color: '#374151',
    fontSize: sf(16),
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: getFontFamily('semiBold'),
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: s(14),
    paddingVertical: sh(14),
    paddingHorizontal: sw(12),
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: sf(16),
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: getFontFamily('semiBold'),
  },
  disabled: {
    opacity: 0.5,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});