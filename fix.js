(() => {
  const proto = MediaSession.prototype;
  const nativeHandler = proto.setActionHandler;
  const nativeState = Object.getOwnPropertyDescriptor(proto, "playbackState");
  const pageHandlers = {};

  const mainVideo = () =>
    document.querySelector("#movie_player video.html5-main-video") ?? document.querySelector("#movie_player video");

  const act = (action) => (details) => {
    const video = mainVideo();
    if (video) video[action]();
    else pageHandlers[action]?.(details);
  };

  const ours = { play: act("play"), pause: act("pause") };

  proto.setActionHandler = function (action, handler) {
    if (Object.hasOwn(ours, action)) {
      pageHandlers[action] = handler;
      handler = ours[action];
    }
    return nativeHandler.call(this, action, handler);
  };

  Object.defineProperty(proto, "playbackState", {
    ...nativeState,
    set(value) {
      const video = mainVideo();
      nativeState.set.call(this, video ? (video.paused ? "paused" : "playing") : value);
    }
  });

  const sync = () => {
    navigator.mediaSession.playbackState = "none";
  };

  for (const action of Object.keys(ours)) navigator.mediaSession.setActionHandler(action, null);
  for (const type of ["play", "pause", "playing", "emptied", "ended"]) document.addEventListener(type, sync, true);
  document.addEventListener("yt-navigate-finish", sync);
})();
