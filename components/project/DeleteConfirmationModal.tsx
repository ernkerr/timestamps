import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface DeleteConfirmationModalProps {
  visible: boolean;
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({
  visible,
  projectName,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
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
            <ThemedText style={styles.headerText}>DELETE PROJECT</ThemedText>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <ThemedText style={styles.message}>
              Are you sure you want to delete "{projectName}"?
            </ThemedText>
            <ThemedText style={styles.warning}>
              This action cannot be undone.
            </ThemedText>
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
              style={[styles.button, styles.deleteButton]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
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
    backgroundColor: '#DC2626',
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
  message: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000',
    lineHeight: 22,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  warning: {
    fontSize: 13,
    fontWeight: '300',
    color: '#DC2626',
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
  deleteButton: {
    borderColor: '#DC2626',
    backgroundColor: '#DC2626',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
