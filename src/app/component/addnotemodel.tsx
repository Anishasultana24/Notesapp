import React, { useEffect, useState, useMemo } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface Props {
  visible: boolean;
  onSave: (title: string, content: string) => void;
  onClose: () => void;
  onDelete?: () => void;
  initialTitle?: string;
  initialContent?: string;
}

export default function AddNoteModal({
  visible,
  onSave,
  onClose,
  onDelete,
  initialTitle = '',
  initialContent = '',
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  // sync incoming data every time the modal opens
  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setContent(initialContent);
    }
  }, [visible, initialTitle, initialContent]);

  const charCount = useMemo(() => (title + content).length, [title, content]);

  const handleDelete = () => {
    Alert.alert('Delete note?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDelete?.();
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* -- Header bar -- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              onSave(title.trim(), content.trim());
              
            }}
          >
            <Icon name="check" size={24} color="#30C957" />
          </TouchableOpacity>
        </View>

        {/* Title  */}
        <TextInput
          placeholder="Title"
          placeholderTextColor="#555"
          value={title}
          onChangeText={setTitle}
          style={styles.titleInput}
        />

        {/* - Date + time*/}
        <Text style={styles.meta}>
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          · {charCount} characters
        </Text>

        {/*  Inputs */}

        <TextInput
          placeholder="Note"
          placeholderTextColor="#555"
          value={content}
          onChangeText={setContent}
          multiline
          style={styles.contentInput}
        />



      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    padding: 6,
  },
  meta: {
    color: '#777',
    fontSize: 12,
    marginTop: 8,
    // marginBottom: 5,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 1,
  },
  contentInput: {
    marginTop:20,
    fontSize: 16,
    color: '#fff',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 0.5,
    borderTopColor: '#333',
  },
});
