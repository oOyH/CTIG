declare module 'gifshot' {
  interface GifshotOptions {
    images: string[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numFrames?: number;
    frameDuration?: number;
    sampleInterval?: number;
    quality?: number;
  }

  interface GifshotResponse {
    error: boolean;
    errorCode?: string;
    errorMsg?: string;
    image?: string;
  }

  function createGIF(
    options: GifshotOptions,
    callback: (obj: GifshotResponse) => void
  ): void;

  export { createGIF, GifshotOptions, GifshotResponse };
} 