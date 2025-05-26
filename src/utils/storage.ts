
import { useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';

export interface Draft {
  markdown: string;
  metadata: {
    title: string;
    author: string;
    abstract: string;
  };
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
    
    return JSON.parse(stored);
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
  metadata: Draft['metadata']
) => {
  // Debounced save function
  const debouncedSave = useCallback(
    debounce((content: string, meta: Draft['metadata']) => {
      saveDraft({ markdown: content, metadata: meta });
    }, 2000),
    []
  );

  useEffect(() => {
    if (markdown || metadata.title || metadata.author || metadata.abstract) {
      debouncedSave(markdown, metadata);
    }
  }, [markdown, metadata, debouncedSave]);

  return { saveDraft, loadDraft, clearDraft, markDraftSynced };
};
