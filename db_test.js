 import mysql2 from"mysql2";

// Create a connection to the database
const connection = mysql2.createConnection({
    host: 'localhost',        // Change to your MySQL server IP if necessary
    user:  'mufal',
  password:  'mufaldata@db1',
  database:  'mufaldata'
});

// Attempt to connect
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ', err.stack);
        return;
    }
    console.log('Connected successfully to the database');
});

export const fetchPrice2=(req,res)=>{
    connection.query(`select * from dataprice`,(err,result)=>{
      if(err){console.log(err)}
      res.status(200).json(result)
      console.log(err, result)
    })
  }

// Close the connection
connection.end();

