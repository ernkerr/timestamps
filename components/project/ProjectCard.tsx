import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { DraftProject } from '@/lib/types/video';

interface ProjectCardProps {
  project: DraftProject;
  onPress: () => void;
  onDelete: () => void;
  onRename: () => void;
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

// Helper function to format duration
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ProjectCard({ project, onPress, onDelete, onRename }: ProjectCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          {project.thumbnailUri ? (
            <Image
              source={{ uri: project.thumbnailUri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <ThemedText style={styles.placeholderText}>No Preview</ThemedText>
            </View>
          )}
        </View>

        {/* Project Info */}
        <View style={styles.info}>
          <ThemedText style={styles.projectName} numberOfLines={1}>
            {project.name}
          </ThemedText>
          <ThemedText style={styles.metadata}>
            {formatRelativeTime(project.lastEditedAt)} · {formatDuration(project.videoDuration)}
          </ThemedText>
          <ThemedText style={styles.overlayCount}>
            {project.overlays.length} overlay{project.overlays.length !== 1 ? 's' : ''}
          </ThemedText>
        </View>

        {/* Menu Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.menuIcon}>⋮</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Menu Dropdown */}
      {showMenu && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={(e) => {
              e.stopPropagation();
              setShowMenu(false);
              onRename();
            }}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.menuItemText}>Rename</ThemedText>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={(e) => {
              e.stopPropagation();
              setShowMenu(false);
              onDelete();
            }}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.menuItemText, styles.deleteText]}>Delete</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 0,
    backgroundColor: '#fff',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  thumbnailContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 80,
    height: 60,
    backgroundColor: '#F5F5F5',
    borderRadius: 0,
  },
  thumbnailPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 10,
    fontWeight: '300',
    color: '#999',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  metadata: {
    fontSize: 12,
    fontWeight: '300',
    color: '#666',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  overlayCount: {
    fontSize: 11,
    fontWeight: '300',
    color: '#999',
    letterSpacing: 0.3,
  },
  menuButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: '400',
    color: '#666',
  },
  menu: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    letterSpacing: 0.3,
  },
  deleteText: {
    color: '#DC2626',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
});
