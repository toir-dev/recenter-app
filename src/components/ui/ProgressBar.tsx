import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { resolveThemeName, themePalettes, type ThemeName } from '@/src/theme';

type ProgressBarProps = {
  progress: number; // 0 - 1
  label?: string;
  theme?: ThemeName;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

export function ProgressBar({ progress, label, theme, style, className }: ProgressBarProps) {
  const scheme = useColorScheme();
  const resolved = resolveThemeName(theme ?? scheme);
  const palette = themePalettes[resolved];
  const safeProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      className={className}
      style={[styles.container, { borderColor: palette.outline, backgroundColor: palette.surfaceAlt }, style]}>
      {label ? <Text style={[styles.label, { color: palette.muted }]}>{label}</Text> : null}
      <View style={[styles.track, { backgroundColor: palette.outline }]}
        accessibilityRole="progressbar"
        accessibilityValue={{ now: Math.round(safeProgress * 100) }}>
        <View
          style={[
            styles.indicator,
            {
              backgroundColor: palette.primary,
              width: `${safeProgress * 100}%`,
            },
          ]}
        />
      </View>
      <Text style={[styles.value, { color: palette.text }]}>{Math.round(safeProgress * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  track: {
    width: '100%',
    height: 14,
    borderRadius: 999,
    overflow: 'hidden',
  },
  indicator: {
    height: '100%',
    borderRadius: 999,
  },
  value: {
    fontSize: 12,
    fontWeight: '500',
    alignSelf: 'flex-end',
  },
});
