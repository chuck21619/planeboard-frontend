import { useState, useEffect } from "react";

const imageCache = {};

export function useSharedImage(url) {
  const [image, setImage] = useState(imageCache[url] || null);

  useEffect(() => {
    if (!url) return;
    if (imageCache[url]) {
      setImage(imageCache[url]);
      return;
    }
    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      imageCache[url] = img;
      setImage(img);
    };
  }, [url]);

  return image;
}
