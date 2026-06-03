const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const MovieModel = require("../models/movie");

test("MovieByIdGet returns status code 400 with error for missing params", async () => {
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

test("MovieByIdGet returns status code 400 with error for missing id", async () => {
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

test("MovieByIdGet returns status code 400 with the string Invalid id - Must be an ObjectId", async () => {
  let req = {
    header: {},
    params: {
      id: "InvalidId",
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(400);
  expect(body).toEqual({
    error: "Invalid id - Must be an ObjectId",
  });
});

test("MovieByIdGet returns status code 500 with error string", async () => {
  const MovieModel = require("../models/movie");

  mockingoose(MovieModel).toReturn(new Error(), "findOne");

  let req = {
    header: {},
    params: {
      id: "69efd1c1b2f8c7327f029faf",
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

test("MovieByIdGet returns status code 404 based on no matching id", async () => {
  const MovieModel = require("../models/movie");

  mockingoose(MovieModel).toReturn(null, "findOne");

  let req = {
    header: {},
    params: {
      id: "69efd1c1b2f8c7327f029faa",
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

test("MovieByIdGet returns movie by id", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/movie-by-id-get-document.json",
  );

  mockingoose(MovieModel).toReturn(movieDocument, "findOne");

  let req = {
    header: {},
    params: {
      id: "69efd1c1b2f8c7327f029faf",
    },
  };

  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(200);

  const movieResponse = getJSON(
    "../api/movies/_test/json-responses/movie-by-id-get-response.json",
  );

  expect(JSON.stringify(body)).toBe(JSON.stringify(movieResponse));
});
