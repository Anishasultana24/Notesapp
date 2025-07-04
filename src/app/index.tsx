import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import AddNoteModal from './component/addnotemodel';
import NoteCard from './component/notecard';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

const NotesApp = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const stored = await AsyncStorage.getItem('notes');
    if (stored) {
      const parsed = JSON.parse(stored);
      const sorted = parsed.sort(
        (a: Note, b: Note) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setNotes(sorted);
      setFilteredNotes(sorted);
    }
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    setFilteredNotes(updatedNotes);
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  const addOrUpdateNote = (title: string, content: string) => {
    const date = new Date().toDateString();
    let updatedNotes;
    if (editNote) {
      updatedNotes = notes.map(n =>
        n.id === editNote.id ? { ...n, title, content, date } : n
      );
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        date,
      };
      updatedNotes = [newNote, ...notes];
    }
    saveNotes(updatedNotes);
    setEditNote(null);
    setModalVisible(false);
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const filtered = notes.filter(
      n =>
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
    );
    setFilteredNotes(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredNotes(notes);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Notes</Text>
        <View style={styles.iconContainer}>
          <Icon name="check-square" size={22} color="#fff" style={{ marginRight: 15 }} />
          <Icon
            name="search"
            size={22}
            color="#fff"
            onPress={() => setIsSearchVisible(!isSearchVisible)}
          />
          <Icon
            name="more-horizontal"
            size={22}
            color="#fff"
            style={{ marginRight: 25, marginLeft: 20 }}
          />
        </View>
      </View>

      {/* Search Bar */}
      {isSearchVisible && (
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Text style={{ color: 'white' }}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearSearch} style={styles.searchButton}>
            <Text style={{ color: 'white' }}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notes List */}
      <ScrollView style={{ flex: 1 }}>
        {filteredNotes.map(note => (
          <NoteCard
            key={note.id}
            title={note.title}
            subtitle={note.content}
            date={note.date}
            onPress={() => {
              setEditNote(note);
              setModalVisible(true);
            }}
            onDelete={() => {
              const updated = notes.filter(n => n.id !== note.id);
              saveNotes(updated);
            }}
          />
        ))}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditNote(null);
          setModalVisible(true);
        }}
      >
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <AddNoteModal
        visible={modalVisible}
        onSave={addOrUpdateNote}
        onClose={() => {
          setEditNote(null);
          setModalVisible(false);
        }}
        initialTitle={editNote?.title}
        initialContent={editNote?.content}
      />

      {/* Bottom  Bar */}
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
    color: 'white',
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
