
import { useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { ExtendedMetadata, Reference } from '@/types/metadata';

export interface Draft {
  markdown: string;
  metadata: ExtendedMetadata;
  references?: Reference[];
  updatedAt: string;
  dirty?: boolean;
}

const STORAGE_KEY = 'draft_article';

export const saveDraft = (draft: Omit<Draft, 'updatedAt'>) => {
  const draftWithTimestamp: Draft = {
    ...draft,
    updatedAt: new Date().toISOString(),
    dirty: true
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draftWithTimestamp));
  console.log('Draft saved at', new Date().toLocaleTimeString());
};

export const loadDraft = (): Draft | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const draft = JSON.parse(stored);
    
    // Ensure backward compatibility
    if (!draft.metadata.author) {
      draft.metadata.author = '';
    }
    
    return draft;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

export const clearDraft = () => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('Draft cleared');
};

export const markDraftSynced = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  
  try {
    const draft = JSON.parse(stored);
    draft.dirty = false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    console.log('Draft marked as synced');
  } catch (error) {
    console.error('Error marking draft as synced:', error);
  }
};

export const useAutosave = (
  markdown: string,
  metadata: ExtendedMetadata,
  references?: Reference[]
) => {
  // Debounced save function
  const debouncedSave = useCallback(
    debounce((content: string, meta: ExtendedMetadata, refs?: Reference[]) => {
      saveDraft({ markdown: content, metadata: meta, references: refs });
    }, 2000),
    []
  );

  useEffect(() => {
    if (markdown || metadata.title || metadata.author || metadata.abstract) {
      debouncedSave(markdown, metadata, references);
    }
  }, [markdown, metadata, references, debouncedSave]);

  return { saveDraft, loadDraft, clearDraft, markDraftSynced };
};
