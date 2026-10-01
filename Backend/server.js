const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'library'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});


app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running!' });
});


app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (results.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error creating user'
                });
            }

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                userId: result.insertId
            });
        });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = results[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.created_at
            }
        });
    });
});


app.get('/api/user/:id', (req, res) => {
    const userId = req.params.id;

    const query = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: results[0]
        });
    });
});


app.get('/api/book/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = 'SELECT * FROM book WHERE user_id = ? ORDER BY created_at DESC';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        res.json({
            success: true,
            books: results
        });
    });
});


app.post('/api/book', (req, res) => {
    const { name, penulis, category, user_id } = req.body;

    if (!name || !penulis || !category || !user_id) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required (name, penulis, category, user_id)'
        });
    }

    if (category !== 'Fiksi' && category !== 'Non-Fiksi') {
        return res.status(400).json({
            success: false,
            message: 'Category must be either Fiksi or Non-Fiksi'
        });
    }

    const insertQuery = 'INSERT INTO book (name, penulis, category, user_id) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [name, penulis, category, user_id], (err, result) => {
        if (err) {
            console.error('Error inserting book:', err);
            return res.status(500).json({
                success: false,
                message: 'Error adding book'
            });
        }

        const selectQuery = 'SELECT * FROM book WHERE id = ?';
        db.query(selectQuery, [result.insertId], (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Book added but error retrieving data'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Book added successfully',
                book: results[0]
            });
        });
    });
});


app.put('/api/book/:id', (req, res) => {
    const bookId = req.params.id;
    const { name, penulis, category, user_id } = req.body;

    if (!name || !penulis || !category || !user_id) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    if (category !== 'Fiksi' && category !== 'Non-Fiksi') {
        return res.status(400).json({
            success: false,
            message: 'Category must be either Fiksi or Non-Fiksi'
        });
    }

    const checkQuery = 'SELECT * FROM book WHERE id = ? AND user_id = ?';
    db.query(checkQuery, [bookId, user_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found or unauthorized'
            });
        }

        const updateQuery = 'UPDATE book SET name = ?, penulis = ?, category = ? WHERE id = ? AND user_id = ?';
        db.query(updateQuery, [name, penulis, category, bookId, user_id], (err) => {
            if (err) {
                console.error('Error updating book:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating book'
                });
            }

            const selectQuery = 'SELECT * FROM book WHERE id = ?';
            db.query(selectQuery, [bookId], (err, results) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Book updated but error retrieving data'
                    });
                }

                res.json({
                    success: true,
                    message: 'Book updated successfully',
                    book: results[0]
                });
            });
        });
    });
});


app.delete('/api/book/:id/:userId', (req, res) => {
    const bookId = req.params.id;
    const userId = req.params.userId;

    const checkQuery = 'SELECT * FROM book WHERE id = ? AND user_id = ?';
    db.query(checkQuery, [bookId, userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found or unauthorized'
            });
        }

        db.query('DELETE FROM peminjaman WHERE book_id = ?', [bookId], (err) => {
            if (err) {
                console.error('Error deleting peminjaman:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error deleting book'
                });
            }

            const deleteQuery = 'DELETE FROM book WHERE id = ? AND user_id = ?';
            db.query(deleteQuery, [bookId, userId], (err) => {
                if (err) {
                    console.error('Error deleting book:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error deleting book'
                    });
                }

                res.json({
                    success: true,
                    message: 'Book deleted successfully'
                });
            });
        });
    });
});






app.get('/api/peminjaman/:userId', (req, res) => {
    const query = `
        SELECT p.id, p.book_id, p.peminjam,
               DATE_FORMAT(p.tenggat, '%Y-%m-%d') AS tenggat,
               b.name AS title, b.penulis AS author
        FROM peminjaman p
        JOIN book b ON b.id = p.book_id
        WHERE p.user_id = ?
        ORDER BY p.tenggat ASC`;

    db.query(query, [req.params.userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        res.json({
            success: true,
            peminjaman: results
        });
    });
});

app.post('/api/peminjaman', (req, res) => {
    const { book_id, user_id, peminjam, tenggat } = req.body;

    if (!book_id || !user_id || !peminjam || !tenggat) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required (book_id, user_id, peminjam, tenggat)'
        });
    }


    db.query('SELECT id FROM book WHERE id = ? AND user_id = ?', [book_id, user_id], (err, books) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (books.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found or unauthorized'
            });
        }

        const insertQuery = 'INSERT INTO peminjaman (book_id, user_id, peminjam, tenggat) VALUES (?, ?, ?, ?)';
        db.query(insertQuery, [book_id, user_id, peminjam.trim(), tenggat], (err, result) => {
            if (err) {
                console.error('Error inserting peminjaman:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error adding peminjaman'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Peminjaman added successfully',
                id: result.insertId
            });
        });
    });
});


app.put('/api/peminjaman/:id', (req, res) => {
    const { peminjam, tenggat, user_id } = req.body;

    if (!peminjam || !tenggat || !user_id) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    const updateQuery = 'UPDATE peminjaman SET peminjam = ?, tenggat = ? WHERE id = ? AND user_id = ?';
    db.query(updateQuery, [peminjam.trim(), tenggat, req.params.id, user_id], (err, result) => {
        if (err) {
            console.error('Error updating peminjaman:', err);
            return res.status(500).json({
                success: false,
                message: 'Error updating peminjaman'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Peminjaman not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Peminjaman updated successfully'
        });
    });
});


app.delete('/api/peminjaman/:id/:userId', (req, res) => {
    const { id, userId } = req.params;

    db.query('DELETE FROM peminjaman WHERE id = ? AND user_id = ?', [id, userId], (err, result) => {
        if (err) {
            console.error('Error deleting peminjaman:', err);
            return res.status(500).json({
                success: false,
                message: 'Error returning book'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Peminjaman not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Book returned successfully'
        });
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});