import { useAppTheme } from "@/src/theme/provider";

export const useColorScheme = () => {
  const { scheme } = useAppTheme();
  return scheme;
};
