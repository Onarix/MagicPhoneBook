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

app.post('/users', (req, res) => {
    const { imie, nazwisko, adres, telefon, mail } = req.body;

    // Validate required fields (you can add more validation as needed)
    if (!imie || !nazwisko || !adres || !telefon || !mail) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `INSERT INTO dane_osobowe (imie, nazwisko, adres, telefon, mail) VALUES ('${imie}', '${nazwisko}', '${adres}', '${telefon}', '${mail}')`;


    executeQuery.executeQuery(query, (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Error adding user to the database' });
        }

        res.status(201).json({ message: 'User added successfully' });
    });
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

app.get('/users/:nazwisko', (req, res) => {
    const username = req.params.nazwisko;

    executeQuery.searchUser(username, (err, data) => {
        if (err) {
            res.status(500).json({ message: 'Error user' });
        } else {
            return res.status(200).json({ message: 'User found successfully', data: data });
        }
    });
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
