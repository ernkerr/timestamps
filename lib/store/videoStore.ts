import { create } from 'zustand';
import type { SourceVideo, ExportState, ExportSettings, SavedProject } from '../types/video';
import type { OverlayConfig } from '../types/overlay';

const DEFAULT_OVERLAY_CONFIG: OverlayConfig = {
  type: 'elapsed',
  position: { x: 0.05, y: 0.05 }, // Top-left, 5% from edges
  fontSize: 32,
  fontFamily: 'System',
  color: '#FFFFFF',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  elapsedTimer: {
    startTime: 0, // Start from beginning of video
  },
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
  overlayConfig: OverlayConfig;
  setOverlayType: (type: OverlayConfig['type']) => void;
  updateOverlayConfig: (updates: Partial<OverlayConfig>) => void;
  resetOverlayConfig: () => void;

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

  // Global reset
  reset: () => void;
}

export const useVideoStore = create<VideoStore>((set) => ({
  // Initial state
  sourceVideo: null,
  overlayConfig: DEFAULT_OVERLAY_CONFIG,
  exportState: INITIAL_EXPORT_STATE,
  exportSettings: {
    codec: 'h264',
    quality: 'high',
  },
  savedProjects: [],

  // Source video actions
  setSourceVideo: (video) => set({ sourceVideo: video }),

  // Overlay configuration actions
  setOverlayType: (type) =>
    set((state) => ({
      overlayConfig: { ...state.overlayConfig, type },
    })),

  updateOverlayConfig: (updates) =>
    set((state) => ({
      overlayConfig: { ...state.overlayConfig, ...updates },
    })),

  resetOverlayConfig: () => set({ overlayConfig: DEFAULT_OVERLAY_CONFIG }),

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
      overlayConfig: DEFAULT_OVERLAY_CONFIG,
      exportState: INITIAL_EXPORT_STATE,
      exportSettings: {
        codec: 'h264',
        quality: 'high',
      },
    }),
}));
