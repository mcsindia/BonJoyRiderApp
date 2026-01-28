import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { getFontFamily } from '../../../utils/fontFamily';
import { s, sf, sh, sw } from '../../../utils/scale';

import {
  updateUserContact,
  deleteUserContact,
  getUserContactById,
  getAllUserContacts,
  UserContact,
} from '../../../Services/BonjoyApi';

const EmergencyContactDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Extract contactId from route params
  const params = route.params as any;
  const contactId = params?.contactId;
  
  const [contact, setContact] = useState<UserContact | null>(null);
  const [allContacts, setAllContacts] = useState<UserContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  // Fetch contact data
  useEffect(() => {
    if (contactId) {
      fetchContactData();
    } else {
      showCustomAlert('Error', 'Contact information not found.', () => {
        navigation.goBack();
      });
    }
  }, [contactId]);

  const fetchContactData = async () => {
    try {
      setLoading(true);
      
      // Fetch all contacts first
      const allContactsData = await getAllUserContacts();
      setAllContacts(allContactsData || []);
      
      // Try to find the contact in the list
      let foundContact = allContactsData?.find(c => c.id === contactId);
      
      // If not found in list, try individual fetch
      if (!foundContact) {
        try {
          foundContact = await getUserContactById(contactId);
        } catch (error) {
          console.error('Individual fetch failed:', error);
        }
      }
      
      if (foundContact) {
        setContact(foundContact);
      } else {
        showCustomAlert('Error', 'Contact not found.', () => {
          navigation.goBack();
        });
      }
      
    } catch (error) {
      console.error('Error fetching contact data:', error);
      showCustomAlert('Error', 'Failed to load contact details.', () => {
        navigation.goBack();
      });
    } finally {
      setLoading(false);
    }
  };

  // Custom alert function as alternative to Alert.alert
  const showCustomAlert = (title: string, message: string, onOk?: () => void) => {
    // Try native Alert first
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          onPress: () => {
            if (onOk) onOk();
          },
        },
      ]
    );
  };

  // Helper function to get error message from API response
  const getErrorMessage = (error: any): string => {
    if (error?.response?.data) {
      const data = error.response.data;
      if (typeof data.message === 'string') {
        return data.message;
      } else if (data.message?.message) {
        return data.message.message;
      }
    }
    if (error?.message) {
      return error.message;
    }
    return 'Something went wrong. Please try again.';
  };

  // Get relationship label from value
  const getRelationshipLabel = (value: string) => {
    const option = relationshipOptions.find(opt => opt.value === value);
    return option ? option.label : 'Friend';
  };

  // Toggle primary contact
  const handleTogglePrimary = async () => {
    if (!contact) return;
    
    setIsLoading(true);
    
    try {
      const currentIsPrimary = contact.is_primary || 0;
      const newIsPrimary = currentIsPrimary === 1 ? 0 : 1;
      
      console.log('Toggling primary for contact ID:', contact.id);
      
      // First, update all existing primary contacts to non-primary
      const currentPrimaryContacts = allContacts.filter(c => c.is_primary === 1 && c.id !== contact.id);
      
      // Update all current primary contacts to non-primary
      for (const primaryContact of currentPrimaryContacts) {
        try {
          console.log('Updating contact', primaryContact.id, 'to non-primary');
          await updateUserContact(primaryContact.id, {
            is_primary: 0,
          });
        } catch (error) {
          console.error('Error updating contact', primaryContact.id, ':', error);
        }
      }
      
      // Then update the selected contact
      await updateUserContact(contact.id, {
        is_primary: newIsPrimary,
      });
      
      // Update local state immediately for better UX
      setContact({
        ...contact,
        is_primary: newIsPrimary
      });
      
      // Update all contacts state
      const updatedAllContacts = allContacts.map(c => {
        if (c.id === contact.id) {
          return { ...c, is_primary: newIsPrimary };
        } else if (c.is_primary === 1) {
          return { ...c, is_primary: 0 };
        }
        return c;
      });
      setAllContacts(updatedAllContacts);
      
      showCustomAlert(
        'Success',
        newIsPrimary === 1 
          ? 'Contact set as primary emergency contact' 
          : 'Contact removed as primary',
        () => {
          // Navigate back to list
          navigation.goBack();
        }
      );
      
    } catch (error: any) {
      console.error('Error updating contact:', error);
      const errorMessage = getErrorMessage(error);
      showCustomAlert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show delete confirmation modal
  const handleDeletePress = () => {
    if (!contact) return;
    setShowDeleteModal(true);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Confirm and execute delete
  const handleConfirmDelete = async () => {
    if (!contact) return;
    
    setShowDeleteModal(false);
    setIsLoading(true);
    
    try {
      console.log('Calling delete API for contact ID:', contact.id);
      
      // Call the delete API - it returns { success: boolean, message: string }
      const deleteResult = await deleteUserContact(contact.id);
      
      console.log('Delete result:', deleteResult);
      
      if (deleteResult.success) {
        showCustomAlert(
          'Success',
          deleteResult.message || 'Contact deleted successfully',
          () => {
            // Navigate back to list
            navigation.goBack();
          }
        );
      } else {
        throw new Error(deleteResult.message || 'Failed to delete contact');
      }
      
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      const errorMessage = getErrorMessage(error);
      showCustomAlert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E293B" />
          <Text style={styles.loadingText}>Loading contact details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!contact) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Contact not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isPrimary = contact.is_primary === 1;
  const hasOtherContacts = allContacts.length > 1;
  
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
            disabled={isLoading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={require('../../../assets/icons/left_arrow.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            Contact Details
          </Text>
        </View>

        {/* WHITE CARD */}
        <View style={styles.card}>
          {/* CONTACT HEADER CARD */}
          <View style={styles.contactDetailCard}>
            <View style={styles.detailAvatar}>
              <Image
                source={require('../../../assets/images/contact.png')}
                style={styles.detailAvatarImg}
              />
              {isPrimary && (
                <View style={styles.detailPrimaryBadge}>
                  <Text style={styles.detailPrimaryBadgeText}>Primary</Text>
                </View>
              )}
            </View>

            <View>
              <Text style={styles.detailName}>{contact.contactName}</Text>
              <Text style={styles.detailNumber}>
                {contact.contactNumber ? `+91 ${contact.contactNumber}` : 'No number'}
              </Text>
              {contact.relationship && (
                <Text style={styles.detailRelationship}>
                  {getRelationshipLabel(contact.relationship)}
                </Text>
              )}
            </View>
          </View>

          {/* PRIMARY TOGGLE - Only show if there are other contacts */}
          {hasOtherContacts && (
            <TouchableOpacity
              style={[styles.detailRow, isLoading && styles.disabled]}
              onPress={handleTogglePrimary}
              disabled={isLoading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.detailRowLeft}>
                <Image
                  source={require('../../../assets/icons/u_bell.png')}
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
            style={[styles.detailRow, isLoading && styles.disabled]}
            onPress={handleDeletePress}
            disabled={isLoading}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.detailRowLeft}>
              <Image
                source={require('../../../assets/icons/u_user.png')}
                style={[styles.detailIcon, { tintColor: '#EF4444' }]}
              />
              <Text style={styles.deleteText}>Delete Contact</Text>
            </View>
            <Image
              source={require('../../../assets/icons/right_arrow.png')}
              style={styles.arrowIcon}
            />
          </TouchableOpacity>

          {/* LOADING INDICATOR */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#1E293B" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete Contact</Text>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete {contact?.contactName} from your emergency contacts?
              </Text>
              <Text style={styles.modalSubMessage}>
                This action cannot be undone.
              </Text>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelDelete}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleConfirmDelete}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Image
        source={require('../../../assets/images/bottom_bg.png')}
        style={styles.footerImage}
        resizeMode="stretch"
      />
    </SafeAreaView>
  );
};

export default EmergencyContactDetailScreen;

// Updated styles with modal styles
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: sh(50),
  },
  errorText: {
    fontSize: sf(16),
    color: '#EF4444',
    marginBottom: sh(20),
    fontFamily: getFontFamily('regular'),
  },
  backButton: {
    backgroundColor: '#111827',
    borderRadius: s(14),
    paddingVertical: sh(12),
    paddingHorizontal: sw(24),
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: sf(16),
    fontFamily: getFontFamily('regular'),
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
  arrowIcon: {
    width: sw(24),
    height: sh(24),
    tintColor: '#0F172A',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s(12),
  },
  disabled: {
    opacity: 0.5,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: sw(20),
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: s(20),
    width: '100%',
    maxWidth: sw(400),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: sh(4) },
        shadowOpacity: 0.1,
        shadowRadius: s(12),
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    paddingVertical: sh(20),
    paddingHorizontal: sw(24),
    borderBottomWidth: s(1),
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: sf(18),
    fontFamily: getFontFamily('bold'),
    color: '#1F2937',
    textAlign: 'center',
  },
  modalBody: {
    paddingVertical: sh(24),
    paddingHorizontal: sw(24),
  },
  modalMessage: {
    fontSize: sf(16),
    fontFamily: getFontFamily('regular'),
    color: '#374151',
    textAlign: 'center',
    lineHeight: sh(24),
    marginBottom: sh(8),
  },
  modalSubMessage: {
    fontSize: sf(14),
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: sh(20),
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: s(1),
    borderTopColor: '#E5E7EB',
  },
  modalButton: {
    flex: 1,
    paddingVertical: sh(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderRightWidth: s(1),
    borderRightColor: '#E5E7EB',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  cancelButtonText: {
    fontSize: sf(16),
    fontFamily: getFontFamily('semiBold'),
    color: '#374151',
  },
  deleteButtonText: {
    fontSize: sf(16),
    fontFamily: getFontFamily('semiBold'),
    color: '#DC2626',
  },
});