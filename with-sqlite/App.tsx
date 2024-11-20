import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import axios from "axios";
import {
  SQLiteProvider,
  useSQLiteContext,
  type SQLiteDatabase,
} from "expo-sqlite";

/**
 * HolidayEntity represents a single holiday entry in the database.
 */
interface HolidayEntity {
  id: number;
  day: number;
  month: number;
  name: string;
  description: string;
}

export default function App() {
  return (
    <SQLiteProvider databaseName="holidays.db" onInit={migrateDbIfNeeded}>
      <Main />
    </SQLiteProvider>
  );
}

function Main() {
  const db = useSQLiteContext();
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [holidayName, setHolidayName] = useState("");
  const [holidayDescription, setHolidayDescription] = useState("");
  const [holidays, setHolidays] = useState<HolidayEntity[]>([]);

  const fetchHolidays = useCallback(() => {
    async function refetch() {
      await db.withExclusiveTransactionAsync(async () => {
        setHolidays(
          await db.getAllAsync<HolidayEntity>("SELECT * FROM holidays;")
        );
      });
    }
    refetch();
  }, [db]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleAddHoliday = async () => {
    if (!day || !month || (!holidayName && !holidayDescription)) {
      try {
        const response = await axios.get(
          "https://date.nager.at/api/v3/NextPublicHolidays/UA"
        );
        const publicHolidays = response.data;

        if (publicHolidays.length > 0) {
          setHolidayName(publicHolidays[0].name || "");
          setHolidayDescription(publicHolidays[0].localName || "");
        } else {
          Alert.alert("Error", "No holidays found in the response.");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch holidays.");
        return;
      }
    }

    if (day && month && holidayName && holidayDescription) {
      await db.runAsync(
        "INSERT INTO holidays (day, month, name, description) VALUES (?, ?, ?, ?);",
        parseInt(day),
        parseInt(month),
        holidayName,
        holidayDescription
      );
      setDay("");
      setMonth("");
      setHolidayName("");
      setHolidayDescription("");
      fetchHolidays();
    }
  };

  const handleDeleteHoliday = async (id: number) => {
    await db.runAsync("DELETE FROM holidays WHERE id = ?;", id);
    fetchHolidays();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Holiday Planner</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Day"
          value={day}
          keyboardType="numeric"
          onChangeText={setDay}
        />
        <TextInput
          style={styles.input}
          placeholder="Month"
          value={month}
          keyboardType="numeric"
          onChangeText={setMonth}
        />
        <TextInput
          style={styles.input}
          placeholder="Holiday Name"
          value={holidayName}
          onChangeText={setHolidayName}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={holidayDescription}
          onChangeText={setHolidayDescription}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddHoliday}>
          <Text style={styles.buttonText}>Add Holiday</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listArea}>
        {holidays.map((holiday) => (
          <View key={holiday.id} style={styles.holidayItem}>
            <Text style={styles.holidayText}>
              {holiday.day}/{holiday.month}: {holiday.name} -{" "}
              {holiday.description}
            </Text>
            <TouchableOpacity
              onPress={() => handleDeleteHoliday(holiday.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  let { user_version: currentDbVersion } = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS holidays (
        id INTEGER PRIMARY KEY NOT NULL,
        day INTEGER,
        month INTEGER,
        name TEXT,
        description TEXT
      );
    `);
    currentDbVersion = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#1c9963",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listArea: {
    flex: 1,
  },
  holidayItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  holidayText: {
    fontSize: 16,
    color: "#333",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    padding: 8,
    borderRadius: 8,
  },
});
