export function imageBufferToDataUrl(buffer) {
  let mimeType = "image/jpeg";

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    mimeType = "image/png";
  } else if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46
  ) {
    mimeType = "image/gif";
  } else if (
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    mimeType = "image/webp";
  }

  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export function getImageSource(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const text = value.trim();

    if (/^(\/|https?:\/\/|data:)/.test(text)) {
      return text;
    }

    if (!/^[A-Za-z0-9+/=\r\n]+$/.test(text)) {
      return null;
    }

    return imageBufferToDataUrl(
      Buffer.from(text.replace(/\s/g, ""), "base64")
    );
  }

  const buffer = Buffer.isBuffer(value)
    ? value
    : Buffer.from(value);
  const text = buffer.toString("utf8");

  if (/^(\/|https?:\/\/|data:)/.test(text)) {
    return text;
  }

  return imageBufferToDataUrl(buffer);
}
