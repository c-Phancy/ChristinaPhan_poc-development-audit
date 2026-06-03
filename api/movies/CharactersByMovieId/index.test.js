const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const MovieModel = require("../models/movie");

test("CharactersByMovieId returns status code 400 with error for missing params", async () => {
  let req = {
    header: {},
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(400);
  expect(body).toEqual({
    error: "Missing Params from Request",
  });
});

test("CharactersByMovieId returns status code 400 with error for missing movieId", async () => {
  let req = {
    header: {},
    params: {},
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(400);
  expect(body).toEqual({
    error: "Missing Params from Request",
  });
});

test("CharactersByMovieId returns status code 406 with the string Invalid movieId - Must be an ObjectId", async () => {
  let req = {
    header: {},
    params: {
      movieId: "InvalidId",
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(400);
  expect(body).toEqual({
    error: "Invalid movieId - Must be an ObjectId",
  });
});

test("CharactersByMovieId returns status code 500 with error string", async () => {
  const MovieModel = require("../models/movie");

  mockingoose(MovieModel).toReturn(new Error(), "findOne");

  let req = {
    header: {},
    params: {
      movieId: "69efd1c1b2f8c7327f029faf",
      characterName: "Gandalf",
    },
  };

  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(500);

  expect(body).toEqual({
    error: "Unexpected server error. Please try again later.",
  });
});

test("CharactersByMovieId returns status code 404 based on no matching movieId", async () => {
  const MovieModel = require("../models/movie");

  mockingoose(MovieModel).toReturn(null, "findOne");

  let req = {
    header: {},
    params: {
      movieId: "69efd1c1b2f8c7327f029fb1",
    },
  };

  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(404);

  expect(body).toEqual({
    error: "No movie found",
  });
});

test("CharactersByMovieId returns list of characters based on movieId", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/characters-by-movie-id-get-document.json",
  );

  mockingoose(MovieModel).toReturn(movieDocument, "findOne");

  let req = {
    header: {},
    params: {
      movieId: "69efd1c1b2f8c7327f029fb0",
    },
  };

  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(200);

  const moviesResponse = getJSON(
    "../api/movies/_test/json-responses/characters-by-movie-id-get-response.json",
  );

  expect(JSON.stringify(body)).toBe(JSON.stringify(moviesResponse));
});
