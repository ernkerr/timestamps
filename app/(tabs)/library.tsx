import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useVideoStore } from '@/lib/store/videoStore';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function LibraryScreen() {
  const { savedProjects } = useVideoStore();

  if (savedProjects.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📹</Text>
          <ThemedText style={styles.emptyTitle}>No Exported Videos</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Your exported videos will appear here
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Library</ThemedText>
        <ThemedText style={styles.subtitle}>
          {savedProjects.length} {savedProjects.length === 1 ? 'video' : 'videos'}
        </ThemedText>
      </View>

      <FlatList
        data={savedProjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.projectCard}>
            <ThemedText style={styles.projectName}>{item.name}</ThemedText>
            <ThemedText style={styles.projectMeta}>
              Duration: {Math.round(item.duration)}s
            </ThemedText>
            <ThemedText style={styles.projectMeta}>
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </ThemedText>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.placeholderNote}>
        <ThemedText style={styles.placeholderText}>
          Library UI will be expanded in Phase 6
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  projectCard: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectMeta: {
    fontSize: 14,
    opacity: 0.6,
  },
  placeholderNote: {
    padding: 16,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    opacity: 0.4,
    fontStyle: 'italic',
  },
});
