import AsyncStorage from '@react-native-async-storage/async-storage';

export type Note = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
};

const NOTES_KEY = 'NOTES_KEY';

export const getNotes = async (): Promise<Note[]> => {
  const json = await AsyncStorage.getItem(NOTES_KEY);
  return json ? JSON.parse(json) : [];
};

export const saveNotes = async (notes: Note[]): Promise<void> => {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};

export const addNote = async (note: Note): Promise<void> => {
  const notes = await getNotes();
  notes.unshift(note);
  await saveNotes(notes);
};

export const updateNote = async (updatedNote: Note): Promise<void> => {
  const notes = await getNotes();
  const idx = notes.findIndex(n => n.id === updatedNote.id);
  if (idx !== -1) {
    notes[idx] = updatedNote;
    await saveNotes(notes);
  }
};

export const deleteNote = async (id: string): Promise<void> => {
  const notes = await getNotes();
  const filtered = notes.filter(n => n.id !== id);
  await saveNotes(filtered);
}; 