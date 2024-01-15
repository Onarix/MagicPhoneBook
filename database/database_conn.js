// ./database.js

const sqlite3 = require('sqlite3').verbose();

function executeQuery(query, callback) {
    const db = new sqlite3.Database('database/book_save.db');

    db.all(query, (err, rows) => {
        if (err) {
            console.error(err.message);
            return callback(err, null);
        }

        // Zamknięcie połączenia z bazą danych po zakończeniu zapytania
        db.close((err) => {
            if (err) {
                console.error('Błąd przy zamykaniu połączenia z bazą danych:', err.message);
            }
        });
        callback(null, rows);
    });
}

function deleteUser(userId, callback) {
    const query = 'DELETE FROM dane_osobowe WHERE id = ' + userId;

    executeQuery(query, callback);
}

function searchUser(userSurrname, callback) {
    const query = "SELECT * FROM dane_osobowe WHERE nazwisko = '" + userSurrname +"'";
    return executeQuery(query, callback);
}

module.exports = {
    executeQuery,
    deleteUser,
    searchUser
};
