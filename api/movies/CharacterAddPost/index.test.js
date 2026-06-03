const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const MovieModel = require("../models/movie");
const movie = require("../models/movie");

test("CharacterAddPost returns status code 400 with error for missing body", async () => {
  let req = {
    header: {},
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(400);
  expect(body).toEqual({
    error: "Missing Body of Request",
  });
});

test("CharacterAddPost returns status code 404 with error for missing movieId from body", async () => {
  let req = {
    header: {},
    body: {},
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(404);
  expect(body).toEqual({
    error: "No movie id found",
  });
});

test("CharacterAddPost returns status code 404 with error for missing characterName from body", async () => {
  let req = {
    header: {},
    body: {
      movieId: "6a201a8839b4b536766defa2",
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(404);
  expect(body).toEqual({
    error: "No Main Character Name Provided",
  });
});

test("CharacterAddPost returns status code 406 with the string Invalid movieId - Must be an ObjectId", async () => {
  let req = {
    header: {},
    body: {
      movieId: "invalidMovieId",
      characterName: "Character Name",
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(406);
  expect(body).toEqual({
    error: "Invalid movieId - Must be an ObjectId",
  });
});

test("CharacterAddPost returns status code 406 with the string Character Name is not valid. It must be at least three characters.", async () => {
  let req = {
    header: {},
    body: {
      movieId: "6a201a8839b4b536766defa2",
      characterName: "Ch",
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(406);
  expect(body).toEqual({
    error: "Character Name is not valid. It must be at least three characters.",
  });
});

test("CharacterAddPost returns status code 500 with error string", async () => {
  mockingoose(MovieModel).toReturn(new Error(), "findOneAndUpdate");

  let req = {
    header: {},
    body: {
      movieId: "6a201a8839b4b536766defa2",
      characterName: "Character Name",
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

test("CharacterAddPost returns status code 404 based on no matching movieId", async () => {
  const MovieModel = require("../models/movie");

  mockingoose(MovieModel).toReturn(null, "findOneAndUpdate");

  let req = {
    header: {},
    body: {
      movieId: "6a201a8839b4b536766defa1",
      characterName: "Character Name",
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

test("CharacterAddPost returns status code 200 if document is successfully added", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/character-add-post-update-document.json",
  );

  mockingoose(MovieModel).toReturn(movieDocument, "findOneAndUpdate");

  let req = {
    header: {},
    body: {
      movieId: "6a201a8839b4b536766defa2",
      characterName: "Helm",
    },
  };

  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(200);

  const movieResponse = getJSON(
    "../api/movies/_test/json-responses/character-add-post-update-response.json",
  );

  expect(JSON.stringify(body)).toBe(JSON.stringify(movieResponse));
});
