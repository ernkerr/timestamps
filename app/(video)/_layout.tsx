import { Stack } from 'expo-router';

export default function VideoLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
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
