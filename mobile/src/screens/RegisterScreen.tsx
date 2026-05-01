import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { authApi, setToken, setStoredUser } from '../api/client';
import { colors } from '../theme/colors';

const CITY_OPTIONS = ['Delhi', 'Noida', 'Both'];

export default function RegisterScreen({ navigation }: any) {
  const auth = useAuth();
  const { updateUser } = auth;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cityPreference, setCityPreference] = useState('Both');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register(name.trim(), email.trim(), password, cityPreference);
      if (res.success) {
        const { token, refreshToken, user: userData } = res as any;
        await setToken(token, refreshToken);
        await setStoredUser(userData);
        await updateUser(userData);
        navigation.goBack();
      } else {
        setError('Registration failed. Email may already be in use.');
      }
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.logo}>✨</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the pulse of Delhi &amp; Noida events</Text>
        </View>

        {/* Error */}
        {error.length > 0 && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.onSurfaceVariant}
            autoComplete="name"
          />
        </View>

        {/* Email */}
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.onSurfaceVariant}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        {/* Password */}
        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 6 characters"
              placeholderTextColor={colors.onSurfaceVariant}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
            />
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Text style={styles.toggleBtnText}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* City Preference */}
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
                  {city === 'Delhi' ? '🏙️' : city === 'Noida' ? '🌆' : '🗺️'} {city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitBtnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Login link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 48 },
  backBtn: {
    marginTop: 56,
    marginBottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backIcon: { color: colors.white, fontSize: 18, fontWeight: '700' },
  hero: { alignItems: 'center', paddingVertical: 28 },
  logo: { fontSize: 52, marginBottom: 12 },
  title: { color: colors.white, fontSize: 28, fontWeight: '900', marginBottom: 8 },
  subtitle: { color: colors.onSurfaceVariant, fontSize: 14, textAlign: 'center' },
  errorBox: {
    backgroundColor: colors.error + '22',
    borderWidth: 1,
    borderColor: colors.error + '55',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: colors.error, fontSize: 13, fontWeight: '600' },
  field: { marginBottom: 16 },
  label: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.onSurface,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  toggleBtn: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  toggleBtnText: { fontSize: 18 },
  cityRow: { flexDirection: 'row', gap: 10 },
  cityChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cityChipActive: { backgroundColor: colors.primary + '33', borderColor: colors.primary },
  cityChipText: { color: colors.onSurfaceVariant, fontSize: 13, fontWeight: '600' },
  cityChipTextActive: { color: colors.primary, fontWeight: '800' },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingTop: 16 },
  footerText: { color: colors.onSurfaceVariant, fontSize: 14 },
  footerLink: { color: colors.primary, fontSize: 14, fontWeight: '800' },
});
