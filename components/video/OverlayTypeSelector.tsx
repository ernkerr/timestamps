import { ThemedText } from '@/components/themed-text';
import type { OverlayType } from '@/lib/types/overlay';
import { Clock, Type } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface OverlayTypeSelectorProps {
  selectedType: OverlayType | null;
  onSelectType: (type: OverlayType) => void;
}

export function OverlayTypeSelector({ selectedType, onSelectType }: OverlayTypeSelectorProps) {
  const overlayTypes = [
    {
      type: 'timestamp' as OverlayType,
      label: 'Timestamp',
      icon: (active: boolean) => (
        <ThemedText style={[styles.iconText, active && styles.iconTextActive]}>
          00:00
        </ThemedText>
      ),
    },
    {
      type: 'elapsed' as OverlayType,
      label: 'Timer',
      icon: (active: boolean) => (
        <Clock size={28} color={active ? '#fff' : '#666'} />
      ),
    },
    {
      type: 'text' as OverlayType,
      label: 'Text',
      icon: (active: boolean) => (
        <Type size={28} color={active ? '#fff' : '#666'} />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      {overlayTypes.map((item) => {
        const isActive = selectedType === item.type;
        
        return (
          <TouchableOpacity
            key={item.type}
            style={[styles.typeButton, isActive && styles.typeButtonActive]}
            onPress={() => onSelectType(item.type)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              {item.icon(isActive)}
            </View>
            <ThemedText style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 0,
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  iconContainer: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    fontVariant: ['tabular-nums'],
  },
  iconTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666',
    letterSpacing: 0.3,
  },
  labelActive: {
    color: '#fff',
  },
});
