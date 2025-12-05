import { create } from 'zustand';
import type { SourceVideo, ExportState, ExportSettings, SavedProject, DraftProject } from '../types/video';
import type { OverlayConfig, OverlayType } from '../types/overlay';
import * as draftStorage from '../services/draftStorage';
import { generateThumbnail } from '../services/thumbnailGenerator';

const createDefaultOverlay = (type: OverlayType, index: number = 0): OverlayConfig => {
  const baseConfig = {
    id: `${type}-${Date.now()}-${index}`,
    type,
    position: { x: 0.5, y: 0.5 }, // Center of video
    fontSize: 12,
    fontFamily: 'System',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  };

  switch (type) {
    case 'elapsed':
      return {
        ...baseConfig,
        elapsedTimer: {
          startTime: 0,
          timelapseSpeed: 120,
        },
      };
    case 'timestamp':
      return {
        ...baseConfig,
        timestamp: {
          realWorldStartTime: new Date(),
          timelapseSpeed: 120,
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
  setSourceVideo: (video: SourceVideo | null) => void;

  // Overlay configuration
  overlays: OverlayConfig[];
  selectedOverlayId: string | null;
  addOverlay: (type: OverlayType) => void;
  removeOverlay: (id: string) => void;
  toggleOverlayType: (type: OverlayType) => void;
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

  // Source video actions
  setSourceVideo: (video) => set({ sourceVideo: video }),

  // Overlay configuration actions
  addOverlay: (type) =>
    set((state) => {
      const newOverlay = createDefaultOverlay(type, state.overlays.length);
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

  toggleOverlayType: (type) =>
    set((state) => {
      if (type === 'none') {
        return { overlays: [], selectedOverlayId: null };
      }

      const existingOverlay = state.overlays.find((o) => o.type === type);
      if (existingOverlay) {
        // Remove if exists
        const newOverlays = state.overlays.filter((o) => o.type !== type);
        return {
          overlays: newOverlays,
          selectedOverlayId: state.selectedOverlayId === existingOverlay.id ? null : state.selectedOverlayId,
        };
      } else {
        // Add if doesn't exist
        const newOverlay = createDefaultOverlay(type, state.overlays.length);
        return {
          overlays: [...state.overlays, newOverlay],
          selectedOverlayId: newOverlay.id,
        };
      }
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
    }),
}));
