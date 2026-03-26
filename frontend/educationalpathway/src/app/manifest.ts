import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "አድማስ",
    short_name: "አድማስ",
    description: "Your journey to academic success starts here.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/admas.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/admas.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/admas.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
