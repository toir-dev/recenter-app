import { StyleSheet, Switch, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { resolveThemeName, themePalettes, type ThemeName } from '@/src/theme';

type ToggleRowProps = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  theme?: ThemeName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  theme,
  disabled = false,
  style,
}: ToggleRowProps) {
  const scheme = useColorScheme();
  const resolved = resolveThemeName(theme ?? scheme);
  const palette = themePalettes[resolved];

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: palette.surfaceAlt,
          borderColor: palette.outline,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
        {description ? (
          <Text style={[styles.description, { color: palette.muted }]}>{description}</Text>
        ) : null}
      </View>
      <Switch
        accessibilityRole="switch"
        disabled={disabled}
        onValueChange={onValueChange}
        value={value}
        thumbColor={value ? palette.primary : '#ffffff'}
        trackColor={{ false: palette.outline, true: palette.mint }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
  },
});
