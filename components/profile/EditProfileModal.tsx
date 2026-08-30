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

export const AVATAR_OPTIONS = [
  {
    id: 'alms_enoch',
    label: 'Enoch Scout',
    uri: 'https://api.dicebear.com/7.x/notionists/png?seed=Enoch&backgroundColor=e0f2fe',
    Icon: Compass,
    color: '#0284C7',
    bg: '#E0F2FE',
  },
  {
    id: 'alms_sophia',
    label: 'Sophia Vision',
    uri: 'https://api.dicebear.com/7.x/notionists/png?seed=Sophia&backgroundColor=fef3c7',
    Icon: Star,
    color: '#D97706',
    bg: '#FEF3C7',
  },
  {
    id: 'alms_oliver',
    label: 'Oliver Safety',
    uri: 'https://api.dicebear.com/7.x/notionists/png?seed=Oliver&backgroundColor=d1fae5',
    Icon: ShieldCheck,
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    id: 'alms_emma',
    label: 'Emma Leader',
    uri: 'https://api.dicebear.com/7.x/notionists/png?seed=Emma&backgroundColor=fce7f3',
    Icon: Crown,
    color: '#DB2777',
    bg: '#FCE7F3',
  },
  {
    id: 'alms_lucas',
    label: 'Lucas Sentinel',
    uri: 'https://api.dicebear.com/7.x/notionists/png?seed=Lucas&backgroundColor=eef2ff',
    Icon: Car,
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    id: 'alms_ava',
    label: 'Ava Cyclist',
    uri: 'https://api.dicebear.com/7.x/notionists/png?seed=Ava&backgroundColor=fee2e2',
    Icon: Bike,
    color: '#DC2626',
    bg: '#FEE2E2',
  },
  { id: 'compass', label: 'Pioneer Scout', Icon: Compass, color: '#0284C7', bg: '#E0F2FE' },
  { id: 'shield', label: 'Safety Shield', Icon: ShieldCheck, color: '#059669', bg: '#ECFDF5' },
  { id: 'zap', label: 'Lightning Scout', Icon: Zap, color: '#F59E0B', bg: '#FEF3C7' },
];

interface EditProfileModalProps {
  visible: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onSave: (updates: { displayName: string; bio: string; avatarKey: string }) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  user,
  onClose,
  onSave,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('alms_enoch');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setSelectedAvatar(user.avatarKey || 'alms_enoch');
    }
  }, [user, visible]);

  const handleSave = async () => {
    if (!displayName.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarKey: selectedAvatar,
      });
      onClose();
    } catch (err) {
      console.warn('[Edit Profile error]:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissOverlay} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalCard}>
          {/* Header handle */}
          <View style={styles.handle} />

          {/* Title row */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Customize Profile</Text>
              <Text style={styles.headerSub}>Update your display name, motto & citizen avatar emblem</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* 1. Select Avatar Emblem */}
            <Text style={styles.sectionHeader}>Choose Citizen Avatar Emblem</Text>
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((opt) => {
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

            {/* 2. Display Name Input */}
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

            {/* 3. Bio / Motto Input */}
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
    maxHeight: '86%',
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
    color: '#1C1C1E',
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 11.5,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
  },
  scrollContent: {
    maxHeight: 440,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
    color: '#475569',
    letterSpacing: 0.6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 48,
  },
  inputLeadingIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
