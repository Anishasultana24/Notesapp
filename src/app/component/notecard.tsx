import React from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface Props {
  title: string;
  subtitle: string;
  date: string;
  onPress: () => void;
  onDelete: () => void;
  selected?: boolean;      // new
  isSelectMode?: boolean;  // new
}

export default function NoteCard({
  title,
  subtitle,
  date,
  onPress,
  onDelete,
  selected = false,
  isSelectMode = false,
}: Props) {
  /* ------------------------------------------------ delete confirm ---- */
  const confirmDelete = () => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  /* ------------------------------------------------ render ------------ */
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        selected && styles.cardSelected,          // highlight when picked
      ]}
    >
      {/* tick overlay */}
      {selected && (
        <View style={styles.tickOverlay}>
          <Icon name="check" size={14} color="#30C957" />
        </View>
      )}

      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {/* hide trash while in select‑mode */}
        {!isSelectMode && (
          <TouchableOpacity onPress={confirmDelete} hitSlop={10}>
            <Icon name="trash-2" size={18} color="#ff5c5c" />
          </TouchableOpacity>
        )}
      </View>

      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <Text style={styles.date}>{date}</Text>
    </Pressable>
  );
}

/* --------------------------------------------------------------------- */
/*  styles                                                               */
/* --------------------------------------------------------------------- */
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#222',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  cardSelected: {
    borderWidth: 1,
    borderColor: '#30C957',
  },
  tickOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    flexShrink: 1,
    paddingRight: 10,
  },
  subtitle: {
    color: '#ccc',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 6,
  },
});
