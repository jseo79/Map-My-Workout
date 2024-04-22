import mysql from 'mysql2';

const connection = mysql.createConnection({
	host: '172.17.0.2', // mysql-server IP
	user: 'root',
	password: 'admin',
});

connection.connect((err) => {
	if (err) {
		console.error('Error connecting to MySQL:', err);
		return;
	}
	console.log('Connected to MySQL server');
});

connection.query(
	'CREATE DATABASE IF NOT EXISTS workouts',
	function (err, result) {
		if (err) {
			console.error('Error creating database:', err);
			return;
		}
		console.log('Database created');
	}
);

export { connection };

// connection.end();
