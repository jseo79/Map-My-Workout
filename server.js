import express from 'express';
import mysql from 'mysql2';

const app = express();
app.use(express.json());
import path from 'path';
const port = 8000;

const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

const con = mysql.createPool({
	host: '172.17.0.2',
	user: 'root',
	password: 'admin',
	database: 'workouts',
});

con.query('CREATE DATABASE workouts', (err, results) => {
	if (err) {
		console.error('Error creating database:', err);
	} else {
		console.log('Database created successfully');
	}
});

// // Route handler to handle POST requests to /workouts
// app.post('/workouts', (req, res) => {
// 	// Assuming you have a database connection set up
// 	// Assuming you are using some ORM or database client library, adjust this part according to your setup
// 	const workouts = req.body.workouts;

// 	// Assuming you want to store the workouts in a database
// 	// You need to implement this part based on your database setup
// 	// For example, using a database client library like Knex.js, Sequelize, or directly using MySQL queries

// 	// For demonstration, just send back a success response
// 	res.status(200).json({
// 		message: 'Workouts received and saved successfully',
// 	});
// });

app.listen(port, () => {
	console.log(`Now listening on port ${port}`);
});
