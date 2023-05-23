import test from "ava";
import * as s from "../../server.js";

const {
  securePath,
  guessMimeType
} = s.exportForTesting;

// STATIC: Testing against predefined inputs to check the return value.

test("securePath tests (STATIC)", t => {
    let testOne = "/worker/html/index.html"; // First test case
    let testSecureOne = securePath(testOne);
    t.not(testOne, testSecureOne); // securePath did something.
    t.is(testSecureOne, "worker\\html\\index.html") // The expected result is also the received result.

    let testTwo = "/../../worker/html/index.html"; // Second test case
    let testSecureTwo = securePath(testTwo);
    t.not(testTwo, testSecureTwo); // Once again, it did something.
    t.is(testSecureTwo, "worker\\html\\index.html"); // Expected to handle the extra chars and return the same as case 1.
});

test("guessMimeType tests (STATIC)", t => {
    let testOne = "example.json";
    let mimeTypeOne = guessMimeType(testOne);
    t.assert(mimeTypeOne === "application/json"); // Asserting the MIME type is as expected.
    
    let testTwo = "example.example";
    let mimeTypeTwo = guessMimeType(testTwo);
    t.assert(mimeTypeTwo === "text/plain"); // Not recognised MIME type, so, should return plain text.

    // Random tests, should all have the same result ("text/plain").
    let arbitraryInputs = [
        666,
        "666",
        undefined,
        null,
        [],
        0,
        "..json"
    ];
    
    for (const input in arbitraryInputs) {
        t.is(guessMimeType(input), "text/plain");
    }

});