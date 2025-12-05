import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useVideoStore } from '@/lib/store/videoStore';
import { ProjectCard } from '@/components/project/ProjectCard';
import { DeleteConfirmationModal } from '@/components/project/DeleteConfirmationModal';
import { RenameModal } from '@/components/project/RenameModal';
import type { DraftProject } from '@/lib/types/video';

export default function ProjectsScreen() {
  const router = useRouter();
  const { draftProjects, loadDrafts, loadDraftIntoEditor, deleteDraftProject, renameDraftProject } = useVideoStore();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; project: DraftProject | null }>({
    visible: false,
    project: null,
  });
  const [renameModal, setRenameModal] = useState<{ visible: boolean; project: DraftProject | null }>({
    visible: false,
    project: null,
  });

  // Load drafts on mount
  useEffect(() => {
    loadDrafts();
  }, []);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDrafts();
    setRefreshing(false);
  }, [loadDrafts]);

  // Sort drafts by most recently edited
  const sortedDrafts = [...draftProjects].sort(
    (a, b) => new Date(b.lastEditedAt).getTime() - new Date(a.lastEditedAt).getTime()
  );

  // Handle project tap - load draft and navigate to configure
  const handleProjectPress = (draft: DraftProject) => {
    loadDraftIntoEditor(draft);
    router.push('/(video)/configure');
  };

  // Empty state
  if (sortedDrafts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerMark} />
          <ThemedText style={styles.headerText}>PROJECTS</ThemedText>
        </View>

        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyTitle}>No Projects Yet</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Import or record a video to start creating your first project
          </ThemedText>
        </View>
      </View>
    );
  }

  // Project list
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerMark} />
        <ThemedText style={styles.headerText}>PROJECTS</ThemedText>
      </View>

      <FlatList
        data={sortedDrafts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <ThemedText>Project: {item.name}</ThemedText>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerMark: {
    width: 4,
    height: 20,
    backgroundColor: '#000',
    marginRight: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 2,
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  emptyDescription: {
    fontSize: 14,
    fontWeight: '300',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.3,
  },
});
