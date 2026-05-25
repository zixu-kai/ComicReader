declare module 'epubjs' {
  interface ePubInstance {
    ready: Promise<void>
    renderTo(element: HTMLElement, options?: Record<string, unknown>): Rendition
    locations: Locations
    loaded: { navigation: Promise<Navigation> }
    destroy(): void
  }

  interface ePubConstructor {
    (input: string | ArrayBuffer, options?: Record<string, unknown>): ePubInstance
    new (input: string | ArrayBuffer, options?: Record<string, unknown>): ePubInstance
  }

  const ePub: ePubConstructor
  export default ePub

  interface Rendition {
    display(target?: string): Promise<void>
    prev(): Promise<void>
    next(): Promise<void>
    themes: {
      default(styles: Record<string, Record<string, string>>): void
      register(name: string, styles: Record<string, Record<string, string>>): void
      select(name: string): void
    }
    on(event: string, callback: (...args: unknown[]) => void): void
    currentLocation(): { start: { cfi: string; label: string }; end: { cfi: string } }
    destroy(): void
  }

  interface Locations {
    generate(chars?: number): Promise<number>
    length(): number
    percentageFromCfi(cfi: string): number
    cfiFromLocation(loc: number): string
  }

  interface Navigation {
    toc: TocItem[]
  }

  interface TocItem {
    id: string
    href: string
    label: string
    subitems?: TocItem[]
  }
}
