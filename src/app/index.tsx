// src/app/index.tsx  – Notes list + bulk‑select + export
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import AddNoteModal from './component/addnotemodel';
import NoteCard from './component/notecard';


/*  types      */

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

const NotesApp = () => {
  /* state  */
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFiltered] = useState<Note[]>([]);
  const [modalVisible, setModal] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [isSearchVisible, setSearchUI] = useState(false);
  const [searchQuery, setQuery] = useState('');
  const [isSelectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelected] = useState<Set<string>>(new Set());

  /* ---- lifecycle ---- */
  useEffect(() => {
    loadNotes();
  }, []);

  /* storage helpers - */
  const loadNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem('notes');
      if (!stored) return;
      const parsed: Note[] = JSON.parse(stored);
      const sorted = parsed.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setNotes(sorted);
      setFiltered(sorted);
    } catch (err) {
      Alert.alert('Load failed', (err as Error).message);
    }
  };

  const saveNotes = async (updated: Note[]) => {
    try {
      setNotes(updated);
      setFiltered(updated);
      await AsyncStorage.setItem('notes', JSON.stringify(updated));
    } catch (err) {
      Alert.alert('Save failed', (err as Error).message);
    }
  };

  /*  CRUD helper */
  const addOrUpdateNote = useCallback(
    (title: string, content: string) => {
      const date = new Date().toDateString();

      const updated: Note[] = editNote
        ? notes.map(n =>
          n.id === editNote.id ? { ...n, title, content, date } : n
        )
        : [
          { id: Date.now().toString(), title, content, date },
          ...notes,
        ];

      saveNotes(updated);
      setEditNote(null);
      setModal(false);
    },
    [editNote, notes]
  );

  /*  search helpers  */
  const handleSearch = useCallback(() => {
    const q = searchQuery.toLowerCase();
    setFiltered(notes.filter(
      n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    ));
  }, [searchQuery, notes]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFiltered(notes);
  }, [notes]);

  /* bulk‑select helpers */
  const toggleSelectMode = useCallback(() => {
    if (isSelectMode) setSelected(new Set());       // leaving mode → clear
    setSelectMode(p => !p);
  }, [isSelectMode]);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(
    () => setSelected(new Set(notes.map(n => n.id))),
    [notes]
  );

  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;

    Alert.alert('Delete selected?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = notes.filter(n => !selectedIds.has(n.id));
          saveNotes(updated);
          setSelected(new Set());
          setSelectMode(false);
        },
      },
    ]);
  }, [notes, selectedIds]);

  /* - export helpers  */
  const exportSelected = useCallback(async () => {
    if (selectedIds.size === 0) {
      Alert.alert('No notes selected', 'Select at least one note to export.');
      return;
    }
    try {
      const data = notes.filter(n => selectedIds.has(n.id));
      const json = JSON.stringify(data, null, 2);
      const uri = FileSystem.cacheDirectory + `notes-${Date.now()}.json`;

      await FileSystem.writeAsStringAsync(uri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/json',
        dialogTitle: 'Share selected notes',
      });
    } catch (err) {
      Alert.alert('Export failed', (err as Error).message);
    }
  }, [notes, selectedIds]);

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Notes</Text>




        <View style={styles.iconContainer}>


          <TouchableOpacity onPress={toggleSelectMode}>
            <Icon
              name={isSelectMode ? 'x-square' : 'check-square'}
              size={24}
              color="#fff"
              style={{ marginRight: 15 }}
            />
          </TouchableOpacity>

          {isSelectMode ? (
            <>
              <Icon
                name="square"
                size={24}
                color="#fff"
                style={{ marginHorizontal: 12 }}
                onPress={() =>
                  selectedIds.size === notes.length
                    ? setSelected(new Set())
                    : selectAll()
                }
              />
              <Icon
                name="trash-2"
                size={24}
                color="#fff"
                style={{ marginHorizontal: 12 }}
                onPress={deleteSelected}
              />
              <Icon
                name="download"
                size={24}
                color="#fff"
                style={{ marginHorizontal: 12 }}
                onPress={exportSelected}
              />
            </>
          ) : (
            <>
              <Icon
                name="search"
                size={24}
                color="#fff"
                onPress={() => setSearchUI(p => !p)}
              />
              <Icon
                name="more-vertical"
                size={24}
                color="#fff"
                style={{ marginLeft: 20 }}
              />
            </>
          )}
        </View>
      </View>

      {/*  Search -- */}
      {isSearchVisible && (
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setQuery}
            style={styles.searchInput}
            placeholderTextColor="#888"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Text style={{ color: '#fff' }}>Go</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearSearch} style={styles.searchButton}>
            <Text style={{ color: '#fff' }}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/*  List */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
        {filteredNotes.map(note => (
          <NoteCard
            key={note.id}
            title={note.title}
            subtitle={note.content}
            date={note.date}
            selected={selectedIds.has(note.id)}
            isSelectMode={isSelectMode}
            onPress={() =>
              isSelectMode
                ? toggleSelect(note.id)      // toggle pick
                : (setEditNote(note), setModal(true))
            }
            onDelete={() => {
              const updated = notes.filter(n => n.id !== note.id);
              saveNotes(updated);
            }}
          />

        ))}
      </ScrollView>

      {/* Floating add button  */}
      {!isSelectMode && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            setEditNote(null);
            setModal(true);
          }}
        >
          <Icon name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Add / Edit modal */}
      <AddNoteModal
        visible={modalVisible}
        onSave={addOrUpdateNote}
        onClose={() => {
          setEditNote(null);
          setModal(false);
        }}
        initialTitle={editNote?.title}
        initialContent={editNote?.content}
      />

      {/* Bottom tab bar (dummy) - */}
      <View style={styles.bottomTab}>
        <View style={styles.tabItem}>
          <Icon name="home" size={22} color="green" />
          <Text style={{ color: 'green', fontSize: 12 }}>Home</Text>
        </View>
        <View style={styles.tabItem}>
          <Icon name="folder" size={22} color="gray" />
          <Text style={{ color: 'gray', fontSize: 12 }}>Folders</Text>
        </View>
      </View>
    </View>
  );
};

export default NotesApp;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingBottom: 60,
  },
  header: {
    paddingTop: 140,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  headerText: {
    fontSize: 38,
    color: '#fff',
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignItems: 'center',
    gap: 6,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#222',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButton: {
    backgroundColor: '#30C957',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#30C957',
    borderRadius: 30,
    padding: 16,
    elevation: 5,
    zIndex: 10,
  },
  bottomTab: {
    position: 'absolute',
    bottom: 0,
    height: 60,
    width: '100%',
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#444',
  },
  tabItem: {
    alignItems: 'center',
  },
});
