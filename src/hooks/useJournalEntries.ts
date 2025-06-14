
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { JournalEntry, CreateJournalEntry, UpdateJournalEntry } from '../types/journal';

// Supabase table name
const TABLE = 'journal_entries';

export const useJournalEntries = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      return;
    }

    const fetchEntries = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('date', { ascending: false });
      if (!error && data) {
        const mapped = data.map((d) => ({
          id: d.id,
          title: d.title,
          content: d.content ?? '',
          date: d.date,
          createdAt: d.created_at,
          updatedAt: d.updated_at ?? d.created_at,
          userId: d.user_id,
        }));
        setEntries(mapped);
      }
      setIsLoading(false);
    };

    fetchEntries();
  }, [user]);

  const saveEntries = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
  };

  const createEntry = async (entryData: CreateJournalEntry): Promise<string> => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        title: entryData.title,
        content: entryData.content,
        date: new Date(entryData.date).toISOString(),
        user_id: user?.id,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Supabase insert error', error);

      setIsLoading(false);
      throw error ?? new Error('Failed to insert');
    }

    const newEntry: JournalEntry = {
      id: data.id,
      title: data.title,
      content: data.content ?? '',
      date: data.date,
      createdAt: data.created_at,
      updatedAt: data.updated_at ?? data.created_at,
      userId: data.user_id,
    };

    const newEntries = [newEntry, ...entries];
    saveEntries(newEntries);
    setIsLoading(false);
    
    return newEntry.id;
  };

  const updateEntry = async (entryData: UpdateJournalEntry): Promise<void> => {
    setIsLoading(true);
    
    const { error } = await supabase
      .from(TABLE)
      .update({
        title: entryData.title,
        content: entryData.content,
        date: new Date(entryData.date).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryData.id);

    if (error) {
      setIsLoading(false);
      throw error;
    }

    const updatedEntries = entries.map((entry) =>
      entry.id === entryData.id
        ? { ...entry, ...entryData, updatedAt: new Date().toISOString() }
        : entry
    );
    
    saveEntries(updatedEntries);
    setIsLoading(false);
  };

  const deleteEntry = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      setIsLoading(false);
      throw error;
    }

    const filteredEntries = entries.filter((entry) => entry.id !== id);
    saveEntries(filteredEntries);
    setIsLoading(false);
  };

  const getEntry = (id: string): JournalEntry | undefined => {
    return entries.find((entry) => entry.id === id);
  };

  return {
    entries,
    isLoading,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntry
  };
};
