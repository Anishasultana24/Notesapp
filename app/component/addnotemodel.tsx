import React, { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    Modal,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

interface Props {
  visible: boolean;
  onSave: (title: string, content: string) => void;
  onClose: () => void;
  onDelete?: () => void; //  delete 
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

  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setContent(initialContent);
    }
  }, [visible, initialTitle, initialContent]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete?.();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Content"
          value={content}
          onChangeText={setContent}
          style={[styles.input, { height: 100 }]}
          multiline
          placeholderTextColor="#888"
        />

        <Button
          title="Save"
          onPress={() => {
            onSave(title, content);
            setTitle('');
            setContent('');
          }}
        />

        {/* Show delete  editing */}
        {onDelete && (
          <View style={styles.deleteButton}>
            <Button title="Delete" onPress={handleDelete} color="red" />
          </View>
        )}

        <View style={styles.cancelButton}>
          <Button title="Cancel" onPress={onClose} color="#888" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    color: '#000',
  },
  deleteButton: {
    marginTop: 10,
  },
  cancelButton: {
    marginTop: 10,
  },
}); 