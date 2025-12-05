import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DraftProject } from '../types/video';

const DRAFTS_STORAGE_KEY = '@timestamps/drafts';

/**
 * Load all draft projects from AsyncStorage
 */
export async function loadDrafts(): Promise<DraftProject[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(DRAFTS_STORAGE_KEY);
    if (jsonValue === null) {
      return [];
    }

    const drafts = JSON.parse(jsonValue);

    // Parse date strings back to Date objects
    return drafts.map((draft: any) => ({
      ...draft,
      lastEditedAt: new Date(draft.lastEditedAt),
      createdAt: new Date(draft.createdAt),
    }));
  } catch (error) {
    console.error('Error loading drafts:', error);
    return [];
  }
}

/**
 * Save or update a draft project
 * If draft with same ID exists, it will be updated
 */
export async function saveDraft(draft: DraftProject): Promise<void> {
  try {
    const existingDrafts = await loadDrafts();
    const index = existingDrafts.findIndex((d) => d.id === draft.id);

    let updatedDrafts: DraftProject[];
    if (index >= 0) {
      // Update existing draft
      updatedDrafts = [...existingDrafts];
      updatedDrafts[index] = draft;
    } else {
      // Add new draft
      updatedDrafts = [draft, ...existingDrafts];
    }

    const jsonValue = JSON.stringify(updatedDrafts);
    await AsyncStorage.setItem(DRAFTS_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
}

/**
 * Delete a draft project by ID
 */
export async function deleteDraft(id: string): Promise<void> {
  try {
    const existingDrafts = await loadDrafts();
    const filteredDrafts = existingDrafts.filter((d) => d.id !== id);

    const jsonValue = JSON.stringify(filteredDrafts);
    await AsyncStorage.setItem(DRAFTS_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
}

/**
 * Update the name of a draft project
 */
export async function updateDraftName(id: string, name: string): Promise<void> {
  try {
    const existingDrafts = await loadDrafts();
    const draft = existingDrafts.find((d) => d.id === id);

    if (!draft) {
      throw new Error(`Draft with ID ${id} not found`);
    }

    // Update name and lastEditedAt
    draft.name = name;
    draft.lastEditedAt = new Date();

    await saveDraft(draft);
  } catch (error) {
    console.error('Error updating draft name:', error);
    throw error;
  }
}
