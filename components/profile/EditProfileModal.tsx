import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { UserProfile } from '@/types/user';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import {
  X,
  Compass,
  ShieldCheck,
  Zap,
  Crown,
  Car,
  Bike,
  Star,
  Camera,
  Flame,
  User,
  Check,
} from 'lucide-react-native';

export interface AvatarOption {
  id: string;
  gender: 'male' | 'female' | 'all';
  label: string;
  uri?: string;
  Icon: any;
  color: string;
  bg: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  // Male Alms Avatars
  {
    id: 'alms_enoch',
    gender: 'male',
    label: 'Enoch Scout',
    uri: 'https://api.dicebear.com/7.x/notionists/png?seed=Enoch&backgroundColor=e0f2fe',
    Icon: Compass,
    color: '#0284C7',
    bg: '#E0F2FE',
  },
  {
    id: 'alms_lucas',
    gender: 'male',
    label: 'Lucas Sentinel',
    uri: 'https://api.dicebear.com/7.x/notionists/png?seed=Lucas&backgroundColor=eef2ff',
    Icon: Car,
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    id: 'alms_oliver',
    gender: 'male',
    label: 'Oliver Safety',
    uri: 'https://api.dicebear.com/7.x/notionists/png?seed=Oliver&backgroundColor=d1fae5',
    Icon: ShieldCheck,
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    id: 'alms_sam',
    gender: 'male',
    label: 'Sam Hunter',
    uri: 'https://api.dicebear.com/7.x/notionists/png?seed=Felix&backgroundColor=fef3c7',
    Icon: Flame,
    color: '#D97706',
    bg: '#FEF3C7',
  },
  {
    id: 'alms_leo',
    gender: 'male',
    label: 'Leo Cyclist',
    uri: 'https://api.dicebear.com/7.x/open-peeps/png?seed=Leo&backgroundColor=fee2e2',
    Icon: Bike,
    color: '#DC2626',
    bg: '#FEE2E2',
  },

  // Female Alms Avatars
  {
    id: 'alms_sophia',
    gender: 'female',
    label: 'Sophia Vision',
    uri: 'https://api.dicebear.com/7.x/notionists/png?seed=Sophia&backgroundColor=fce7f3',
    Icon: Star,
    color: '#DB2777',
    bg: '#FCE7F3',
  },
  {
    id: 'alms_emma',
    gender: 'female',
    label: 'Emma Leader',
    uri: 'https://api.dicebear.com/7.x/notionists/png?seed=Emma&backgroundColor=f3e8ff',
    Icon: Crown,
    color: '#7C3AED',
    bg: '#F3E8FF',
  },
  {
    id: 'alms_ava',
    gender: 'female',
    label: 'Ava Cyclist',
    uri: 'https://api.dicebear.com/7.x/notionists/png?seed=Ava&backgroundColor=fee2e2',
    Icon: Bike,
    color: '#DC2626',
    bg: '#FEE2E2',
  },
  {
    id: 'alms_mia',
    gender: 'female',
    label: 'Mia Scout',
    uri: 'https://api.dicebear.com/7.x/open-peeps/png?seed=Mia&backgroundColor=e0f2fe',
    Icon: Compass,
    color: '#0284C7',
    bg: '#E0F2FE',
  },
  {
    id: 'alms_chloe',
    gender: 'female',
    label: 'Chloe Guardian',
    uri: 'https://api.dicebear.com/7.x/open-peeps/png?seed=Chloe&backgroundColor=d1fae5',
    Icon: ShieldCheck,
    color: '#059669',
    bg: '#ECFDF5',
  },

  // Generic Vector Emblems
  { id: 'compass', gender: 'all', label: 'Pioneer Scout', Icon: Compass, color: '#0284C7', bg: '#E0F2FE' },
  { id: 'shield', gender: 'all', label: 'Safety Shield', Icon: ShieldCheck, color: '#059669', bg: '#ECFDF5' },
  { id: 'zap', gender: 'all', label: 'Lightning Scout', Icon: Zap, color: '#F59E0B', bg: '#FEF3C7' },
];

interface EditProfileModalProps {
  visible: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onSave: (updates: { displayName: string; bio: string; avatarKey: string; gender?: 'male' | 'female' }) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  user,
  onClose,
  onSave,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedAvatar, setSelectedAvatar] = useState('alms_enoch');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      const userGender = user.gender || 'male';
      setGender(userGender);
      setSelectedAvatar(user.avatarKey || (userGender === 'male' ? 'alms_enoch' : 'alms_sophia'));
    }
  }, [user, visible]);

  const handleGenderChange = (g: 'male' | 'female') => {
    setGender(g);
    const available = AVATAR_OPTIONS.filter((a) => a.gender === g);
    if (available.length > 0) {
      setSelectedAvatar(available[0].id);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarKey: selectedAvatar,
        gender: gender,
      });
      onClose();
    } catch (e) {
      console.error('Error saving profile:', e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!visible) return null;

  const filteredAvatars = AVATAR_OPTIONS.filter((opt) => opt.gender === gender || opt.gender === 'all');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissOverlay} onPress={onClose} activeOpacity={1} />
        <View style={styles.modalCard}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Customize Profile</Text>
              <Text style={styles.headerSub}>Select gender & pick your Alms avatar portrait</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Gender Selection Segmented Control */}
            <Text style={styles.sectionHeader}>SELECT GENDER</Text>
            <View style={styles.genderToggleContainer}>
              <TouchableOpacity
                style={[styles.genderSegment, gender === 'male' && styles.genderSegmentActive]}
                onPress={() => handleGenderChange('male')}
                activeOpacity={0.85}
              >
                <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>
                  👨 Male Avatars
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderSegment, gender === 'female' && styles.genderSegmentActive]}
                onPress={() => handleGenderChange('female')}
                activeOpacity={0.85}
              >
                <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>
                  👩 Female Avatars
                </Text>
              </TouchableOpacity>
            </View>

            {/* Select Avatar Grid */}
            <Text style={styles.sectionHeader}>CHOOSE YOUR ALMS PORTRAIT</Text>
            <View style={styles.avatarGrid}>
              {filteredAvatars.map((opt) => {
                const IconComp = opt.Icon;
                const isSelected = selectedAvatar === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.avatarOptionCard,
                      isSelected && { borderColor: opt.color, backgroundColor: opt.bg },
                    ]}
                    onPress={() => setSelectedAvatar(opt.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: isSelected ? opt.color : '#F1F5F9' }]}>
                      {opt.uri ? (
                        <Image source={{ uri: opt.uri }} style={styles.avatarGridImg} />
                      ) : (
                        <IconComp size={22} color={isSelected ? '#FFFFFF' : '#64748B'} strokeWidth={2.2} />
                      )}
                    </View>
                    <Text style={[styles.avatarLabel, isSelected && { color: opt.color, fontWeight: '800' }]}>
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkBadge, { backgroundColor: opt.color }]}>
                        <Check size={10} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Display Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>DISPLAY NAME</Text>
              <View style={styles.inputWrapper}>
                <User size={16} color="#64748B" style={styles.inputLeadingIcon} />
                <TextInput
                  style={styles.textInput}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Citizen Name"
                  placeholderTextColor="#94A3B8"
                  maxLength={30}
                />
              </View>
            </View>

            {/* Bio / Motto Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CIVIC MOTTO / BIO</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="e.g. Active road safety scout in Bengaluru"
                  placeholderTextColor="#94A3B8"
                  maxLength={70}
                />
              </View>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <TouchableOpacity
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save Profile Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.lg,
    maxHeight: '88%',
    gap: 12,
    ...SHADOWS.large,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 0,
  },
  sectionHeader: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 8,
  },
  genderToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  genderSegment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  genderSegmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  genderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  genderTextActive: {
    color: '#007AFF',
    fontWeight: '800',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  avatarOptionCard: {
    width: '30%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
    position: 'relative',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarGridImg: {
    width: '100%',
    height: '100%',
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    gap: 6,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  inputLeadingIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
