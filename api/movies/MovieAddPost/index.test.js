const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const MovieModel = require("../models/movie");

test("MovieAddPost returns status code 400 with error for missing body", async () => {
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

test("MovieAddPost returns status code 406 with error for missing movieName from body", async () => {
  let req = {
    header: {},
    body: {},
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(406);
  expect(body).toEqual({
    error: "No movie name found",
  });
});

test("MovieAddPost returns status code 406 with error for missing releaseYear from body", async () => {
  let req = {
    header: {},
    body: {
      movieName: "Movie Name",
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(406);
  expect(body).toEqual({
    error: "No release year found",
  });
});

test("MovieAddPost returns status code 406 with the string Invalid movie name", async () => {
  let req = {
    header: {},
    body: {
      movieName: "Mov",
      releaseYear: 2000,
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(406);
  expect(body).toEqual({
    error: "Invalid movie name",
  });
});

test("MovieAddPost returns status code 406 with the string Invalid release year", async () => {
  let req = {
    header: {},
    body: {
      movieName: "Movie",
      releaseYear: 1880,
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(406);
  expect(body).toEqual({
    error: "Invalid release year",
  });
});

test("MovieAddPost returns status code 500 with error string", async () => {
  mockingoose(MovieModel).toReturn(new Error(), "findOne");

  let req = {
    header: {},
    body: {
      movieName: "Movie",
      releaseYear: 2000,
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

test("MovieAddPost returns status code 409 for duplicate movie", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/movie-add-post-find-document.json",
  );

  mockingoose(MovieModel).toReturn(movieDocument, "findOne");

  let req = {
    header: {},
    body: {
      movieName: "The Lord of the Rings: The War of the Rohirrim",
      releaseYear: 2024,
    },
  };

  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(409);

  expect(body).toEqual({
    error:
      "Movie with title: The Lord of the Rings: The War of the Rohirrim and release year: 2024 already exists",
  });
});

test("MovieAddPost returns status code 200 if document is successfully added", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/movie-add-post-save-document.json",
  );

  mockingoose(MovieModel).toReturn(null, "findOne");
  mockingoose(MovieModel).toReturn(
    { ...movieDocument, _id: "6a201a8839b4b536766defa2" },
    "save",
  );

  let req = {
    header: {},
    body: {
      movieName: "The Lord of the Rings: The War of the Rohirrim",
      releaseYear: 2024,
    },
  };

  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(200);

  const movieResponse = getJSON(
    "../api/movies/_test/json-responses/movie-add-post-save-response.json",
  );

  expect(JSON.stringify(body)).toBe(JSON.stringify(movieResponse));
});
