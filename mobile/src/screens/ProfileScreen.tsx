import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/client';
import { colors } from '../theme/colors';

type ProfileTab = 'Account' | 'Security' | 'Notifications' | 'Payments';

const TABS: ProfileTab[] = ['Account', 'Security', 'Notifications', 'Payments'];
const CITY_OPTIONS = ['Delhi', 'Noida', 'Both'];

export default function ProfileScreen({ navigation }: any) {
  const auth = useAuth();
  const { user, isAuthenticated, logout, toggle2FA, updateUser } = auth;

  const [activeTab, setActiveTab] = useState<ProfileTab>('Account');

  // Account tab state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [cityPreference, setCityPreference] = useState(user?.cityPreference || 'Both');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Security tab state
  const [toggling2FA, setToggling2FA] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  // Notification toggles — UI state only; backend persistence not yet implemented
  const [notifAlerts, setNotifAlerts] = useState(true);
  const [notifOrganizer, setNotifOrganizer] = useState(true);
  const [notifVibe, setNotifVibe] = useState(false);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.surface} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👤 Profile</Text>
        </View>
        <View style={styles.unauthState}>
          <Text style={styles.unauthIcon}>👤</Text>
          <Text style={styles.unauthTitle}>Sign In Required</Text>
          <Text style={styles.unauthSubtitle}>
            Login to manage your profile, bookmarks, and preferences
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerLinkText}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleSaveAccount = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await authApi.updateProfile({ name, phone, bio, cityPreference });
      if (res.success && res.data) {
        await updateUser(res.data);
        setSaveMsg('✅ Profile updated');
      } else {
        setSaveMsg('❌ Update failed');
      }
    } catch {
      setSaveMsg('❌ Network error');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleToggle2FA = async () => {
    setToggling2FA(true);
    await toggle2FA(!user?.twoFactorEnabled);
    setToggling2FA(false);
  };

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdMsg('❌ Please fill all fields');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg('❌ New passwords do not match');
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg('❌ Password must be at least 6 characters');
      return;
    }
    setChangingPwd(true);
    setPwdMsg('');
    try {
      const res = await authApi.changePassword(currentPwd, newPwd);
      if (res.success) {
        setPwdMsg('✅ Password changed');
        setCurrentPwd('');
        setNewPwd('');
        setConfirmPwd('');
      } else {
        setPwdMsg('❌ ' + (res.error || 'Failed to change password'));
      }
    } catch {
      setPwdMsg('❌ Network error');
    } finally {
      setChangingPwd(false);
      setTimeout(() => setPwdMsg(''), 4000);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.navigate('MainTabs');
  };

  const avatarInitial = user?.name ? user.name[0].toUpperCase() : '?';
  const roleBadge = user?.role === 'admin' ? '👑 Admin' : user?.role === 'moderator' ? '🛡️ Mod' : '';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {roleBadge ? (
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{roleBadge}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Tab Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBarScroll}
          contentContainerStyle={styles.tabBar}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Account Tab */}
        {activeTab === 'Account' && (
          <View style={styles.tabContent}>
            <View style={styles.avatarUploadNote}>
              <Text style={styles.avatarUploadNoteText}>
                📷 Avatar upload available on web
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputReadOnly]}
                value={user?.email}
                editable={false}
                placeholderTextColor={colors.onSurfaceVariant}
              />
              <Text style={styles.fieldNote}>Email cannot be changed</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.onSurfaceVariant}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>City Preference</Text>
              <View style={styles.cityRow}>
                {CITY_OPTIONS.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[styles.cityChip, cityPreference === city && styles.cityChipActive]}
                    onPress={() => setCityPreference(city)}
                  >
                    <Text style={[styles.cityChipText, cityPreference === city && styles.cityChipTextActive]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor={colors.onSurfaceVariant}
                multiline
                numberOfLines={3}
              />
            </View>

            {saveMsg ? <Text style={styles.statusMsg}>{saveMsg}</Text> : null}

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSaveAccount}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Security Tab */}
        {activeTab === 'Security' && (
          <View style={styles.tabContent}>
            {/* 2FA */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Two-Factor Authentication</Text>
                  <Text style={styles.sectionSubtitle}>
                    {user?.twoFactorEnabled ? '🔒 Enabled — extra security active' : '🔓 Disabled — enable for extra security'}
                  </Text>
                </View>
                {toggling2FA ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Switch
                    value={!!user?.twoFactorEnabled}
                    onValueChange={handleToggle2FA}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                )}
              </View>
            </View>

            {/* Change Password */}
            <Text style={styles.sectionLabel}>Change Password</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={currentPwd}
                onChangeText={setCurrentPwd}
                placeholder="Current password"
                placeholderTextColor={colors.onSurfaceVariant}
                secureTextEntry
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                value={newPwd}
                onChangeText={setNewPwd}
                placeholder="New password (min 6 chars)"
                placeholderTextColor={colors.onSurfaceVariant}
                secureTextEntry
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPwd}
                onChangeText={setConfirmPwd}
                placeholder="Confirm new password"
                placeholderTextColor={colors.onSurfaceVariant}
                secureTextEntry
              />
            </View>

            {pwdMsg ? <Text style={styles.statusMsg}>{pwdMsg}</Text> : null}

            <TouchableOpacity
              style={[styles.saveBtn, changingPwd && styles.saveBtnDisabled]}
              onPress={handleChangePassword}
              disabled={changingPwd}
            >
              {changingPwd ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications Tab */}
        {activeTab === 'Notifications' && (
          <View style={styles.tabContent}>
            {[
              { label: 'New Event Alerts', subtitle: 'Get notified about new events near you', value: notifAlerts, onToggle: setNotifAlerts },
              { label: 'Organizer Messages', subtitle: 'Updates from event organizers', value: notifOrganizer, onToggle: setNotifOrganizer },
              { label: 'VIBE Updates', subtitle: 'App news and feature announcements', value: notifVibe, onToggle: setNotifVibe },
            ].map((item) => (
              <View key={item.label} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderText}>
                    <Text style={styles.sectionTitle}>{item.label}</Text>
                    <Text style={styles.sectionSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Payments Tab */}
        {activeTab === 'Payments' && (
          <View style={styles.tabContent}>
            <View style={styles.emptyPayments}>
              <Text style={styles.emptyPaymentsIcon}>💳</Text>
              <Text style={styles.emptyPaymentsTitle}>No Payment Methods</Text>
              <Text style={styles.emptyPaymentsSubtitle}>
                Add a payment method to register for paid events
              </Text>
              <TouchableOpacity style={styles.addPaymentBtn}>
                <Text style={styles.addPaymentBtnText}>+ Add Payment Method</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>🚪 Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingBottom: 60 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { color: colors.white, fontSize: 26, fontWeight: '900' },
  unauthState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  unauthIcon: { fontSize: 64, marginBottom: 16 },
  unauthTitle: { color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  unauthSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
    marginBottom: 12,
  },
  loginBtnText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  registerLink: { paddingVertical: 8 },
  registerLinkText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 24, fontWeight: '900' },
  userInfo: { flex: 1 },
  userName: { color: colors.white, fontSize: 20, fontWeight: '800' },
  userEmail: { color: colors.onSurfaceVariant, fontSize: 13, marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: colors.warning + '33',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleBadgeText: { color: colors.warning, fontSize: 11, fontWeight: '800' },
  tabBarScroll: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabBar: { paddingHorizontal: 16, gap: 4 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { color: colors.onSurfaceVariant, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: colors.primary, fontWeight: '800' },
  tabContent: { paddingHorizontal: 20, paddingTop: 20 },
  avatarUploadNote: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarUploadNoteText: { color: colors.onSurfaceVariant, fontSize: 13 },
  field: { marginBottom: 16 },
  label: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.onSurface,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputReadOnly: { opacity: 0.6 },
  fieldNote: { color: colors.onSurfaceVariant, fontSize: 11, marginTop: 4 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  cityRow: { flexDirection: 'row', gap: 8 },
  cityChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cityChipActive: { backgroundColor: colors.primary + '33', borderColor: colors.primary },
  cityChipText: { color: colors.onSurfaceVariant, fontSize: 13, fontWeight: '600' },
  cityChipTextActive: { color: colors.primary, fontWeight: '800' },
  statusMsg: { color: colors.onSurface, fontSize: 13, marginBottom: 12, fontWeight: '600' },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  sectionCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionHeaderText: { flex: 1 },
  sectionTitle: { color: colors.white, fontSize: 14, fontWeight: '700' },
  sectionSubtitle: { color: colors.onSurfaceVariant, fontSize: 12, marginTop: 2 },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 14,
  },
  emptyPayments: { alignItems: 'center', paddingVertical: 60 },
  emptyPaymentsIcon: { fontSize: 56, marginBottom: 16 },
  emptyPaymentsTitle: { color: colors.white, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  emptyPaymentsSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  addPaymentBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
  },
  addPaymentBtnText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  logoutSection: { paddingHorizontal: 20, paddingTop: 20 },
  logoutBtn: {
    backgroundColor: colors.error + '22',
    borderWidth: 1,
    borderColor: colors.error + '55',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  logoutBtnText: { color: colors.error, fontSize: 15, fontWeight: '800' },
});
