const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const MovieModel = require("../models/movie");

test("MoviesByRaceGet returns status code 400 with error for missing params", async () => {
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

test("MoviesByRaceGet returns status code 400 with error for missing race", async () => {
  let req = {
    header: {},
    params: { race: "" },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(400);
  expect(body).toEqual({
    error: "Missing Params from Request",
  });
});

test("MoviesByRaceGet returns status code 500 with error string", async () => {
  const MovieModel = require("../models/movie");

  mockingoose(MovieModel).toReturn(new Error(), "find");

  let req = {
    header: {},
    params: {
      race: "Dwarf",
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

test("MoviesByRaceGet returns status code 404 based on no matching movies", async () => {
  const MovieModel = require("../models/movie");

  mockingoose(MovieModel).toReturn([], "find");

  let req = {
    header: {},
      params: {
        race: "oompa loompa",
    },
  };

  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(404);

  expect(body).toEqual({
    error: "No movie(s) with characters of the oompa loompa race were found",
  });
});

test("MoviesByRaceGet returns list of movies", async () => {
  const moviesDocuments = getJSON(
    "../api/movies/_test/documents/movies-by-race-get-document.json",
  );

  mockingoose(MovieModel).toReturn(moviesDocuments, "find");

  let req = {
    header: {},
    params: {
      race: "dwarf",
    },
  };

  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(200);

  const moviesResponse = getJSON(
    "../api/movies/_test/json-responses/movies-by-race-get-response.json",
  );

  expect(JSON.stringify(body)).toBe(JSON.stringify(moviesResponse));
});
