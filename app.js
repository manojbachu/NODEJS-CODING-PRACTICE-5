const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1 get /movies/

app.get("/movies/", async (request, response) => {
  const moviesQuery = `
    SELECT movie_name FROM movie;`;
  const movieList = await db.all(moviesQuery);
  response.send(
    movieList.map((eachMovie) => {
      return { movieName: eachMovie.movie_name };
    })
  );
});

//API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO movie (director_id, movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  const { director_id, movie_name, lead_actor } = movie;
  response.send({
    movieId: movieId,
    directorId: director_id,
    movieName: movie_name,
    leadActor: lead_actor,
  });
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
  UPDATE movie
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId}`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6

app.get("/directors/", async (request, response) => {
  const directorQuery = `
    SELECT * FROM director;`;
  const directorList = await db.all(directorQuery);
  response.send(
    directorList.map((eachDirector) => {
      return {
        directorId: eachDirector.director_id,
        directorName: eachDirector.director_name,
      };
    })
  );
});

//API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const movieDirectorQuery = `
    SELECT * FROM movie
    NATURAL JOIN director 
    WHERE director_id = ${directorId};`;
  const movieList = await db.all(movieDirectorQuery);
  console.log(movieList);
  response.send(
    movieList.map((eachMovie) => {
      return { movieName: eachMovie.movie_name };
    })
  );
});
module.exports = app;
