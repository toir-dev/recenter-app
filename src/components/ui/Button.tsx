import { Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { resolveThemeName, themePalettes, type ThemeName } from '@/src/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  theme?: ThemeName;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  className?: string;
};

export function Button({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  theme,
  style,
  labelStyle,
  className,
}: ButtonProps) {
  const scheme = useColorScheme();
  const resolved = resolveThemeName(theme ?? scheme);
  const palette = themePalettes[resolved];

  const backgroundColor = (() => {
    switch (variant) {
      case 'secondary':
        return palette.mint;
      case 'outline':
        return palette.surfaceAlt;
      default:
        return palette.primary;
    }
  })();

  const textColor = variant === 'outline' ? palette.text : '#ffffff';
  const borderColor = variant === 'outline' ? palette.primary : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      className={className}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}>
      <Text style={[styles.label, { color: textColor }, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
