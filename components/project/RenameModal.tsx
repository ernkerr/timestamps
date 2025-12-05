import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface RenameModalProps {
  visible: boolean;
  currentName: string;
  onSubmit: (newName: string) => void;
  onCancel: () => void;
}

export function RenameModal({
  visible,
  currentName,
  onSubmit,
  onCancel,
}: RenameModalProps) {
  const [name, setName] = useState(currentName);

  // Reset name when modal opens
  useEffect(() => {
    if (visible) {
      setName(currentName);
    }
  }, [visible, currentName]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== currentName) {
      onSubmit(trimmedName);
    } else {
      onCancel();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerMark} />
            <ThemedText style={styles.headerText}>RENAME PROJECT</ThemedText>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <ThemedText style={styles.label}>Project Name</ThemedText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter project name"
              autoFocus
              selectTextOnFocus
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSubmit}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.saveButtonText}>Save</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#000',
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerMark: {
    width: 4,
    height: 16,
    backgroundColor: '#000',
    marginRight: 12,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: '#000',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 1,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
    padding: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 0,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    letterSpacing: 0.5,
  },
  saveButton: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
