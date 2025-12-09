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

// Mock data — replace with real state or Redux later
const INITIAL_CONTACTS = [
  // { id: 1, name: 'Nikhil', sharing: false },
  // { id: 2, name: 'Aditya', sharing: false },
];

const EmergencyContactsScreen = ({ navigation }: any) => {
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [view, setView] = useState<'list' | 'add'>('list'); // 'list' or 'add'
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [countryCode, setCountryCode] = useState('IN');
  const [callingCode, setCallingCode] = useState('91');

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
      sharing: false,
    };

    setContacts([...contacts, newContact]);
    handleCancel();
  };

  // Open contact picker (mock)
  const handleAddFromContacts = () => {
    alert('Contact picker would open here');
  };

  // Edit existing contact (navigate to edit screen)
  const handleContactPress = (id: number) => {
    navigation.navigate('EditEmergencyContact', { contactId: id });
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
          onPress={() => handleContactPress(contact.id)}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../assets/images/personal_account_drawer.png')}
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
            source={require('../../assets/icons/left_arrow.png')}
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../assets/icons/left_arrow.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Setup Emergency Contacts</Text>
        </View>

        {/* WHITE CARD */}
        <View style={styles.card}>
          {view === 'list' && contacts.length === 0 && renderEmptyState()}
          {view === 'list' && contacts.length > 0 && renderListState()}
          {view === 'add' && renderAddForm()}
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      {/* <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require('../../assets/images/home_drawer.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require('../../assets/icons/ride.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require('../../assets/icons/profile.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require('../../assets/icons/camera.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require('../../assets/icons/support.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
};

export default EmergencyContactsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { paddingTop: 20},
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    width: '100%',
    zIndex: -1
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20 
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#0F172A',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: getFontFamily('bold'),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginTop: 40,
    marginHorizontal: 20 
  },
  emptyTitle: {
    fontSize: 18,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: getFontFamily('medium'),
  },
  instruction: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: getFontFamily('regular'),
    textAlign:'center'
  },
  addContactBtn: {
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  plusIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
    marginRight: 8,
    alignSelf: 'center'
  },
  plusIcon2: {
    width: 40,
    height: 40,
    alignItems: 'center',
    tintColor: 'white'
  },
  addContactText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: getFontFamily('regular')
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: getFontFamily('semiBold'),
  },
  contactStatus: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: getFontFamily('regular'),
  },
  arrowIcon: {
    width: 24,
    height: 24,
    tintColor: '#0F172A',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 24,
  },
  input: {
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    fontFamily: getFontFamily('regular'),
  },
  mobileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingStart: 5,
    justifyContent: 'center'
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRightWidth: 1.2,
    borderRightColor: '#E2E8F0',
  },
  flag: {
    width: 24,
    height: 16,
    resizeMode: 'cover',
  },
  downArrow: {
    width: 12,
    height: 12,
    tintColor: '#6B7280',
    marginLeft: 6,
  },

  callingCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginHorizontal: 8,
    fontFamily: getFontFamily('semiBold')
    
  },
  mobileInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    textAlignVertical: 'center'
  },
  addFromContactsBtn: {
    alignSelf: 'center',
    marginTop: 50
  },
  addFromContactsText: {
    color: '#1D4ED8',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: getFontFamily('regular'),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: getFontFamily('semiBold'),
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  navItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
});


