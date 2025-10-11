import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { resolveThemeName, themePalettes, type ThemeName } from '@/src/theme';

type CardProps = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  theme?: ThemeName;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
};

export function Card({
  title,
  subtitle,
  children,
  footer,
  theme,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
}: CardProps) {
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
        },
        style,
      ]}>
      {title ? (
        <Text style={[styles.title, { color: palette.text }, titleStyle]}>{title}</Text>
      ) : null}
      {subtitle ? (
        <Text style={[styles.subtitle, { color: palette.muted }, subtitleStyle]}>{subtitle}</Text>
      ) : null}
      <View style={[styles.content, contentStyle]}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    gap: 12,
  },
  footer: {
    marginTop: 12,
  },
});
