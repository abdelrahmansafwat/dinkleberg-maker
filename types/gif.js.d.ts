declare module 'gif.js' {
  interface GIFOptions {
    workers?: number
    quality?: number
    workerScript?: string
    width?: number
    height?: number
    repeat?: number
  }
  interface AddFrameOptions { delay?: number; copy?: boolean }
  export default class GIF {
    constructor(options?: GIFOptions)
    addFrame(image: CanvasImageSource | CanvasRenderingContext2D, opts?: AddFrameOptions): void
    on(event: 'finished', cb: (blob: Blob) => void): void
    on(event: 'abort' | 'start', cb: () => void): void
    on(event: 'progress', cb: (p: number) => void): void
    on(event: 'error', cb: (err: unknown) => void): void
    render(): void
  }
}
