import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function VideoLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? 'light'].text;

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.dismiss()} style={{ marginLeft: 0 }}>
            <Ionicons name="close" size={28} color={iconColor} />
          </TouchableOpacity>
        ),
        headerTitle: '',
        headerBackVisible: false,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
      }}
    >
      <Stack.Screen
        name="configure"
        options={{
          title: 'Configure Overlay',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="preview"
        options={{
          title: 'Preview',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="export"
        options={{
          title: 'Export Video',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
