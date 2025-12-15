// src/screens/EmergencyContactsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { getFontFamily } from '../../utils/fontFamily';
import { s, sf, sh, sw } from '../../utils/scale';

import {
  createUserContact,
  getAllUserContacts,
  getUserContactById,
  updateUserContact,
  deleteUserContact,
  syncUserContacts,
  getUserSession,
  UserContact,
} from '../../Services/BonjoyApi';

const EmergencyContactsScreen = ({ navigation }: any) => {
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [view, setView] = useState<'list' | 'add' | 'detail'>('list');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [countryCode, setCountryCode] = useState('IN');
  const [callingCode, setCallingCode] = useState('91');
  const [selectedContact, setSelectedContact] = useState<UserContact | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  
  // New states for the add form
  const [isPrimary, setIsPrimary] = useState(0); // 0 or 1
  const [relationship, setRelationship] = useState('friend');
  const [showRelationshipDropdown, setShowRelationshipDropdown] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);

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

  /* =====================================================
     INITIALIZATION & DATA FETCHING
  ====================================================== */

  const fetchUserData = useCallback(async () => {
    try {
      const session = await getUserSession();
      if (session) {
        setUserId(session.id);
      }
    } catch (error) {
      console.error('Error fetching user session:', error);
    }
  }, []);

  const fetchContacts = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      const allContacts = await getAllUserContacts();
      console.log("Fetched contacts:", allContacts);
      setContacts(allContacts || []);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUserData();
    fetchContacts();
  }, [fetchUserData, fetchContacts]);

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
    } finally {
      setRefreshing(false);
    }
  };

  /* =====================================================
     CONTACT OPERATIONS - FIXED WITH PROPER VIEW TRANSITIONS
  ====================================================== */

  // Reset form and go back to list view
  const handleCancel = useCallback(() => {
    setView('list');
    setName('');
    setMobile('');
    setIsPrimary(0);
    setRelationship('friend');
    setShowRelationshipDropdown(false);
    setSelectedContact(null);
  }, []);

  // Add new emergency contact - FIXED: Automatically goes to list view after success
  const handleAddContact = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter contact name');
      return;
    }

    if (!mobile.trim() || mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User session not found');
      return;
    }

    if (!relationship.trim()) {
      Alert.alert('Error', 'Please select a relationship');
      return;
    }

    if (contacts.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 emergency contacts');
      return;
    }

    setOperationLoading(true);

    try {
      const shouldBePrimary = contacts.length === 0 ? 1 : isPrimary;
      
      await createUserContact(
        userId,
        'emergency',
        name.trim(),
        mobile.trim(),
        shouldBePrimary,
        relationship
      );

      // Refresh contacts immediately
      await fetchContacts(false);
      
      // Automatically go back to list view and show success
      handleCancel(); // This sets view to 'list' and resets form
      
      // Show success message
      setTimeout(() => {
        Alert.alert('Success', 'Emergency contact added successfully');
      }, 300); // Small delay to ensure UI transition is complete
      
    } catch (error: any) {
      console.error('Error adding contact:', error);
      Alert.alert('Error', error.message || 'Failed to add contact');
    } finally {
      setOperationLoading(false);
    }
  };

  // Delete contact - FIXED: Automatically goes to list view after deletion
  const handleDeleteContact = async (contactId: number) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setOperationLoading(true);
            try {
              // Call the delete API
              await deleteUserContact(contactId);
              
              // Refresh contacts immediately
              await fetchContacts(false);
              
              // If we're in detail view, go back to list
              handleCancel(); // This will always go back to list view
              
              // Show success message after navigation
              setTimeout(() => {
                Alert.alert('Success', 'Contact deleted successfully');
              }, 300);
              
            } catch (error: any) {
              console.error('Error deleting contact:', error);
              Alert.alert('Error', error.message || 'Failed to delete contact');
            } finally {
              setOperationLoading(false);
            }
          },
        },
      ]
    );
  };

  // Toggle primary contact - FIXED with immediate UI update
  const handleTogglePrimary = async (contactId: number, currentIsPrimary: number) => {
    setOperationLoading(true);
    
    try {
      const newIsPrimary = currentIsPrimary === 1 ? 0 : 1;
      
      // Update local state immediately for better UX
      if (selectedContact) {
        setSelectedContact({
          ...selectedContact,
          is_primary: newIsPrimary,
        });
      }
      
      // Update contacts list immediately
      setContacts(prevContacts => 
        prevContacts.map(contact => {
          if (contact.is_primary === 1 && contact.id !== contactId) {
            return { ...contact, is_primary: 0 };
          }
          if (contact.id === contactId) {
            return { ...contact, is_primary: newIsPrimary };
          }
          return contact;
        })
      );
      
      // Update current primary contact if exists
      const currentPrimary = contacts.find(contact => contact.is_primary === 1);
      if (currentPrimary && currentPrimary.id !== contactId) {
        await updateUserContact(currentPrimary.id, {
          is_primary: 0,
        });
      }
      
      // Update the selected contact
      await updateUserContact(contactId, {
        is_primary: newIsPrimary,
      });
      
      // Show success message
      Alert.alert(
        'Success',
        newIsPrimary === 1 
          ? 'Contact set as ' 
          : 'Contact removed as primary'
      );
      
    } catch (error: any) {
      console.error('Error updating contact:', error);
      Alert.alert('Error', error.message || 'Failed to update contact');
      // Revert state on error
      fetchContacts(false);
    } finally {
      setOperationLoading(false);
    }
  };

  // Show contact detail
  const handleContactPress = async (contact: UserContact) => {
    try {
      setLoading(true);
      const freshContact = await getUserContactById(contact.id);
      setSelectedContact(freshContact);
      setView('detail');
    } catch (error: any) {
      console.error('Error fetching contact details:', error);
      setSelectedContact(contact);
      setView('detail');
    } finally {
      setLoading(false);
    }
  };

  // Get relationship label from value
  const getRelationshipLabel = (value: string) => {
    const option = relationshipOptions.find(opt => opt.value === value);
    return option ? option.label : 'Friend';
  };

  /* =====================================================
     RENDER FUNCTIONS
  ====================================================== */

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
        onPress={() => {
          setIsPrimary(1);
          setView('add');
        }}
        disabled={loading || operationLoading}
      >
        <Image
          source={require('../../assets/icons/add.png')}
          style={styles.plusIcon}
        />
        <Text style={styles.addContactText}>Add Emergency Contact</Text>
      </TouchableOpacity>
    </>
  );

  // Render Contact Item
  const renderContactItem = (contact: UserContact) => {
    const isPrimary = contact.is_primary === 1;
    
    return (
      <TouchableOpacity
        key={contact.id}
        style={styles.contactItem}
        onPress={() => handleContactPress(contact)}
        disabled={loading || operationLoading}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={require('../../assets/images/contact.png')}
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
          {contact.relationship && (
            <Text style={styles.relationshipText}>
              {getRelationshipLabel(contact.relationship)}
            </Text>
          )}
        </View>
        <Image
          source={require('../../assets/icons/right_arrow_circle.png')}
          style={styles.arrowIcon}
        />
      </TouchableOpacity>
    );
  };

  // Render List State
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
            onPress={() => {
              setIsPrimary(0);
              setView('add');
            }}
            disabled={loading || operationLoading}
          >
            {operationLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Image
                source={require('../../assets/icons/add.png')}
                style={styles.plusIcon2}
              />
            )}
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

  // Render Add Form State
  const renderAddForm = () => {
    const hasPrimaryContact = contacts.some(c => c.is_primary === 1);
    const isFirstContact = contacts.length === 0;

    return (
      <>
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor="#9CA3AF"
          fontFamily={getFontFamily('regular')}
          editable={!operationLoading}
        />

        {/* MOBILE INPUT WITH COUNTRY CODE */}
        <View style={styles.mobileInputContainer}>
          <TouchableOpacity 
            style={styles.countrySelector}
            disabled={operationLoading}
          >
            <Image
              source={require('../../assets/icons/india_flag.png')}
              style={styles.flag}
            />
            <Image
              source={require('../../assets/icons/down_arrow.png')}
              style={styles.downArrow}
            />
          </TouchableOpacity>
          <View style={styles.divider} />
          <Text style={styles.callingCode}>+{callingCode}</Text>
          <TextInput
            placeholder="Mobile number"
            style={styles.mobileInput}
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            maxLength={10}
            placeholderTextColor="#9CA3AF"
            fontFamily={getFontFamily('regular')}
            editable={!operationLoading}
          />
        </View>

        {/* RELATIONSHIP DROPDOWN */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Relationship</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowRelationshipDropdown(!showRelationshipDropdown)}
            disabled={operationLoading}
          >
            <Text style={styles.dropdownButtonText}>
              {getRelationshipLabel(relationship)}
            </Text>
            <Image
              source={require('../../assets/icons/down_arrow.png')}
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
                    disabled={operationLoading}
                  >
                    <Text style={styles.dropdownOptionText}>{option.label}</Text>
                    {relationship === option.value && (
                      <Image
                        source={require('../../assets/icons/add.png')}
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
            disabled={operationLoading}
          >
            <View style={[styles.checkbox, isPrimary === 1 && styles.checkboxChecked]}>
              {isPrimary === 1 && (
                <Image
                  source={require('../../assets/icons/add.png')}
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
            style={[styles.cancelBtn, (loading || operationLoading) && styles.disabledBtn]} 
            onPress={handleCancel}
            disabled={loading || operationLoading}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveBtn, (loading || operationLoading) && styles.disabledBtn]} 
            onPress={handleAddContact}
            disabled={loading || operationLoading}
          >
            {operationLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.saveText}>Add Contact</Text>
            )}
          </TouchableOpacity>
        </View>
      </>
    );
  };

  // Render Contact Detail
  const renderContactDetail = () => {
    if (!selectedContact) return null;

    const isPrimary = selectedContact.is_primary === 1;
    const hasOtherContacts = contacts.length > 1;
    
    return (
      <View>
        {/* CONTACT HEADER CARD */}
        <View style={styles.contactDetailCard}>
          <View style={styles.detailAvatar}>
            <Image
              source={require('../../assets/images/contact.png')}
              style={styles.detailAvatarImg}
            />
            {isPrimary && (
              <View style={styles.detailPrimaryBadge}>
                <Text style={styles.detailPrimaryBadgeText}>Primary</Text>
              </View>
            )}
          </View>

          <View>
            <Text style={styles.detailName}>{selectedContact.contactName}</Text>
            <Text style={styles.detailNumber}>
              {selectedContact.contactNumber ? `+91 ${selectedContact.contactNumber}` : 'No number'}
            </Text>
            {selectedContact.relationship && (
              <Text style={styles.detailRelationship}>
                {getRelationshipLabel(selectedContact.relationship)}
              </Text>
            )}
          </View>
        </View>

        {/* PRIMARY TOGGLE - Only show if there are other contacts */}
        {hasOtherContacts && (
          <TouchableOpacity
            style={styles.detailRow}
            onPress={() => handleTogglePrimary(selectedContact.id, selectedContact.is_primary || 0)}
            disabled={operationLoading}
          >
            <View style={styles.detailRowLeft}>
              <Image
                source={require('../../assets/icons/u_bell.png')}
                style={styles.detailIcon}
              />
              <View>
                <Text style={styles.detailTitle}>
                  {isPrimary ? 'Primary emergency contact' : 'Set as primary contact'}
                </Text>
                <Text style={styles.detailSubtitle}>
                  {isPrimary 
                    ? 'This contact will be notified first during emergencies'
                    : 'Make this your primary emergency contact'
                  }
                </Text>
              </View>
            </View>
            <View style={[
              styles.toggle,
              { backgroundColor: isPrimary ? '#10B981' : '#D1D5DB' }
            ]}>
              <View style={[
                styles.toggleCircle,
                { 
                  alignSelf: isPrimary ? 'flex-end' : 'flex-start',
                  marginHorizontal: isPrimary ? 2 : 2
                }
              ]} />
            </View>
          </TouchableOpacity>
        )}

        {/* DELETE ROW */}
        <TouchableOpacity
          style={styles.detailRow}
          onPress={() => handleDeleteContact(selectedContact.id)}
          disabled={operationLoading}
        >
          <View style={styles.detailRowLeft}>
            <Image
              source={require('../../assets/icons/u_user.png')}
              style={[styles.detailIcon, { tintColor: '#EF4444' }]}
            />
            <Text style={styles.deleteText}>Delete Contact</Text>
          </View>
          <Image
            source={require('../../assets/icons/right_arrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>

        {/* OPERATION LOADER */}
        {operationLoading && (
          <View style={styles.overlayLoader}>
            <ActivityIndicator size="large" color="#1E293B" />
            <Text style={styles.overlayText}>Processing...</Text>
          </View>
        )}
      </View>
    );
  };

  /* =====================================================
     MAIN RENDER
  ====================================================== */

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
          source={require('../../assets/images/profile_bg.png')}
          style={styles.headerBg}
          resizeMode="stretch"
        />
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => {
              if (view === 'detail' || view === 'add') {
                handleCancel();
              } else {
                navigation.goBack();
              }
            }}
            disabled={loading || operationLoading}
          >
            <Image
              source={require('../../assets/icons/left_arrow.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {view === 'list' 
              ? 'Emergency Contacts' 
              : view === 'add' 
                ? 'Add Emergency Contact' 
                : 'Contact Details'
            }
          </Text>
        </View>

        {/* WHITE CARD */}
        <View style={styles.card}>
          {loading && view === 'list' ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1E293B" />
              <Text style={styles.loadingText}>Loading contacts...</Text>
            </View>
          ) : (
            <>
              {view === 'list' && contacts.length === 0 && renderEmptyState()}
              {view === 'list' && contacts.length > 0 && renderListState()}
              {view === 'add' && renderAddForm()}
              {view === 'detail' && renderContactDetail()}
            </>
          )}

          {/* OVERLAY LOADER FOR OPERATIONS */}
          {(operationLoading && view === 'list') && (
            <View style={styles.overlayLoader}>
              <ActivityIndicator size="large" color="#1E293B" />
              <Text style={styles.overlayText}>Processing...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmergencyContactsScreen;

/* =====================================================
   STYLES
====================================================== */

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
    fontSize: sf(14),
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
    width: sw(40),
    height: sh(40),
    alignItems: 'center',
    tintColor: 'white',
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
    padding: s(12),
    marginBottom: sh(12),
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
    borderRadius: s(10),
    paddingHorizontal: sw(6),
    paddingVertical: sh(2),
  },
  primaryBadgeText: {
    color: '#FFFFFF',
    fontSize: sf(10),
    fontFamily: getFontFamily('semiBold'),
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: getFontFamily('semiBold'),
  },
  contactNumber: {
    fontSize: sf(14),
    color: '#374151',
    fontFamily: getFontFamily('regular'),
    marginVertical: sh(2),
  },
  contactStatus: {
    fontSize: sf(12),
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
    borderRadius: s(32),
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: sh(24),
    width: sw(60),
    height: sh(60),
  },
  maxContactsMessage: {
    fontSize: sf(14),
    color: '#6B7280',
    textAlign: 'center',
    marginTop: sh(20),
    fontFamily: getFontFamily('regular'),
    fontStyle: 'italic',
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
  // Dropdown styles
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
  // Checkbox styles
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
  // Primary note style
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
  disabledBtn: {
    opacity: 0.5,
  },
  contactDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: s(1),
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: s(20),
    padding: s(16),
    marginBottom: sh(24),
  },
  detailAvatar: {
    position: 'relative',
    marginRight: sw(16),
  },
  detailAvatarImg: {
    width: sw(60),
    height: sh(60),
  },
  detailPrimaryBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#10B981',
    borderRadius: s(10),
    paddingHorizontal: sw(8),
    paddingVertical: sh(3),
  },
  detailPrimaryBadgeText: {
    color: '#FFFFFF',
    fontSize: sf(10),
    fontFamily: getFontFamily('semiBold'),
  },
  detailName: {
    fontSize: sf(20),
    fontFamily: getFontFamily('bold'),
    color: '#0F172A',
  },
  detailNumber: {
    fontSize: sf(16),
    color: '#374151',
    marginTop: sh(4),
    fontFamily: getFontFamily('regular'),
  },
  detailRelationship: {
    fontSize: sf(14),
    color: '#4F46E5',
    marginTop: sh(2),
    fontFamily: getFontFamily('semiBold'),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: sh(20),
    borderBottomWidth: s(1),
    borderBottomColor: '#E2E8F0',
  },
  detailRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    width: sw(24),
    height: sh(24),
    marginRight: sw(12),
    tintColor: '#374151',
  },
  detailTitle: {
    fontSize: sf(16),
    fontFamily: getFontFamily('semiBold'),
    color: '#0F172A',
  },
  detailSubtitle: {
    fontSize: sf(12),
    color: '#64748B',
    fontFamily: getFontFamily('regular'),
    marginTop: sh(4),
  },
  toggle: {
    width: sw(50),
    height: sh(28),
    borderRadius: s(14),
    padding: s(2),
    marginLeft: sw(12),
  },
  toggleCircle: {
    width: sw(24),
    height: sh(24),
    borderRadius: s(12),
    backgroundColor: '#FFFFFF',
  },
  deleteText: {
    fontSize: sf(16),
    color: '#EF4444',
    fontFamily: getFontFamily('semiBold'),
  },
  // Overlay loader
  overlayLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s(24),
    zIndex: 1000,
  },
  overlayText: {
    marginTop: sh(10),
    fontSize: sf(14),
    color: '#1E293B',
    fontFamily: getFontFamily('regular'),
  },
});