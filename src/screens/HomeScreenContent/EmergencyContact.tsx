// src/screens/EmergencyContactsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';

import { getFontFamily } from '../../utils/fontFamily';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
import { s, sf, sh, sw } from '../../utils/scale';

// Mock data — replace with real state or Redux later
const INITIAL_CONTACTS: any[] = [
  // example: { id: 1, name: 'Nikhil', sharing: false },
];

const EmergencyContactsScreen = ({ navigation }: any) => {
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [view, setView] = useState<'list' | 'add' | 'detail'>('list'); // 'list' or 'add' or 'detail'
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [countryCode, setCountryCode] = useState('IN');
  const [callingCode, setCallingCode] = useState('91');
  const [selectedContact, setSelectedContact] = useState<any>(null);

  // Go back to list view
  const handleCancel = () => {
    setView('list');
    setName('');
    setMobile('');
  };

  // Add contact to list
  const handleAddContact = () => {
    if (!name || !mobile) {
      alert('Please fill all fields');
      return;
    }

    const newContact = {
      id: Date.now(), // simple unique ID
      name,
      mobile,
      sharing: false,
    };

    setContacts([...contacts, newContact]);
    handleCancel();
  };

  // Open contact picker (mock)
  const handleAddFromContacts = () => {
    alert('Contact picker would open here');
  };

  // Show contact detail in same screen (no navigation)
  const handleContactPress = (contact: any) => {
    setSelectedContact(contact);
    setView('detail');
  };

  // Render Empty State
  const renderEmptyState = () => (
    <>
      <Text style={styles.emptyTitle}>Setup Emergency Contacts</Text>
      <Text style={styles.instruction}>
        You can add up to 5 people to your emergency contacts. In case of emergency you can choose to inform them when you raise an alert
      </Text>
      <TouchableOpacity style={styles.addContactBtn} onPress={() => setView('add')}>
        <Image
          source={require('../../assets/icons/add.png')}
          style={styles.plusIcon}
        />
        <Text style={styles.addContactText}>Add Emergency Contact</Text>
      </TouchableOpacity>
    </>
  );

  // Render List State
  const renderListState = () => (
    <>
      <Text style={styles.instruction}>
        You can add up to 5 people to your emergency contacts. In case of emergency you can choose to inform them when you raise an alert
      </Text>

      {/* CONTACT LIST */}
      {contacts.map(contact => (
        <TouchableOpacity
          key={contact.id}
          style={styles.contactItem}
          onPress={() => handleContactPress(contact)}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../assets/images/contact.png')}
              style={styles.avatar}
            />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactStatus}>
              {contact.sharing ? 'Sharing details' : 'Not sharing details'}
            </Text>
          </View>
          <Image
            source={require('../../assets/icons/right_arrow_circle.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      ))}

      {/* ADD BUTTON */}
      <TouchableOpacity style={styles.addButton} onPress={() => setView('add')}>
        <Image
          source={require('../../assets/icons/add.png')}
          style={styles.plusIcon2}
        />
      </TouchableOpacity>
    </>
  );

  // Render Add Form State
  const renderAddForm = () => (
    <>
      <TextInput
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholderTextColor="#9CA3AF"
        fontFamily={getFontFamily('regular')}
      />

      {/* MOBILE INPUT WITH COUNTRY CODE */}
      <View style={styles.mobileInputContainer}>
        <TouchableOpacity style={styles.countrySelector}>
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
        />
      </View>

      {/* ADD FROM CONTACTS BUTTON */}
      <TouchableOpacity style={styles.addFromContactsBtn} onPress={handleAddFromContacts}>
        <Text style={styles.addFromContactsText}>Add from contacts</Text>
      </TouchableOpacity>

      {/* SAVE / CANCEL BUTTONS */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleAddContact}>
          <Text style={styles.saveText}>Add Contact</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderContactDetail = () => {
    if (!selectedContact) return null; // safety guard
    return (
      <View>
        {/* CONTACT HEADER CARD */}
        <View style={styles.contactDetailCard}>
          <View style={styles.detailAvatar}>
            <Image
              source={require('../../assets/images/contact.png')}
              style={styles.detailAvatarImg}
            />
          </View>
    
          <View>
            <Text style={styles.detailName}>{selectedContact.name}</Text>
            <Text style={styles.detailNumber}>
              {selectedContact.mobile ? `+${callingCode} ${selectedContact.mobile}` : '+91 88889 78588'}
            </Text>
          </View>
        </View>
    
        {/* SHARING TOGGLE INFO */}
        <View style={styles.detailRow}>
          <View style={styles.detailRowLeft}>
            <Image
              source={require('../../assets/icons/u_bell.png')}
              style={styles.detailIcon}
            />
            <View>
              <Text style={styles.detailTitle}>Not sharing details</Text>
              <Text style={styles.detailSubtitle}>
                Share ride tracking link and driver details
              </Text>
            </View>
          </View>
    
          <View style={styles.fakeToggle} />
        </View>
    
        {/* DELETE ROW */}
        <TouchableOpacity
          style={styles.detailRow}
          onPress={() => {
            // optional: implement delete confirm later
            const filtered = contacts.filter(c => c.id !== selectedContact.id);
            setContacts(filtered);
            setSelectedContact(null);
            setView('list');
          }}
        >
          <View style={styles.detailRowLeft}>
            <Image
              source={require('../../assets/icons/u_user.png')}
              style={styles.detailIcon}
            />
            <Text style={styles.deleteText}>Delete Contact</Text>
          </View>
          <Image
            source={require('../../assets/icons/right_arrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>
    );
  };
  

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* YELLOW HEADER */}
        <Image
          source={require('../../assets/images/profile_bg.png')}
          style={styles.headerBg}
          resizeMode="stretch"
        />
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => {
              if (view === 'detail') {
                setView('list');
                setSelectedContact(null);
              } else {
                navigation.goBack();
              }
            }}
          >
            <Image
              source={require('../../assets/icons/left_arrow.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
         {view === 'list' && contacts.length > 0 ?
          <Text style={styles.headerTitle}>Setup Emergency Contacts</Text>
          :
          <Text style={styles.headerTitle}>Back</Text>
         }
        </View>

        {/* WHITE CARD */}
        <View style={styles.card}>
          {view === 'list' && contacts.length === 0 && renderEmptyState()}
          {view === 'list' && contacts.length > 0 && renderListState()}
          {view === 'add' && renderAddForm()}
          {view === 'detail' && renderContactDetail()}
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
    padding: s(24),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: s(10),
    shadowOffset: { width: 0, height: sh(4) },
    elevation: s(5),
    marginTop: sh(40),
    marginHorizontal: sw(20),
    paddingVertical: sh(50)
    
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

  addContactBtn: {
    backgroundColor: '#111827',
    borderRadius: s(14),
    paddingVertical: sh(8),
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
    marginBottom: sh(16),
  },

  avatarContainer: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: sw(12),
  },

  avatar: {
    width: sw(45),
    height: sh(45)
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

  contactStatus: {
    fontSize: sf(12),
    color: '#000000',
    fontFamily: getFontFamily('regular'),
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
  },

  input: {
    borderWidth: s(1.2),
    borderColor: '#E2E8F0',
    borderRadius: s(12),
    paddingHorizontal: sw(16),
    paddingVertical: sh(8),
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
  },

  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(8),
    borderRightWidth: s(1.2),
    borderRightColor: '#E2E8F0',
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

  callingCode: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#0F172A',
    marginHorizontal: sw(8),
    fontFamily: getFontFamily('semiBold'),
  },

  mobileInput: {
    flex: 1,
    fontSize: sf(16),
    fontFamily: getFontFamily('regular'),
    textAlignVertical: 'center',
  },

  addFromContactsBtn: {
    alignSelf: 'center',
    marginTop: sh(50),
  },

  addFromContactsText: {
    color: '#1D4ED8',
    fontSize: sf(14),
    textAlign: 'center',
    fontFamily: getFontFamily('regular'),
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: sh(14),
  },

  saveBtn: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: s(14),
    paddingVertical: sh(8),
    paddingHorizontal: sw(12),
    marginLeft: sw(8),
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: sf(12),
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: getFontFamily('semiBold'),
  },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    paddingVertical: sh(12),
    paddingHorizontal: sw(16),
    justifyContent: 'space-around',
    borderTopWidth: s(1),
    borderTopColor: '#334155',
  },

  navItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  navIcon: {
    width: sw(24),
    height: sh(24),
    tintColor: '#FFFFFF',
  },
  contactDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: s(1),
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: s(20),
    padding: s(8),
    marginBottom: sh(24),
  },
  
  detailAvatar: {
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: sw(16),
  },
  
  detailAvatarImg: {
    width: sw(45),
    height: sh(45),
  },
  
  detailName: {
    fontSize: sf(20),
    fontFamily: getFontFamily('bold'),
    color: '#0F172A',
  },
  
  detailNumber: {
    fontSize: sf(14),
    color: '#334155',
    marginTop: sh(4),
    fontFamily: getFontFamily('regular'),
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
  },
  
  detailIcon: {
    width: sw(22),
    height: sh(22),
    marginRight: sw(12),
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
  },
  
  fakeToggle: {
    width: sw(44),
    height: sh(24),
    borderRadius: s(12),
    backgroundColor: '#10B981',
  },
  
  deleteText: {
    fontSize: sf(16),
    color: '#000000',
    fontFamily: getFontFamily('semiBold'),
  },
  
});
