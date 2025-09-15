import sqlite3 from "sqlite3" ;

export const getATfromDB = async (shop) => {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database("../database.sqlite");
      db.get(
        "SELECT accessToken FROM shopify_sessions WHERE shop = ?",
        [shop],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row.accessToken);
          } else {
            resolve(null);
          }
        }
      );
      db.close();
    });
  };