import React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

export default function NoteCard({
  title,
  subtitle,
  date,
  onPress,
  onDelete,
}: {
  title: string;
  subtitle: string;
  date: string;
  onPress: () => void;
  onDelete: () => void;
}) {
  const confirmDelete = () => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>

        <TouchableOpacity onPress={confirmDelete} hitSlop={10}>
          <Icon name="trash-2" size={18} color="#ff5c5c" />
        </TouchableOpacity>
      </View>

      {subtitle !== "" && <Text style={styles.subtitle}>{subtitle}</Text>}
      <Text style={styles.date}>{date}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#222",
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    flexShrink: 1,
    paddingRight: 10,
  },
  subtitle: {
    color: "#ccc",
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 6,
  },
});
