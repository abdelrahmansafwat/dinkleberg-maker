export function toCaption(name: string): string {
  const trimmed = name.trim()
  if (trimmed.length === 0) throw new Error('empty name')
  return `${trimmed}berg`.toUpperCase() + '!!'
}
