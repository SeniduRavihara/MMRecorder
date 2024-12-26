export const selectSource = async (source: { id: string; name: string }) => {
  if (!source?.id || !source?.name) {
    throw new Error("Invalid source provided.");
  }

  const constraints = {
    audio: false,
    video: {
      chromeMediaSource: "desktop",
      chromeMediaSourceId: source.id,
    },
  };

  // Type cast the constraints to `any` to bypass the type-checking issue
  return await navigator.mediaDevices.getUserMedia(constraints as any);
};
