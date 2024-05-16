const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "movies.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    name: dbObject.name,
    img: dbObject.img,
    summary: dbObject.summary,
  };
};

//get all movies
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT
          * 
        FROM 
          movies;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//create a new movie

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { name, img, summary } = movieDetails;
  const addMoviesQuery = `
        INSERT INTO
            movies (name, img, summary)
        VALUES 
            (
               '${name}',
               '${img}',
                '${summary}'


            );`;
  const dbResponse = await db.run(addMoviesQuery);
  const movieId = dbResponse.lastId;
  response.send("Movie Added");
});

//get a movie

app.get("/movies/:id/", async (request, response) => {
  const { id } = request.params;
  const api3 = `
    SELECT
     * 
    FROM 
        movies 
    WHERE 
        id = '${id}';`;

  const db2 = await db.get(api3);
  response.send(convertDbObjectToResponseObject(db2));
});

//update movie

app.put("/movies/:id/", async (request, response) => {
  const { id } = request.params;
  const movieDetails = request.body;
  const { name, img, summary } = movieDetails;
  const updateMoviesQuery = `
        UPDATE movies
        SET
            name = '${name}',
            img = '${img}',
            summary = '${summary}'
        WHERE id = ${id};`;
  await db.run(updateMoviesQuery);
  response.send("Movie Details Updated");
});

//delete Movie

app.delete("/movies/:id/", async (request, response) => {
  const { id } = request.params;
  const deleteMoviesQuery = `DELETE FROM movies WHERE id = ${id}`;
  await db.run(deleteMoviesQuery);
  response.send("Movie Removed");
});

module.exports = app;
