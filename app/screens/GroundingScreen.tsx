// GroundingScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BreathPhase = 'Inhale' | 'Hold' | 'Exhale';
type ExerciseType = '54321' | 'reality' | 'body';

const IDLE_BREATH_COUNT = 4;

const exerciseContent: Record<ExerciseType, { title: string; subtitle: string; steps: string[] }> = {
  '54321': {
    title: '5-4-3-2-1 Reset',
    subtitle: 'Engage your senses one layer at a time.',
    steps: [
      'Name five things you can see around you.',
      'Notice four things you can feel or touch.',
      'Identify three sounds you can hear in this moment.',
      'Explore two scents you can smell, even if they are faint.',
      'Focus on one taste you can sense or imagine.',
    ],
  },
  reality: {
    title: 'Reality Check',
    subtitle: 'Remind yourself of what is true right now.',
    steps: [
      'Where are you and what are you doing right now?',
      'List three facts you know about the situation.',
      'Repeat: "Right now, I am safe enough to keep breathing."',
    ],
  },
  body: {
    title: 'Guided Body Scan',
    subtitle: 'Move attention through your body and soften tension.',
    steps: [
      'Start at the top: relax your forehead, jaw, and shoulders.',
      'Let your chest and arms loosen, noticing every sensation.',
      'Allow your belly and hips to soften as you breathe.',
      'Travel down to your legs and toes, then thank your body.',
    ],
  },
};

const footerActions: Array<{
  key: ExerciseType;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    key: '54321',
    label: '5-4-3-2-1',
    description: 'Engage every sense',
    icon: 'color-wand-outline',
  },
  {
    key: 'reality',
    label: 'Reality Check',
    description: 'Anchor in the facts',
    icon: 'compass-outline',
  },
  {
    key: 'body',
    label: 'Body Scan',
    description: 'Release muscle tension',
    icon: 'body-outline',
  },
];

const GroundingScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isBreathing, setIsBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(IDLE_BREATH_COUNT);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('Inhale');
  const [activeExercise, setActiveExercise] = useState<ExerciseType | null>(null);
  const [exerciseStepIndex, setExerciseStepIndex] = useState(0);

  const scaleAnim = useRef(new Animated.Value(0.82)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const breathingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownResolveRef = useRef<((didComplete: boolean) => void) | null>(null);
  const isBreathingRef = useRef(false);

  const triggerHaptic = useCallback(
    (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
      void Haptics.impactAsync(style).catch(() => undefined);
    },
    []
  );

  const animateBreath = useCallback(
    (toScale: number, toOpacity: number, duration: number) => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: toScale,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: toOpacity,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [opacityAnim, scaleAnim]
  );

  const cleanupInterval = useCallback(() => {
    if (breathingInterval.current) {
      clearInterval(breathingInterval.current);
      breathingInterval.current = null;
    }
  }, []);

  const countdown = useCallback(
    (seconds: number): Promise<void> =>
      new Promise((resolve) => {
        cleanupInterval();

        let count = seconds;
        setBreathCount(count);

        const finish = (didComplete: boolean) => {
          cleanupInterval();
          countdownResolveRef.current = null;

          if (!didComplete) {
            setBreathCount(IDLE_BREATH_COUNT);
          }

          resolve();
        };

        const interval = setInterval(() => {
          if (!isBreathingRef.current) {
            finish(false);
            return;
          }

          count -= 1;

          if (count > 0) {
            setBreathCount(count);
          } else {
            finish(true);
          }
        }, 1000);

        breathingInterval.current = interval;
        countdownResolveRef.current = finish;
      }),
    [cleanupInterval]
  );

  const stopBreathing = useCallback(() => {
    isBreathingRef.current = false;
    if (countdownResolveRef.current) {
      countdownResolveRef.current(false);
    } else {
      setBreathCount(IDLE_BREATH_COUNT);
    }

    scaleAnim.stopAnimation(() => {
      scaleAnim.setValue(0.82);
    });
    opacityAnim.stopAnimation(() => {
      opacityAnim.setValue(1);
    });

    setBreathPhase('Inhale');
  }, [opacityAnim, scaleAnim]);

  const startBreathingCycle = useCallback(() => {
    const runCycle = async () => {
      if (!isBreathingRef.current) {
        return;
      }

      setBreathPhase('Inhale');
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      animateBreath(1.08, 0.78, 4200);
      await countdown(4);
      if (!isBreathingRef.current) {
        return;
      }

      setBreathPhase('Hold');
      animateBreath(1.12, 0.85, 3800);
      await countdown(4);
      if (!isBreathingRef.current) {
        return;
      }

      setBreathPhase('Exhale');
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
      animateBreath(0.78, 1, 4200);
      await countdown(4);

      if (isBreathingRef.current) {
        runCycle();
      }
    };

    void runCycle();
  }, [animateBreath, countdown, triggerHaptic]);

  useEffect(() => {
    isBreathingRef.current = isBreathing;

    if (isBreathing) {
      startBreathingCycle();
    } else {
      stopBreathing();
    }

    return () => {
      isBreathingRef.current = false;
      stopBreathing();
    };
  }, [isBreathing, startBreathingCycle, stopBreathing]);

  const handleStart = useCallback(() => {
    setIsBreathing((prev) => {
      const next = !prev;
      isBreathingRef.current = next;
      triggerHaptic();

      if (!next) {
        stopBreathing();
      }

      return next;
    });
  }, [stopBreathing, triggerHaptic]);

  const handleClose = useCallback(() => {
    isBreathingRef.current = false;
    setIsBreathing(false);
    stopBreathing();
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router, stopBreathing, triggerHaptic]);

  const openExercise = useCallback(
    (exercise: ExerciseType) => {
      setActiveExercise(exercise);
      setExerciseStepIndex(0);
      triggerHaptic();
    },
    [triggerHaptic]
  );

  const closeExercise = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setActiveExercise(null);
  }, [triggerHaptic]);

  const handleAdvanceStep = useCallback(() => {
    if (!activeExercise) {
      return;
    }

    const steps = exerciseContent[activeExercise].steps;
    const isLast = exerciseStepIndex === steps.length - 1;

    if (isLast) {
      closeExercise();
      return;
    }

    triggerHaptic();
    setExerciseStepIndex((prev) => prev + 1);
  }, [activeExercise, closeExercise, exerciseStepIndex, triggerHaptic]);

  const currentExercise = activeExercise ? exerciseContent[activeExercise] : null;
  const totalSteps = currentExercise?.steps.length ?? 0;
  const progress = totalSteps > 0 ? Math.min((exerciseStepIndex + 1) / totalSteps, 1) : 0;
  const isLastStep = totalSteps > 0 ? exerciseStepIndex === totalSteps - 1 : true;
  const currentStep = currentExercise ? currentExercise.steps[exerciseStepIndex] : '';

  const contentPaddingBottom = Math.max(insets.bottom + 24, 56);
  const footerPaddingBottom = Math.max(insets.bottom, 12);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: contentPaddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
            <Ionicons name="close" size={26} color="rgba(255, 255, 255, 0.8)" />
          </TouchableOpacity>
        </View>

        <View style={styles.main}>
          <Text style={styles.title}>I need grounding</Text>
          <Text style={styles.subtitle}>Slow your breath and let the tension melt.</Text>

          <View style={styles.circleContainer}>
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              <View style={styles.circleContent}>
                <Text style={styles.breathCount}>{breathCount}</Text>
                <Text style={styles.breathPhase}>{breathPhase.toUpperCase()}</Text>
              </View>
            </Animated.View>
          </View>

          <TouchableOpacity
            style={[styles.startButton, isBreathing && styles.startButtonActive]}
            onPress={handleStart}
            activeOpacity={0.9}
          >
            <Text style={styles.startButtonText}>{isBreathing ? 'Stop Breathing' : 'Start Breathing'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.footer, { paddingBottom: footerPaddingBottom }]}>
          {footerActions.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.footerButton}
              onPress={() => openExercise(action.key)}
              activeOpacity={0.85}
            >
              <View style={styles.footerIconWrapper}>
                <Ionicons name={action.icon} size={22} color="#7df3ff" />
              </View>
              <View style={styles.footerTextWrapper}>
                <Text style={styles.footerButtonText}>{action.label}</Text>
                <Text style={styles.footerButtonSubtext}>{action.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal transparent visible={Boolean(currentExercise)} animationType="fade" onRequestClose={closeExercise}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {currentExercise && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleWrapper}>
                    <Text style={styles.modalTitle}>{currentExercise.title}</Text>
                    <Text style={styles.modalSubtitle}>{currentExercise.subtitle}</Text>
                  </View>
                  <TouchableOpacity onPress={closeExercise} style={styles.modalClose} activeOpacity={0.8}>
                    <Ionicons name="close" size={20} color="#d6f4f9" />
                  </TouchableOpacity>
                </View>

                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>

                <View style={styles.modalStep}>
                  <Text style={styles.modalStepIndex}>
                    Step {Math.min(exerciseStepIndex + 1, totalSteps)} of {totalSteps}
                  </Text>
                  <Text style={styles.modalStepText}>{currentStep}</Text>
                </View>

                <TouchableOpacity style={styles.modalPrimaryButton} onPress={handleAdvanceStep} activeOpacity={0.85}>
                  <Text style={styles.modalPrimaryButtonText}>{isLastStep ? 'Done' : 'Next Step'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c1b20',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    justifyContent: 'space-between',
    gap: 24,
  },
  header: {
    alignItems: 'flex-end',
    paddingTop: 12,
  },
  closeButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  main: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  circleContainer: {
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingCircle: {
    width: 216,
    height: 216,
    borderRadius: 108,
    backgroundColor: 'rgba(48, 182, 212, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(125, 243, 255, 0.25)',
  },
  circleContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  breathCount: {
    fontSize: 60,
    fontWeight: '700',
    color: '#ffffff',
  },
  breathPhase: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 2,
    fontWeight: '500',
  },
  startButton: {
    marginTop: 6,
    height: 52,
    paddingHorizontal: 32,
    backgroundColor: '#1ccfe3',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1ccfe3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonActive: {
    backgroundColor: '#149ab0',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#04161a',
  },
  footer: {
    paddingTop: 8,
    gap: 14,
  },
  footerButton: {
    width: '100%',
    minHeight: 76,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  footerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(125, 243, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  footerTextWrapper: {
    flex: 1,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  footerButtonSubtext: {
    marginTop: 2,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 17, 20, 0.92)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#102d33',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(125, 243, 255, 0.18)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitleWrapper: {
    flex: 1,
    paddingRight: 12,
    gap: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e9fdff',
  },
  modalSubtitle: {
    fontSize: 15,
    lineHeight: 20,
    color: 'rgba(199, 244, 251, 0.8)',
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(231, 252, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(233, 253, 255, 0.18)',
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#36e0f2',
  },
  modalStep: {
    paddingBottom: 24,
    gap: 12,
  },
  modalStepIndex: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(199, 244, 251, 0.8)',
  },
  modalStepText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#f0feff',
  },
  modalPrimaryButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1ccfe3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPrimaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#062025',
  },
});

export default GroundingScreen;
