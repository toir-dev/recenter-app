import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { resolveThemeName, themePalettes, type ThemeName } from '@/src/theme';

type BreathCircleProps = {
  size?: number;
  duration?: number;
  theme?: ThemeName;
};

export function BreathCircle({ size = 160, duration = 6000, theme }: BreathCircleProps) {
  const scheme = useColorScheme();
  const resolved = resolveThemeName(theme ?? scheme);
  const palette = themePalettes[resolved];
  const { t } = useTranslation();

  const scale = useSharedValue(0.85);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.85, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [duration, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const outerSize = size;
  const innerSize = size * 0.6;

  return (
    <Animated.View
      style={[
        styles.outer,
        animatedStyle,
        {
          width: outerSize,
          height: outerSize,
          borderRadius: outerSize / 2,
          backgroundColor: palette.mint,
          shadowColor: palette.mint,
        },
      ]}>
      <View
        style={[
          styles.inner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: palette.primary,
          },
        ]}>
        <Text style={[styles.prompt, { color: '#ffffff' }]}>{t('breathCircle.prompt')}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  prompt: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
});
