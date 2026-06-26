export interface CaptionLayout {
  fontSize: number
  lines: string[]
}

export function layoutCaption(
  text: string,
  maxWidth: number,
  measure: (text: string, fontSize: number) => number,
  opts: { maxFontSize?: number; minFontSize?: number; maxLines?: number } = {}
): CaptionLayout {
  const maxFontSize = opts.maxFontSize ?? 64
  const minFontSize = opts.minFontSize ?? 20
  const maxLines = opts.maxLines ?? 2

  for (let size = maxFontSize; size >= minFontSize; size -= 2) {
    if (measure(text, size) <= maxWidth) {
      return { fontSize: size, lines: [text] }
    }
  }

  // Ensure minFontSize itself is tried even when the step skipped it.
  if (measure(text, minFontSize) <= maxWidth) {
    return { fontSize: minFontSize, lines: [text] }
  }

  // Could not fit on one line; greedily wrap at minFontSize.
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (current && measure(candidate, minFontSize) > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
    if (lines.length === maxLines - 1 && measure(current, minFontSize) > maxWidth) {
      // last allowed line is overflowing with a single long word; accept it
    }
  }
  if (current) lines.push(current)

  return { fontSize: minFontSize, lines: lines.slice(0, maxLines) }
}
