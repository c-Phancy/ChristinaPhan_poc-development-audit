const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const MovieModel = require("../models/movie");
const movie = require("../models/movie");

test("CharacterByParamsAddPost returns status code 400 with error for missing params", async () => {
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

test("CharacterByParamsAddPost returns status code 400 with error for missing movie_id", async () => {
  let req = {
    header: {},
    params: {
      mainCharacterName: "Character Name",
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(400);
  expect(body).toEqual({
    error: "Missing Params from Request",
  });
});

test("CharacterByParamsAddPost returns status code 400 with error for missing mainCharacterName", async () => {
  let req = {
    header: {},
    params: {
      movie_id: "6a201a8839b4b536766defa2",
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(400);
  expect(body).toEqual({
    error: "Missing Params from Request",
  });
});

test("CharacterByParamsAddPost returns status code 406 with the string Invalid movie_id - Must be an ObjectId", async () => {
  let req = {
    header: {},
    params: {
      movie_id: "invalidMovieId",
      mainCharacterName: "Character Name",
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(406);
  expect(body).toEqual({
    error: "Invalid movie_id - Must be an ObjectId",
  });
});

test("CharacterByParamsAddPost returns status code 406 with the string Main Character Name is not valid. It must be at least three characters.", async () => {
  let req = {
    header: {},
    params: {
      movie_id: "6a201a8839b4b536766defa2",
      mainCharacterName: "Ch",
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(406);
  expect(body).toEqual({
    error:
      "Main Character Name is not valid. It must be at least three characters.",
  });
});

test("CharacterByParamsAddPost returns status code 500 with error string", async () => {
  mockingoose(MovieModel).toReturn(new Error(), "findOneAndUpdate");

  let req = {
    header: {},
    params: {
      movie_id: "6a201a8839b4b536766defa2",
      mainCharacterName: "Character Name",
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

test("CharacterByParamsAddPost returns status code 404 based on no matching movie_id", async () => {
  const MovieModel = require("../models/movie");

  mockingoose(MovieModel).toReturn(null, "findOneAndUpdate");

  let req = {
    header: {},
    params: {
      movie_id: "6a201a8839b4b536766defa1",
      mainCharacterName: "Character Name",
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

test("CharacterByParamsAddPost returns status code 200 if document is successfully added", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/character-by-params-add-post-update-document.json",
  );

  mockingoose(MovieModel).toReturn(movieDocument, "findOneAndUpdate");

  let req = {
    header: {},
    params: {
      movie_id: "6a201a8839b4b536766defa2",
      mainCharacterName: "Olwyn",
    },
  };

  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(200);

  const movieResponse = getJSON(
    "../api/movies/_test/json-responses/character-by-params-add-post-update-response.json",
  );

  expect(JSON.stringify(body)).toBe(JSON.stringify(movieResponse));
});
