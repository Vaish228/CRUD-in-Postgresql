const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 2500;

app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'test',
  port: 5432,
  password: 'Siva@5Ganesh',
});

pool.connect((err) => {
  if (err) {
    return console.error('Error connecting to PostgreSQL:', err.stack);
  }
  pool.query(
    `CREATE TABLE IF NOT EXISTS details (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      num VARCHAR(10),
      mail VARCHAR(220)
    )`,
    (err, result) => {
      if (err) {
        return console.error('Error creating table:', err);
      }
      console.log("Table 'details' created successfully");
    }
  );
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post('/insert', async (req, res) => {
  const { name, num, mail } = req.body;
  console.log('Received form data:', { name, num, mail });
  try {
    await pool.query("INSERT INTO details (name, num, mail) VALUES ($1, $2, $3)", [name, num, mail]);
    res.redirect('/');
  } catch (err) {
    console.error("Error executing query:", err.stack);
    res.status(500).send("Data can't be inserted");
  }
});

app.get('/report', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM details');
    const items = result.rows;
    console.log("Reports:");
    console.log(items);

    let tableContent = `
    <html>
    <head>
      <title>Report</title>
      <style>
        body {
          background-image: url("https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D");
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;          
          font-family: Arial, sans-serif;
          background-color: #f8f9fa;
          margin: 0;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .stylised-table {
          width: 80%;
          border-collapse: collapse;
          margin: 25px 0;
          font-size: 18px;
          text-align: left;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .stylised-table th, .stylised-table td {
          padding: 12px 15px;
          border: 1px solid #ddd;
        }
        .stylised-table th {
          background-color: #009879;
          color: #ffffff;
          text-align: center;
        }
        .stylised-table tr {
          background-color: #ffffff;
          transition: background-color 0.2s;
        }
        .stylised-table tr:nth-of-type(even) {
          background-color: #f3f3f3;
        }
        .stylised-table tr:hover {
          background-color: #f1f1f1;
        }
        .stylised-table td a {
          text-decoration: none;
          color: #009879;
        }
        .stylised-table button {
          background-color: #009879;
          border: none;
          color: white;
          padding: 10px 20px;
          text-align: center;
          display: inline-block;
          font-size: 16px;
          margin: 4px 2px;
          cursor: pointer;
          border-radius: 5px;
        }
        .stylised-table button a {
          color: white;
        }
        .stylised-table button a:hover {
          color: #ffffff;
          text-decoration: underline;
        }
        .center-button {
          margin-top: 20px;
        }
        .center-button button {
          background-color: #009879;
          border: none;
          color: white;
          padding: 10px 20px;
          text-align: center;
          display: inline-block;
          font-size: 16px;
          margin: 4px 2px;
          cursor: pointer;
          border-radius: 5px;
        }
        .center-button button a {
          color: white;
          text-decoration: none;
        }
        .center-button button a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <h1>Records Table</h1>
      <table class="stylised-table">
        <tr>
          <th>Name</th>
          <th>Mobile</th>
          <th>Email</th>
          <th>Action1</th>
          <th>Action2</th>
        </tr>`;

    tableContent += items.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${item.num}</td>
          <td>${item.mail}</td>
          <td><button type="submit"><a href="/change/${item.id}">Update</a></button></td>
          <td><button type="submit"><a href="/delete/${item.id}">Delete</a></button></td>
        </tr>`).join("");

    tableContent += `</table>
      <div class="center-button">
        <button type="submit"><a href="/">Back to Form</a></button>
      </div>
    </body>
    </html>`;
    res.send(tableContent);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Failed to fetch data");
  }
});
app.get('/change/:id', (req, res) => {
  res.sendFile(__dirname + '/upd.html');
});
app.post('/update/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, num, mail } = req.body;
    await pool.query('UPDATE details SET name=$1, num=$2, mail=$3 WHERE id=$4', [name, num, mail, id]);
    res.redirect('/report');
  } catch (err) {
    console.error("Error updating data:", err);
    res.status(500).send("Data can't be updated");
  }
});
app.get('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM details WHERE id=$1', [id]);
    res.redirect('/report');
  } catch (err) {
    console.error("Error deleting data:", err);
    res.status(500).send("Data can't be deleted");
  }
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
