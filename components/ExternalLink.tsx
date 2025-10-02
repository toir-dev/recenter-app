import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform } from 'react-native';

type ExpoLinkProps = React.ComponentProps<typeof Link>;

type ExternalLinkProps = Omit<ExpoLinkProps, 'href'> & {
  href: string;
};

export function ExternalLink({ href, onPress, ...rest }: ExternalLinkProps) {
  return (
    <Link
      target="_blank"
      href={href as ExpoLinkProps['href']}
      {...rest}
      onPress={(event) => {
        if (Platform.OS !== 'web') {
          event.preventDefault();
          WebBrowser.openBrowserAsync(href);
        }

        onPress?.(event);
      }}
    />
  );
}
