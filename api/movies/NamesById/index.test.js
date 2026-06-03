const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const MovieModel = require("../models/movie");

test("NamesById returns status code 400 with error for missing params", async () => {
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

test("NamesById returns status code 400 with error for missing movieId", async () => {
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

test("NamesById returns status code 400 with error for missing characterName", async () => {
  let req = {
    header: {},
    params: {
      movieId: "69efd1c1b2f8c7327f029faf",
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

test("NamesById returns status code 406 with the string Invalid movieId - Must be an ObjectId", async () => {
  let req = {
    header: {},
    params: {
      movieId: "InvalidId",
      characterName: "Gandalf",
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

test("NamesById returns status code 500 with error string", async () => {
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

test("NamesById returns status code 404 based on no matching movieId", async () => {
  const MovieModel = require("../models/movie");

  mockingoose(MovieModel).toReturn(null, "findOne");

  let req = {
    header: {},
    params: {
      movieId: "69efd1c1b2f8c7327f029faa",
      characterName: "Gandalf",
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

test("NamesById returns status code 404 based on no matching characterName", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/names-by-id-get-find-document.json",
  );

  mockingoose(MovieModel).toReturn(movieDocument, "findOne");

  let req = {
    header: {},
    params: {
      movieId: "69efd1c1b2f8c7327f029faf",
      characterName: "NonExistentCharacter",
    },
  };

  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(404);

  expect(body).toEqual({
    error: "No character found",
  });
});

test("NamesById returns movie object by movieId and characterName", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/names-by-id-get-find-document.json",
  );

  mockingoose(MovieModel).toReturn(movieDocument, "findOne");

  let req = {
    header: {},
    params: {
      movieId: "69efd1c1b2f8c7327f029faf",
      characterName: "aragorn",
    },
  };

  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(200);

  const moviesResponse = getJSON(
    "../api/movies/_test/json-responses/names-by-id-get-response.json",
  );

  expect(JSON.stringify(body)).toBe(JSON.stringify(moviesResponse));
});
