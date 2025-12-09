import { create } from 'zustand';
import { getVideoMetadata } from '../../modules/video-export';
import * as draftStorage from '../services/draftStorage';
import { generateThumbnail } from '../services/thumbnailGenerator';
import type { OverlayConfig, OverlayType } from '../types/overlay';
import type { DraftProject, ExportSettings, ExportState, SavedProject, SourceVideo } from '../types/video';

const createDefaultOverlay = (type: OverlayType, index: number = 0, sourceVideo?: SourceVideo | null): OverlayConfig => {
  const baseConfig = {
    id: `${type}-${Date.now()}-${index}`,
    type,
    position: { x: 0.5, y: 0.5 }, // Center of video
    fontSize: 12,
    fontFamily: 'System',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  };

  // Calculate timelapse speed if available
  let timelapseSpeed = 1;
  if (sourceVideo?.realTimeDuration && sourceVideo.duration > 0) {
    timelapseSpeed = sourceVideo.realTimeDuration / sourceVideo.duration;
  }

  // Use creation date if available
  const realWorldStartTime = sourceVideo?.creationDate || new Date();

  switch (type) {
    case 'elapsed':
      return {
        ...baseConfig,
        elapsedTimer: {
          startTime: 0,
          timelapseSpeed,
        },
      };
    case 'timestamp':
      return {
        ...baseConfig,
        timestamp: {
          realWorldStartTime,
          timelapseSpeed,
          format: '12h',
        },
      };
    case 'text':
      return {
        ...baseConfig,
        text: 'Custom Text',
        textOverlay: {
          text: 'Custom Text',
        },
      };
    case 'none':
    default:
      return baseConfig;
  }
};

const INITIAL_EXPORT_STATE: ExportState = {
  isExporting: false,
  progress: 0,
  outputUri: null,
  error: null,
};

interface VideoStore {
  // Source video state
  sourceVideo: SourceVideo | null;
  setSourceVideo: (video: SourceVideo | null) => Promise<void>;

  // Overlay configuration
  overlays: OverlayConfig[];
  selectedOverlayId: string | null;
  addOverlay: (type: OverlayType) => void;
  removeOverlay: (id: string) => void;
  updateOverlay: (id: string, updates: Partial<OverlayConfig>) => void;
  selectOverlay: (id: string | null) => void;
  hasOverlayType: (type: OverlayType) => boolean;
  resetOverlays: () => void;

  // Export state
  exportState: ExportState;
  exportSettings: ExportSettings;
  setExportSettings: (settings: Partial<ExportSettings>) => void;
  startExport: () => void;
  updateExportProgress: (progress: number) => void;
  completeExport: (outputUri: string) => void;
  failExport: (error: string) => void;
  resetExport: () => void;

  // Project management
  savedProjects: SavedProject[];
  saveProject: (project: SavedProject) => void;
  deleteProject: (id: string) => void;
  clearProjects: () => void;

  // Draft project management
  draftProjects: DraftProject[];
  currentDraftId: string | null;
  lastAutoSave: Date | null;
  loadDrafts: () => Promise<void>;
  saveDraftProject: (name?: string) => Promise<void>;
  deleteDraftProject: (id: string) => Promise<void>;
  renameDraftProject: (id: string, newName: string) => Promise<void>;
  loadDraftIntoEditor: (draft: DraftProject) => void;
  setCurrentDraftId: (id: string | null) => void;
  clearCurrentDraft: () => void;

  // Global reset
  reset: () => void;
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  // Initial state
  sourceVideo: null,
  overlays: [],
  selectedOverlayId: null,
  exportState: INITIAL_EXPORT_STATE,
  exportSettings: {
    codec: 'h264',
    quality: 'high',
  },
  savedProjects: [],
  draftProjects: [],
  currentDraftId: null,
  lastAutoSave: null,

  // Source video actions
  setSourceVideo: async (video) => {
    if (!video) {
      set({ sourceVideo: null });
      return;
    }

    try {
      // Fetch metadata using native module
      console.log('Calling getVideoMetadata with URI:', video.uri);
      const metadata = await getVideoMetadata(video.uri);
      console.log('Video Metadata:', metadata);
      
      const enrichedVideo: SourceVideo = {
        ...video,
        realTimeDuration: metadata.realTimeDuration,
        creationDate: metadata.creationDate ? new Date(metadata.creationDate) : undefined,
        isTimelapse: metadata.isTimelapse,
      };

      console.log('Enriched Video:', enrichedVideo);

      set({ sourceVideo: enrichedVideo });
    } catch (error) {
      console.warn('Failed to fetch video metadata:', error);
      // Fallback to basic video info
      set({ sourceVideo: video });
    }
  },

  // Overlay configuration actions
  addOverlay: (type) =>
    set((state) => {
      const newOverlay = createDefaultOverlay(type, state.overlays.length, state.sourceVideo);
      return {
        overlays: [...state.overlays, newOverlay],
        selectedOverlayId: newOverlay.id,
      };
    }),

  removeOverlay: (id) =>
    set((state) => {
      const newOverlays = state.overlays.filter((o) => o.id !== id);
      return {
        overlays: newOverlays,
        selectedOverlayId: state.selectedOverlayId === id ? null : state.selectedOverlayId,
      };
    }),



  updateOverlay: (id, updates) =>
    set((state) => ({
      overlays: state.overlays.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      ),
    })),

  selectOverlay: (id) => set({ selectedOverlayId: id }),

  hasOverlayType: (type) => {
    const state = get();
    return state.overlays.some((o) => o.type === type);
  },

  resetOverlays: () => set({ overlays: [], selectedOverlayId: null }),

  // Export settings actions
  setExportSettings: (settings) =>
    set((state) => ({
      exportSettings: { ...state.exportSettings, ...settings },
    })),

  // Export state actions
  startExport: () =>
    set({
      exportState: {
        isExporting: true,
        progress: 0,
        outputUri: null,
        error: null,
      },
    }),

  updateExportProgress: (progress) =>
    set((state) => ({
      exportState: { ...state.exportState, progress },
    })),

  completeExport: (outputUri) =>
    set({
      exportState: {
        isExporting: false,
        progress: 100,
        outputUri,
        error: null,
      },
    }),

  failExport: (error) =>
    set({
      exportState: {
        isExporting: false,
        progress: 0,
        outputUri: null,
        error,
      },
    }),

  resetExport: () => set({ exportState: INITIAL_EXPORT_STATE }),

  // Project management actions
  saveProject: (project) =>
    set((state) => ({
      savedProjects: [...state.savedProjects, project],
    })),

  deleteProject: (id) =>
    set((state) => ({
      savedProjects: state.savedProjects.filter((p) => p.id !== id),
    })),

  clearProjects: () => set({ savedProjects: [] }),

  // Draft project management actions
  loadDrafts: async () => {
    const drafts = await draftStorage.loadDrafts();
    set({ draftProjects: drafts });
  },

  saveDraftProject: async (name?: string) => {
    const state = get();
    const { sourceVideo, overlays, currentDraftId } = state;

    if (!sourceVideo) {
      console.warn('Cannot save draft: no source video');
      return;
    }

    const now = new Date();
    const draftId = currentDraftId || `draft-${Date.now()}`;

    // Generate default name if not provided
    const draftName = name || `Project - ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

    // Generate thumbnail only if this is a new draft (no currentDraftId)
    let thumbnailUri: string | undefined;
    if (!currentDraftId) {
      try {
        thumbnailUri = await generateThumbnail(sourceVideo.uri);
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
      }
    } else {
      // Keep existing thumbnail
      const existingDraft = state.draftProjects.find((d) => d.id === currentDraftId);
      thumbnailUri = existingDraft?.thumbnailUri;
    }

    const draft: DraftProject = {
      id: draftId,
      name: draftName,
      sourceVideoUri: sourceVideo.uri,
      overlays: overlays,
      thumbnailUri,
      lastEditedAt: now,
      createdAt: currentDraftId
        ? state.draftProjects.find((d) => d.id === currentDraftId)?.createdAt || now
        : now,
      videoDuration: sourceVideo.duration,
      videoDimensions: sourceVideo.dimensions,
    };

    await draftStorage.saveDraft(draft);

    // Update local state
    const updatedDrafts = currentDraftId
      ? state.draftProjects.map((d) => (d.id === currentDraftId ? draft : d))
      : [draft, ...state.draftProjects];

    set({
      draftProjects: updatedDrafts,
      currentDraftId: draftId,
      lastAutoSave: now,
    });
  },

  deleteDraftProject: async (id: string) => {
    await draftStorage.deleteDraft(id);
    const state = get();
    set({
      draftProjects: state.draftProjects.filter((d) => d.id !== id),
      currentDraftId: state.currentDraftId === id ? null : state.currentDraftId,
    });
  },

  renameDraftProject: async (id: string, newName: string) => {
    await draftStorage.updateDraftName(id, newName);
    const state = get();
    const updatedDrafts = state.draftProjects.map((d) =>
      d.id === id ? { ...d, name: newName, lastEditedAt: new Date() } : d
    );
    set({ draftProjects: updatedDrafts });
  },

  loadDraftIntoEditor: (draft: DraftProject) => {
    // Parse date strings back to Date objects in overlays
    const parsedOverlays = draft.overlays.map((overlay) => {
      if (overlay.timestamp?.realWorldStartTime) {
        return {
          ...overlay,
          timestamp: {
            ...overlay.timestamp,
            realWorldStartTime: new Date(overlay.timestamp.realWorldStartTime),
          },
        };
      }
      return overlay;
    });

    set({
      sourceVideo: {
        uri: draft.sourceVideoUri,
        duration: draft.videoDuration,
        dimensions: draft.videoDimensions,
      },
      overlays: parsedOverlays,
      currentDraftId: draft.id,
      selectedOverlayId: parsedOverlays[0]?.id || null,
    });
  },

  setCurrentDraftId: (id: string | null) => set({ currentDraftId: id }),

  clearCurrentDraft: () => set({ currentDraftId: null, lastAutoSave: null }),

  // Global reset
  reset: () =>
    set({
      sourceVideo: null,
      overlays: [],
      selectedOverlayId: null,
      exportState: INITIAL_EXPORT_STATE,
      exportSettings: {
        codec: 'h264',
        quality: 'high',
      },
      currentDraftId: null,
      lastAutoSave: null,
    }),
}));
