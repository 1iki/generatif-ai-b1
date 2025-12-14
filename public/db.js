
const DB_NAME = "chat_history_db";
const DB_VERSION = 1;
let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("chat_sessions")) {
        db.createObjectStore("chat_sessions", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains("chat_messages")) {
        const messageStore = db.createObjectStore("chat_messages", {
          keyPath: "id",
          autoIncrement: true,
        });
        messageStore.createIndex("session_id", "session_id", {
          unique: false,
        });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject("Error opening database");
    };
  });
}

function createChatSession() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["chat_sessions"], "readwrite");
    const store = transaction.objectStore("chat_sessions");
    const session = { created_at: new Date() };
    const request = store.add(session);

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject("Error creating chat session");
    };
  });
}

function saveMessage(sessionId, role, text) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["chat_messages"], "readwrite");
    const store = transaction.objectStore("chat_messages");
    const message = {
      session_id: sessionId,
      role: role,
      text: text,
      timestamp: new Date(),
    };
    const request = store.add(message);

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject("Error saving message");
    };
  });
}

function loadMessages(sessionId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["chat_messages"], "readonly");
    const store = transaction.objectStore("chat_messages");
    const index = store.index("session_id");
    const request = index.getAll(sessionId);

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject("Error loading messages");
    };
  });
}

function loadAllChatSessions() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["chat_sessions"], "readonly");
    const store = transaction.objectStore("chat_sessions");
    const request = store.getAll();

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject("Error loading chat sessions");
    };
  });
}
