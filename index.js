const express = require("express");
const app = express();
require("dotenv/config");
const cors = require("cors");
const PORT = process.env.PORT || 8000;
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.ELEPHANT_SQL_CONNECTION_STRING,
});

app.use(express.json());
app.use(cors());

app.get("/api/movies/", (req, res) => {
  pool.query("SELECT * FROM movies;").then((data) => {
    res.json(data.rows);
  });

  app.get("/api/movies/:id", (req, res) => {
    const { id } = req.params;
    pool
      .query("SELECT * FROM movies WHERE id=$1;", [id])
      .then((data) => {
        if (data.rowCount === 0) {
          res
            .status(404)
            .json({ message: `the movie with the id ${id} not found` });
        } else {
          res.json(data.rows[0]);
        }
      })
      .catch((e) => res.status(500).json({ message: e.message }));
  });

  app.post("/api/movies", (req, res) => {
    const {
      title,
      director,
      year,
      rating,
      poster,
      length,
      language,
      genre,
      actors,
    } = req.body;
    pool
      .query(
        "INSERT INTO movies (title,director,year,rating,poster,length,language,genre,actors) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING*;",
        [title, director, year, rating, poster, length, language, genre, actors]
      )
      .then((data) => {
        res.json(data.rows[0]);
      })
      .catch((e) => res.status(500).json({ message: e.message }));
  });
});

app.put("/api/movies/:id", (req, res) => {
  const id = req.params.id;
  const {
    title,
    director,
    year,
    rating,
    poster,
    length,
    language,
    genre,
    actors,
  } = req.body;
  pool
    .query(
      "UPDATE movies SET title=$1,director=$2,year=$3,rating=$4,poster=$5,length=$6,language=$7,genre=$8,actors=$9 WHERE id = $10 RETURNING*;",
      [
        title,
        director,
        year,
        rating,
        poster,
        length,
        language,
        genre,
        actors,
        id,
      ]
    )
    .then((data) => {
      res.json(data.rows[0]);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

app.delete("/api/movies/:id", (req, res) => {
  const id = req.params.id;

  pool
    .query("DELETE FROM movies WHERE id=$1 RETURNING*;", [id])
    .then((data) => {
      res.json(data.rows[0]);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

app.get("/api/comments/", (req, res) => {
  pool
    .query("SELECT * FROM comments;")
    .then((data) => {
      res.json(data.rows);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

//get all the comments of one movie
app.get("/api/movies/:id/comments", (req, res) => {
  const id = req.params.id;
  pool
    .query("SELECT * FROM comments WHERE movieId=$1;", [id])
    .then((data) => {
      res.json(data.rows);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

// post a comment to movie with id x
app.post("/api/movies/:id/comments", (req, res) => {
  const id = req.params.id;
  const { commenttext, username } = req.body;
  pool
    .query(
      "INSERT INTO comments (movieID, commenttext, username) VALUES ($1, $2, $3) RETURNING *;",
      [id, commenttext, username]
    )
    .then((data) => {
      res.json(data.rows[0]);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

app.delete("/api/comments/:id/", (req, res) => {
  const id = req.params.id;
  pool
    .query("DELETE FROM comments WHERE id=$1 RETURNING*;", [id])
    .then((data) => {
      res.json(data.rows[0]);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

app.listen(PORT, () => {
  console.log(`Server is running at port: ${PORT}`);
});
