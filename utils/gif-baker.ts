import { layoutCaption } from './layout'

export async function bakeGif(
  sourceBytes: ArrayBuffer,
  caption: string,
  opts: { workerScript?: string; fontFamily?: string } = {}
): Promise<Blob> {
  const workerScript = opts.workerScript ?? '/vendor/gif.worker.js'
  const fontFamily = opts.fontFamily ?? 'Anton'

  const { parseGIF, decompressFrames } = await import('gifuct-js')
  const GIF = (await import('gif.js')).default

  // Make sure the web font is ready before measuring/drawing.
  if (typeof document !== 'undefined' && (document as any).fonts?.load) {
    await (document as any).fonts.load(`64px ${fontFamily}`)
  }

  const gif = parseGIF(sourceBytes)
  const frames = decompressFrames(gif, true) // build full RGBA patches
  if (frames.length === 0) throw new Error('source GIF has no frames')

  const width = gif.lsd.width
  const height = gif.lsd.height

  // Canvas that accumulates frames (handles partial-frame coalescing).
  const stage = document.createElement('canvas')
  stage.width = width
  stage.height = height
  const sctx = stage.getContext('2d')!

  const encoder = new GIF({
    workers: 2,
    quality: 10,
    workerScript,
    width,
    height,
    repeat: 0, // loop forever
  })

  // Reusable buffer for each frame's pixel patch.
  for (const frame of frames) {
    const patch = new ImageData(
      new Uint8ClampedArray(frame.patch),
      frame.dims.width,
      frame.dims.height
    )
    // Draw the patch at its offset onto the accumulating stage.
    const tmp = document.createElement('canvas')
    tmp.width = frame.dims.width
    tmp.height = frame.dims.height
    tmp.getContext('2d')!.putImageData(patch, 0, 0)
    sctx.drawImage(tmp, frame.dims.left, frame.dims.top)

    // Compose this frame + caption onto an output canvas (so the caption
    // is redrawn cleanly each frame and never accumulates).
    const out = document.createElement('canvas')
    out.width = width
    out.height = height
    const octx = out.getContext('2d')!
    octx.drawImage(stage, 0, 0)
    drawCaption(octx, caption, width, height, fontFamily)

    encoder.addFrame(octx, { delay: frame.delay || 100, copy: true })
  }

  return await new Promise<Blob>((resolve, reject) => {
    encoder.on('finished', (blob: Blob) => resolve(blob))
    try {
      encoder.render()
    } catch (err) {
      reject(err)
    }
  })
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  fontFamily: string
): void {
  const margin = Math.round(width * 0.06)
  const maxWidth = width - margin * 2
  const measure = (t: string, size: number) => {
    ctx.font = `${size}px ${fontFamily}`
    return ctx.measureText(t).width
  }
  const { fontSize, lines } = layoutCaption(text, maxWidth, measure, {
    maxFontSize: Math.round(height * 0.18),
    minFontSize: Math.round(height * 0.06),
    maxLines: 2,
  })

  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.12))
  ctx.strokeStyle = 'black'
  ctx.fillStyle = 'white'

  const lineHeight = fontSize * 1.1
  const bottom = height - margin
  // Stack lines upward from the bottom margin.
  lines.forEach((line, i) => {
    const y = bottom - (lines.length - 1 - i) * lineHeight
    const x = width / 2
    ctx.strokeText(line, x, y)
    ctx.fillText(line, x, y)
  })
}
