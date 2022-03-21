const db = require("../db/db");

const Reviews = {
  findMovieReviews: (movie_id) => {
    const sql = `SELECT review FROM Reviews WHERE movie_id = $1`;
    return db.query(sql, [movie_id]).then((dbRes) => dbRes.rows);
  },
  create: (user_id, movie_id, rating, review) => {
    const sql = `
    INSERT INTO reviews (user_id, movie_id, rating, review) VALUES ($1, $2, $3, $4)`;

    return db
      .query(sql, [user_id, movie_id, rating, review])
      .then((dbRes) => dbRes.rows);
  },
  doesExist: (userId, movieId) => {
    const sql = `SELECT * FROM Reviews WHERE user_id = $1 AND movie_id = $2`;
    return db.query(sql, [userId, movieId]).then((dbRes) => dbRes.rows.length);
  },
  updateRating: (userId, movieId, rating) => {
    const sql = `UPDATE reviews SET rating = $3 WHERE user_id = $1 AND movie_id = $2`;
    return db.query(sql, [userId, movieId, rating]).then((dbRes) => dbRes.rows);
  },
};

module.exports = Reviews;
