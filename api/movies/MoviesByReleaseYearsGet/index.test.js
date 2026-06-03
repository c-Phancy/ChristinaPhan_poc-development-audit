const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const MovieModel = require("../models/movie");

test("MoviesByReleaseYearsGet returns status code 400 with error for missing params", async () => {
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

test("MoviesByReleaseYearsGet returns status code 400 with error for missing startReleaseYear", async () => {
  let req = {
    header: {},
    params: { endReleaseYear: "2020" },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(400);
  expect(body).toEqual({
    error: "Missing Params from Request",
  });
});

test("MoviesByReleaseYearsGet returns status code 400 with error for missing endReleaseYear", async () => {
  let req = {
    header: {},
    params: { startReleaseYear: "2000" },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(400);
  expect(body).toEqual({
    error: "Missing Params from Request",
  });
});

test("MoviesByReleaseYearsGet returns status code 406 with the string Starting release year must be a number", async () => {
  let req = {
    header: {},
    params: {
      startReleaseYear: "twenty",
      endReleaseYear: "2020",
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(406);
  expect(body).toEqual({
    error: "Starting release year must be a number",
  });
});

test("MoviesByReleaseYearsGet returns status code 406 with the string Ending release year must be a number", async () => {
  let req = {
    header: {},
    params: {
      startReleaseYear: "2000",
      endReleaseYear: "twenty",
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(406);
  expect(body).toEqual({
    error: "Ending release year must be a number",
  });
});

test("MoviesByReleaseYearsGet returns status code 406 with the string Starting release year must be between 2000 and 2020", async () => {
  let req = {
    header: {},
    params: {
      startReleaseYear: "1999",
      endReleaseYear: "2020",
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(406);
  expect(body).toEqual({
    error: "Starting release year must be between 2000 and 2020",
  });
});

test("MoviesByReleaseYearsGet returns status code 406 with the string Ending release year must be between 2000 and 2020", async () => {
  let req = {
    header: {},
    params: {
      startReleaseYear: "2000",
      endReleaseYear: "2021",
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(406);
  expect(body).toEqual({
    error: "Ending release year must be between 2000 and 2020",
  });
});

test("MoviesByReleaseYearsGet returns status code 406 with the string Starting release year must be less than or equal to ending release year", async () => {
  let req = {
    header: {},
    params: {
      startReleaseYear: "2020",
      endReleaseYear: "2000",
    },
  };

  let res = makeMockRes();

  await func.inject({})(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(406);
  expect(body).toEqual({
    error:
      "Starting release year must be less than or equal to ending release year",
  });
});

test("MoviesByReleaseYearsGet returns status code 500 with error string", async () => {
  const MovieModel = require("../models/movie");

  mockingoose(MovieModel).toReturn(new Error(), "find");

  let req = {
    header: {},
    params: {
      startReleaseYear: "2000",
      endReleaseYear: "2001",
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

test("MoviesByReleaseYearsGet returns status code 404 based on no matching movies", async () => {
  const MovieModel = require("../models/movie");

  mockingoose(MovieModel).toReturn([], "find");

  let req = {
    header: {},
      params: {
        startReleaseYear: "2000",
        endReleaseYear: "2000",
    },
  };

  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(404);

  expect(body).toEqual({
    error: "No movies found",
  });
});

test("MoviesByReleaseYearsGet returns list of movies", async () => {
  const moviesDocuments = getJSON(
    "../api/movies/_test/documents/movies-by-release-years-get-document.json",
  );

  mockingoose(MovieModel).toReturn(moviesDocuments, "find");

  let req = {
    header: {},
    params: {
      startReleaseYear: "2000",
      endReleaseYear: "2005",
    },
  };

  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];

  expect(res.status).toHaveBeenCalledWith(200);

  const moviesResponse = getJSON(
    "../api/movies/_test/json-responses/movies-by-release-years-get-response.json",
  );

  expect(JSON.stringify(body)).toBe(JSON.stringify(moviesResponse));
});
