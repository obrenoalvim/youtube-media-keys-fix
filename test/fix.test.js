const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "fix.js"), "utf8");

function load(video) {
  const registered = {};
  const states = [];
  const listeners = {};

  class MediaSession {
    setActionHandler(action, handler) {
      registered[action] = handler;
    }
    get playbackState() {
      return states.at(-1);
    }
    set playbackState(value) {
      states.push(value);
    }
  }

  const session = new MediaSession();
  const document = {
    querySelector: () => video,
    addEventListener: (type, listener) => {
      listeners[type] = listener;
    }
  };

  vm.runInNewContext(source, { MediaSession, navigator: { mediaSession: session }, document });
  return { session, registered, states, listeners };
}

function player(paused) {
  const calls = [];
  return { paused, calls, play: () => calls.push("play"), pause: () => calls.push("pause") };
}

test("play and pause act on the main player, not on the handler the page registered", () => {
  const video = player(false);
  const { session, registered } = load(video);
  const page = [];
  session.setActionHandler("pause", () => page.push("pause"));

  registered.pause();

  assert.deepStrictEqual(video.calls, ["pause"]);
  assert.deepStrictEqual(page, []);
});

test("falls back to the page handler when there is no main player", () => {
  const { session, registered } = load(null);
  const page = [];
  session.setActionHandler("play", (details) => page.push(details));

  registered.play({ action: "play" });

  assert.deepStrictEqual(page, [{ action: "play" }]);
});

test("playback state follows the main player, not what the page says", () => {
  const video = player(false);
  const { session, states, listeners } = load(video);

  session.playbackState = "paused";
  assert.strictEqual(states.at(-1), "playing");

  video.paused = true;
  listeners.pause();
  assert.strictEqual(states.at(-1), "paused");
});

test("other actions keep the handler the page registered", () => {
  const { session, registered } = load(player(false));
  const next = () => {};

  session.setActionHandler("nexttrack", next);

  assert.strictEqual(registered.nexttrack, next);
});
