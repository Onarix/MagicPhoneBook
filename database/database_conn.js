// ./database.js

const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

function executeQuery(query, callback) {
  const db = new sqlite3.Database("database/book_save.db");

  db.all(query, (err, rows) => {
    if (err) {
      console.error(err.message);
      return callback(err, null);
    }

    // Zamknięcie połączenia z bazą danych po zakończeniu zapytania
    db.close((err) => {
      if (err) {
        console.error(
          "Błąd przy zamykaniu połączenia z bazą danych:",
          err.message
        );
      }
    });
    callback(null, rows);
  });
}

function deleteUser(userId, callback) {
  const query = "DELETE FROM dane_osobowe WHERE id = " + userId;

  executeQuery(query, callback);
}

function searchUser(query, callback) {
  // Use a parameterized SQL query to search for users in the SQLite database
  const match = `
        SELECT * FROM dane_osobowe
        WHERE LOWER(imie) LIKE '%' || ? || '%'
        OR LOWER(nazwisko) LIKE '%' || ? || '%'
        OR LOWER(adres) LIKE '%' || ? || '%'
        OR LOWER(telefon) LIKE '%' || ? || '%'
        OR LOWER(mail) LIKE '%' || ? || '%'
    `;

  // Use an array of parameters to avoid SQL injection
  const params = [query, query, query, query, query];

  const db = new sqlite3.Database("database/book_save.db");

  db.all(match, params, (err, results) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      if (callback) {
        callback(err, null);
      }
    } else {
      if (callback) {
        callback(null, results);
      }
    }
  });
}

const registerUser = (username, password, callback) => {
  const db = new sqlite3.Database("database/users.db");

  // Hash the password
  bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
    if (hashErr) {
      return callback("Error hashing password", null);
    }

    // Insert the user into the database
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.run(sql, [username, hashedPassword], (insertErr) => {
      if (insertErr) {
        return callback("Registration failed", null);
      }
      callback(null, "Registration successful");
    });
  });
};

const loginUser = (username, password, callback) => {
  const db = new sqlite3.Database("database/users.db");

  // Retrieve the user from the database
  const sql = "SELECT * FROM users WHERE username = ?";
  db.get(sql, [username], async (err, user) => {
    if (err) {
      return callback("Login failed", null);
    }

    // Check if the user exists and the password is correct
    if (user && (await bcrypt.compare(password, user.password))) {
      callback(null, "Login successful");
    } else {
      callback("Invalid username or password", null);
    }
  });
};

module.exports = {
  executeQuery,
  deleteUser,
  searchUser,
  registerUser,
  loginUser,
};
