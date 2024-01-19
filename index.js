// ./app.js

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const executeQuery = require('./database/database_conn')
app.set('view engine', 'ejs');
app.use(express.json());

const query = "SELECT * FROM 'dane_osobowe'";
app.set('views', path.join(__dirname, 'static', 'html'));

app.use(express.static(__dirname + '/static'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.get('/', (req, res) => {
    executeQuery.executeQuery(query, (err, data) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.render('index.ejs', { data });
    });
});

const validateAndSanitizeInput = (input) => {
    // Regular expression for validating phone numbers (simple example)
    const phoneRegex = /^\d{10}$/;

    // Regular expression for validating email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const { imie, nazwisko, adres, telefon, mail } = input;

    // Validate and sanitize each field
    if (!imie || !nazwisko || !adres || !telefon || !mail) {
        throw new Error('All fields are required');
    }

    if (typeof imie !== 'string' || typeof nazwisko !== 'string' || typeof adres !== 'string' ||
        typeof telefon !== 'string' || typeof mail !== 'string') {
        throw new Error('Invalid input types');
    }

    if (imie.length > 255 || nazwisko.length > 255 || adres.length > 255 || mail.length > 255) {
        throw new Error('Input length exceeds maximum allowed');
    }

    if (!phoneRegex.test(telefon)) {
        throw new Error('Invalid phone number');
    }

    if (!emailRegex.test(mail)) {
        throw new Error('Invalid email address');
    }

    // If all validations pass, return sanitized values
    return {
        imie: imie.trim(),
        nazwisko: nazwisko.trim(),
        adres: adres.trim(),
        telefon: telefon.trim(),
        mail: mail.trim(),
    };
};

app.post('/users', (req, res) => {
    try {
        const sanitizedInput = validateAndSanitizeInput(req.body);

        const query = `INSERT INTO dane_osobowe (imie, nazwisko, adres, telefon, mail) VALUES (
            '${sanitizedInput.imie}', '${sanitizedInput.nazwisko}', '${sanitizedInput.adres}',
            '${sanitizedInput.telefon}', '${sanitizedInput.mail}')`;

        executeQuery.executeQuery(query, (err) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ message: 'Error adding user to the database' });
            }

            res.status(201).json({ message: 'User added successfully' });
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ message: error.message });
    }
});

app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);

    executeQuery.deleteUser(userId, (err) => {
        if (err) {
            res.status(500).json({ message: 'Error deleting user' });
        } else {
            res.status(200).json({ message: 'User deleted successfully' });
        }
    });
});

app.get('/users/search', (req, res) => {
    const query = req.query.query.toLowerCase();

    executeQuery.searchUser(query, (err, results) => {
        if(err) {
            console.error('Error while finding user: ', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json(results);
        }
    } )

});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Call the registerUser function from your separate file
    executeQuery.registerUser(username, password, (err, message) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json({ message });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Call the loginUser function from your separate file
    executeQuery.loginUser(username, password, (err, message) => {
        if (err) {
            return res.status(401).json({ error: err });
        }
        res.json({ message });
    });
});

app.listen(port, () => {
    console.log(`MagicPhoneBook app listening on port ${port}`);
});
