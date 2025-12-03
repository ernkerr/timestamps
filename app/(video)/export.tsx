import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useVideoStore } from '@/lib/store/videoStore';
import { useEffect } from 'react';

export default function ExportScreen() {
  const router = useRouter();
  const { sourceVideo, exportState, exportSettings } = useVideoStore();

  if (!sourceVideo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No video selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Export Video</Text>

        {/* Export Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Export Settings</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Codec:</Text>
            <Text style={styles.settingValue}>{exportSettings.codec.toUpperCase()}</Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Quality:</Text>
            <Text style={styles.settingValue}>
              {exportSettings.quality.charAt(0).toUpperCase() + exportSettings.quality.slice(1)}
            </Text>
          </View>
        </View>

        {/* Export Progress */}
        {exportState.isExporting && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.progressText}>
              Exporting... {exportState.progress.toFixed(0)}%
            </Text>
          </View>
        )}

        {/* Export Success */}
        {exportState.outputUri && !exportState.isExporting && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✓ Export Complete!</Text>
            <Text style={styles.successSubtext}>
              Video saved to your photo library
            </Text>
          </View>
        )}

        {/* Export Error */}
        {exportState.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Export Failed</Text>
            <Text style={styles.errorMessage}>{exportState.error}</Text>
          </View>
        )}

        {/* TODO: Export button will be implemented in Phase 5 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.back()}
            disabled={exportState.isExporting}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              exportState.isExporting && styles.disabledButton,
            ]}
            disabled={exportState.isExporting}
          >
            <Text style={styles.primaryButtonText}>
              {exportState.isExporting ? 'Exporting...' : 'Start Export'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.placeholder}>
          Export functionality will be implemented in Phase 5
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingsContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#666',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#333',
    marginTop: 16,
  },
  successContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    marginBottom: 20,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 16,
    color: '#2e7d32',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#c62828',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 'auto',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
