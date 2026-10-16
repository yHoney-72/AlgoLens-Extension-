const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(__dirname, "..", "background.js"),
  "utf8"
);

function createHarness(fetchImplementation) {
  const storage = {};
  let messageListener;

  const chrome = {
    runtime: {
      onMessage: {
        addListener(listener) {
          messageListener = listener;
        },
      },
    },
    storage: {
      local: {
        set(values, callback) {
          Object.assign(storage, values);
          if (callback) callback();
        },
        get(keys, callback) {
          const result = {};
          for (const key of keys) {
            if (key in storage) result[key] = storage[key];
          }
          callback(result);
        },
        remove(keys, callback) {
          for (const key of Array.isArray(keys) ? keys : [keys]) {
            delete storage[key];
          }
          if (callback) callback();
        },
      },
    },
  };

  vm.runInNewContext(source, {
    chrome,
    fetch: fetchImplementation,
    console: { log() {} },
    Date,
    JSON,
    Error,
  });

  return { storage, messageListener };
}

test("SOLVE_PROBLEM returns backend data and saves result", async () => {
  const backendData = {
    approaches: [{ name: "Two Pointers", timeComplexity: "O(n)" }],
  };

  const { storage, messageListener } = createHarness(async (url, options) => {
    assert.equal(
      url,
      "https://algolens-backend-qsz2.onrender.com/api/solve"
    );
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), {
      slug: "two-sum",
      title: "Two Sum",
      difficulty: "Easy",
    });

    return {
      ok: true,
      status: 200,
      json: async () => backendData,
    };
  });

  const response = await new Promise((resolve) => {
    const keepChannelOpen = messageListener(
      {
        type: "SOLVE_PROBLEM",
        payload: {
          slug: "two-sum",
          title: "Two Sum",
          difficulty: "Easy",
        },
      },
      {},
      resolve
    );

    assert.equal(keepChannelOpen, true);
  });

  assert.equal(response.success, true);
  assert.deepEqual(JSON.parse(JSON.stringify(response.data)), backendData);
  assert.equal(storage.result.slug, "two-sum");
  assert.equal(storage.pending, undefined);
  assert.equal(storage.error, undefined);
});

test("SOLVE_PROBLEM reports backend HTTP errors", async () => {
  const { storage, messageListener } = createHarness(async () => ({
    ok: false,
    status: 503,
    text: async () => "Service unavailable",
  }));

  const response = await new Promise((resolve) => {
    messageListener(
      {
        type: "SOLVE_PROBLEM",
        payload: {
          slug: "two-sum",
          title: "Two Sum",
          difficulty: "Easy",
        },
      },
      {},
      resolve
    );
  });

  assert.equal(response.success, false);
  assert.match(response.error, /Backend error 503/);
  assert.equal(storage.error.slug, "two-sum");
  assert.equal(storage.pending, undefined);
});

test("GET_STATE returns the current stored state", async () => {
  const { storage, messageListener } = createHarness(async () => {
    throw new Error("fetch should not be called");
  });

  storage.result = { slug: "two-sum" };
  storage.pending = { slug: "two-sum" };

  const state = await new Promise((resolve) => {
    const keepChannelOpen = messageListener(
      { type: "GET_STATE" },
      {},
      resolve
    );

    assert.equal(keepChannelOpen, true);
  });

  assert.equal(state.result.slug, "two-sum");
  assert.equal(state.pending.slug, "two-sum");
  assert.equal(state.error, undefined);
});
