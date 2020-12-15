const mysql = require('mysql2');
const Config = require('./config.js');

const connection = (multipleStatements = false) => {
  return mysql
    .createConnection({
      host: Config.Config.database_host,
      user: Config.Config.database_user,
      database: global.database ?? Config.Config.database,
      password: Config.Config.database_password,
      multipleStatements: multipleStatements
    })
    .promise();
};

exports.excutReader = async function(
  qry,
  condition = []) {
  try {
    const conn = connection();
    try {
      const rows = await conn.query(qry, condition);
      return rows[0];
    } catch (err) {
      console.log('excutReader Query Error');
      return false;
    }
  } catch (err) {
    console.log('DB Error');
    return false;
  }
};

exports.excutNonQuery = async function(
  qry,
  condition = []) {
  try {
    const conn = connection(true);
    console.log(conn);

    try {
      const rows = await conn.query(qry, condition);
      // conn.commit();
      return rows[0];
    } catch (err) {
      console.log('excutNonQuery Query Error');
      return false;
    }
  } catch (err) {
    console.log('DB Error');
    return false;
  }
};
