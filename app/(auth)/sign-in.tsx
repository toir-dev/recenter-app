import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/state';
import { useAppTheme } from '@/src/theme/provider';

const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? 'https://example.com/terms';
const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL ?? 'https://example.com/privacy';

type AuthMode = 'login' | 'signup';

export default function SignInScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { scheme, setScheme, tokens } = useAppTheme();
  const isDark = scheme === 'dark';
  const accentColor = tokens.primary;
  const signInWithGoogle = useAuth((state) => state.signInWithGoogle);
  const signInWithPassword = useAuth((state) => state.signInWithPassword);
  const signUpWithEmail = useAuth((state) => state.signUpWithEmail);
  const status = useAuth((state) => state.status);
  const pending = useAuth((state) => state.pending);
  const error = useAuth((state) => state.error);
  const setError = useAuth((state) => state.setError);
  const needsOnboarding = useAuth((state) => state.needsOnboarding);
  const consents = useAuth((state) => state.consents);
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupAccepted, setSignupAccepted] = useState(consents.termsAccepted);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const languages = useMemo(
    () => [
      { code: 'en', label: t('languages.en.label', 'English') },
      { code: 'ar', label: t('languages.ar.label', 'Arabic') },
      { code: 'fr', label: t('languages.fr.label', 'French') },
    ],
    [t]
  );

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/(tabs)');
    }
  }, [router, status]);

  useEffect(() => {
    if (needsOnboarding) {
      router.replace('/onboarding');
    }
  }, [needsOnboarding, router]);

  useEffect(() => {
    setSignupAccepted(consents.termsAccepted);
  }, [consents.termsAccepted]);

  const handleOpenUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t('auth.onboarding.linkError'));
      }
    } catch (linkError) {
      console.warn('[sign-in] Failed to open url', linkError);
      Alert.alert(t('auth.onboarding.linkError'));
    }
  };

  const handleGoogle = async () => {
    setFeedback(null);
    setError(null);
    const result = await signInWithGoogle();
    if (!result.error) {
      router.replace('/(tabs)');
    }
  };

  const handlePasswordSignIn = async () => {
    const trimmedEmail = loginEmail.trim().toLowerCase();
    if (!trimmedEmail || !loginPassword) {
      setError(t('auth.signIn.emailPasswordRequired'));
      return;
    }

    setFeedback(null);
    setError(null);
    await signInWithPassword(trimmedEmail, loginPassword);
  };

  const handleSignUp = async () => {
    const trimmedName = signupFirstName.trim();
    const trimmedEmail = signupEmail.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !signupPassword || !signupConfirmPassword) {
      setError(t('auth.signIn.signupMissingFields'));
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError(t('auth.signIn.passwordMismatch'));
      return;
    }

    if (!signupAccepted) {
      setError(t('auth.signIn.consentRequired'));
      return;
    }

    setFeedback(null);
    setError(null);

    const result = await signUpWithEmail({
      firstName: trimmedName,
      email: trimmedEmail,
      password: signupPassword,
      termsAccepted: signupAccepted,
    });

    if (!result.error) {
      setFeedback(t('auth.signIn.signupSuccess'));
      setMode('login');
      setLoginEmail(trimmedEmail);
      setLoginPassword('');
      setSignupFirstName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setSignupAccepted(true);
    }
  };

  const switchToSignup = () => {
    setMode('signup');
    setFeedback(null);
    setError(null);
  };

  const switchToLogin = () => {
    setMode('login');
    setFeedback(null);
    setError(null);
  };

  const toggleSignupAcceptance = () => {
    setSignupAccepted((current) => !current);
    setError(null);
  };

  const toggleTheme = () => {
    const next = scheme === 'dark' ? 'light' : 'dark';
    setScheme(next);
    setSettingsVisible(false);
  };

  const handleLanguageChange = (code: string) => {
    if (i18n.language === code) {
      setSettingsVisible(false);
      return;
    }
    void i18n.changeLanguage(code).finally(() => {
      setSettingsVisible(false);
    });
  };

  const isPending = (action: 'google' | 'password' | 'signup') => pending === action;
  const isRedirecting = pending === 'google';
  const isAuthenticated = status === 'authenticated';
  const showPendingStatus = pending === 'password' || pending === 'signup' || pending === 'email';

  const placeholderColor = isDark ? 'rgba(148,163,184,0.65)' : 'rgba(100,116,139,0.65)';
  const containerBackground = tokens.background;
  const headingColor = tokens.text;
  const subtitleColor = tokens.muted;
  const inputBackground = isDark ? 'rgba(15,23,42,0.72)' : '#f8fafc';
  const inputBorder = isDark ? 'rgba(148,163,184,0.28)' : 'rgba(15,23,42,0.12)';
  const googleBackground = isDark ? 'rgba(15,23,42,0.6)' : '#e8edf5';
  const googleBorder = isDark ? 'rgba(148,163,184,0.25)' : 'rgba(15,23,42,0.08)';
  const settingsOverlay = isDark ? 'rgba(2,6,23,0.8)' : 'rgba(15,23,42,0.3)';
  const settingsBackground = isDark ? 'rgba(15,23,42,0.95)' : '#ffffff';
  const cardBorder = tokens.borderStrong;
  const accentSurface = isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)';
  const subtleText = tokens.muted;
  const googleIconColor = isDark ? '#f8fafc' : '#1f2937';

  const inputStyle = {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: inputBorder,
    backgroundColor: inputBackground,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: tokens.text,
  } as const;

  const actionButtonStyle = {
    borderRadius: 18,
    paddingVertical: 16,
  } as const;

  const googleButtonStyle = {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: googleBorder,
    backgroundColor: googleBackground,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;

  const headingTitle = t('auth.signIn.compactTitle', 'Welcome back');
  const headingSubtitle = t('auth.signIn.compactSubtitle', 'Sign in to continue');
  const currentLanguage = i18n.language;
  const themeToggleLabel =
    scheme === 'dark' ? t('auth.signIn.themeToggleLight') : t('auth.signIn.themeToggleDark');

  if (isRedirecting || isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            paddingHorizontal: 24,
          }}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={{ fontSize: 16, color: isDark ? '#d4d4d8' : '#4b5563' }}>
            {t('auth.signIn.redirecting')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderLoginForm = () => (
    <View style={styles.stackLarge}>
      <View style={styles.stackMedium}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          placeholder={t('auth.signIn.emailPlaceholder', 'Email')}
          placeholderTextColor={placeholderColor}
          value={loginEmail}
          onChangeText={(value) => {
            if (error) {
              setError(null);
            }
            setFeedback(null);
            setLoginEmail(value);
          }}
          style={inputStyle}
        />
        <TextInput
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={t('auth.signIn.passwordPlaceholder', 'Password')}
          placeholderTextColor={placeholderColor}
          value={loginPassword}
          onChangeText={(value) => {
            if (error) {
              setError(null);
            }
            setFeedback(null);
            setLoginPassword(value);
          }}
          style={inputStyle}
        />
      </View>

      <Button
        label={t('auth.signIn.continueCta', 'Sign In')}
        onPress={handlePasswordSignIn}
        disabled={isPending('password')}
        style={[actionButtonStyle, styles.fullWidth]}
        labelStyle={{ color: tokens.onPrimary }}
      />

      <Pressable
        accessibilityRole="button"
        disabled={isPending('google')}
        onPress={handleGoogle}
        style={[googleButtonStyle, styles.fullWidth, isPending('google') && { opacity: 0.6 }]}>
        {isPending('google') ? (
          <ActivityIndicator size="small" color={tokens.text} />
        ) : (
          <View style={styles.inlineRow}>
            <Ionicons name="logo-google" size={20} color={googleIconColor} />
            <Text style={[styles.buttonAltLabel, { color: tokens.text }]}>
              {t('auth.signIn.googleCta')}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );

  const renderSignupForm = () => (
    <View style={styles.stackLarge}>
      <View style={styles.stackMedium}>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          placeholder={t('auth.signIn.firstNamePlaceholder', 'First name')}
          placeholderTextColor={placeholderColor}
          value={signupFirstName}
          onChangeText={(value) => {
            if (error) {
              setError(null);
            }
            setFeedback(null);
            setSignupFirstName(value);
          }}
          style={inputStyle}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          placeholder={t('auth.signIn.emailPlaceholder', 'Email')}
          placeholderTextColor={placeholderColor}
          value={signupEmail}
          onChangeText={(value) => {
            if (error) {
              setError(null);
            }
            setFeedback(null);
            setSignupEmail(value);
          }}
          style={inputStyle}
        />
        <TextInput
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={t('auth.signIn.passwordPlaceholder', 'Password')}
          placeholderTextColor={placeholderColor}
          value={signupPassword}
          onChangeText={(value) => {
            if (error) {
              setError(null);
            }
            setFeedback(null);
            setSignupPassword(value);
          }}
          style={inputStyle}
        />
        <TextInput
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={t('auth.signIn.confirmPasswordLabel', 'Confirm password')}
          placeholderTextColor={placeholderColor}
          value={signupConfirmPassword}
          onChangeText={(value) => {
            if (error) {
              setError(null);
            }
            setFeedback(null);
            setSignupConfirmPassword(value);
          }}
          style={inputStyle}
        />
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: signupAccepted }}
        onPress={toggleSignupAcceptance}
        style={[
          styles.consentRow,
          {
            borderWidth: 1,
            borderColor: signupAccepted ? accentColor : inputBorder,
            backgroundColor: signupAccepted ? accentSurface : inputBackground,
            paddingHorizontal: 18,
            paddingVertical: 18,
          },
        ]}>
        <View
          style={[
            styles.consentBullet,
            {
              borderColor: signupAccepted ? accentColor : inputBorder,
              borderWidth: 2,
              height: 22,
              width: 22,
            },
          ]}>
          {signupAccepted ? (
            <View
              style={{
                borderRadius: 999,
                backgroundColor: accentColor,
                height: 10,
                width: 10,
              }}
            />
          ) : null}
        </View>
        <View style={styles.stackSmallGrow}>
          <Text style={[styles.consentTitle, { color: headingColor }]}>
            {t('auth.signIn.primaryConsent.title')}
          </Text>
          <Text style={[styles.consentBody, { color: subtleText }]}>
            {t('auth.signIn.primaryConsent.description')}
          </Text>
          <View style={styles.inlineWrap}>
            <Text
              style={[styles.linkText, { color: accentColor }]}
              onPress={() => handleOpenUrl(TERMS_URL)}>
              {t('auth.onboarding.termsLink')}
            </Text>
            <Text style={[styles.consentBody, { color: subtleText }]}>
              {t('auth.onboarding.agreementConnector')}
            </Text>
            <Text
              style={[styles.linkText, { color: accentColor }]}
              onPress={() => handleOpenUrl(PRIVACY_URL)}>
              {t('auth.onboarding.privacyLink')}
            </Text>
          </View>
          <Text style={[styles.consentHint, { color: subtleText }]}>
            {t('auth.signIn.primaryConsent.hint')}
          </Text>
        </View>
      </Pressable>

      <Button
        label={t('auth.signIn.finishCta')}
        onPress={handleSignUp}
        disabled={isPending('signup')}
        style={[actionButtonStyle, styles.fullWidth]}
        labelStyle={{ color: tokens.onPrimary }}
      />
    </View>
  );

  return (
    <>
      <Modal
        visible={settingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}>
        <Pressable
          style={[styles.modalScrim, { backgroundColor: settingsOverlay }]}
          onPress={() => setSettingsVisible(false)}>
          <Pressable
            style={[
              styles.modalCard,
              {
                padding: 24,
                backgroundColor: settingsBackground,
                borderWidth: 1,
                borderColor: cardBorder,
              },
            ]}
            onPress={(event) => event.stopPropagation()}>
            <View style={styles.stackSmall}>
              <Text style={[styles.modalTitle, { color: headingColor }]}>
                {t('auth.signIn.quickSettings')}
              </Text>
              <Text style={[styles.modalSubtitle, { color: subtleText }]}>
                {t('auth.signIn.quickSettingsHint')}
              </Text>
            </View>

            <Pressable
              style={[styles.modalAction, { backgroundColor: accentSurface }]}
              onPress={toggleTheme}>
              <Ionicons
                name={scheme === 'dark' ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={accentColor}
              />
              <Text style={[styles.modalActionLabel, { color: headingColor }]}>
                {themeToggleLabel}
              </Text>
            </Pressable>

            <View style={styles.stackMedium}>
              <Text style={[styles.consentTitle, { color: headingColor }]}>
                {t('auth.signIn.languageTitle')}
              </Text>
              <View style={styles.stackSmall}>
                {languages.map((language) => {
                  const selected = currentLanguage === language.code;
                  return (
                    <Pressable
                      key={language.code}
                      style={[
                        styles.languageOption,
                        {
                          borderWidth: 1,
                          borderColor: selected ? accentColor : cardBorder,
                          backgroundColor: selected ? accentSurface : settingsBackground,
                        },
                      ]}
                      onPress={() => handleLanguageChange(language.code)}>
                      <Text
                        style={[
                          styles.languageLabel,
                          {
                            color: selected ? accentColor : subtleText,
                            fontWeight: selected ? '600' : '500',
                          },
                        ]}>
                        {language.label}
                      </Text>
                      {selected ? (
                        <Ionicons name="checkmark-circle" size={18} color={accentColor} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <SafeAreaView style={{ flex: 1, backgroundColor: containerBackground }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 32 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                accessibilityLabel={t('auth.signIn.openSettings')}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => setSettingsVisible(true)}>
                <Ionicons name="settings-outline" size={22} color={headingColor} />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, justifyContent: 'center' }}>
              <View style={[styles.headingGroup, { marginBottom: 40 }]}>
                <Text style={[styles.headingTitle, { color: headingColor }]}>{headingTitle}</Text>
                <Text style={[styles.headingSubtitle, { color: subtitleColor }]}>
                  {headingSubtitle}
                </Text>
              </View>
              <View style={styles.stackXL}>
                {mode === 'login' ? renderLoginForm() : renderSignupForm()}
              </View>
            </View>

            <View style={[styles.footerStack, { marginTop: 40 }]}>
              {showPendingStatus ? (
                <View style={styles.inlineRow}>
                  <ActivityIndicator size="small" color={accentColor} />
                  <Text style={[styles.statusText, { color: subtleText }]}>
                    {t('auth.signIn.pending')}
                  </Text>
                </View>
              ) : null}

              {feedback ? (
                <Text
                  style={[
                    styles.feedbackText,
                    { color: isDark ? '#4ade80' : '#16a34a' },
                  ]}>
                  {feedback}
                </Text>
              ) : null}

              {error ? (
                <Text
                  style={[
                    styles.errorText,
                    { color: isDark ? '#f87171' : '#dc2626' },
                  ]}>
                  {error}
                </Text>
              ) : null}

              <Text style={[styles.statusText, { color: subtleText }]}>
                {mode === 'login'
                  ? t('auth.signIn.noAccountPrompt', "Don't have an account?")
                  : t('auth.signIn.haveAccountPrompt', 'Already have an account?')}{' '}
                <Text style={[styles.linkText, { color: accentColor }]} onPress={mode === 'login' ? switchToSignup : switchToLogin}>
                  {mode === 'login'
                    ? t('auth.signIn.signUpLink', 'Sign up')
                    : t('auth.signIn.signInLink', 'Sign in')}
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  stackLarge: {
    gap: 24,
  },
  stackMedium: {
    gap: 16,
  },
  stackSmall: {
    gap: 8,
  },
  stackSmallGrow: {
    flex: 1,
    gap: 8,
  },
  stackXL: {
    gap: 32,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  inlineWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 4,
    rowGap: 4,
  },
  buttonAltLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 20,
    gap: 16,
  },
  consentBullet: {
    marginTop: 4,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  consentBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  consentHint: {
    fontSize: 12,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalScrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    gap: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  modalActionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  languageLabel: {
    fontSize: 16,
  },
  headingGroup: {
    alignItems: 'center',
    gap: 8,
  },
  headingTitle: {
    fontSize: 36,
    fontWeight: '600',
    textAlign: 'center',
  },
  headingSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  footerStack: {
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
  },
  feedbackText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
});
