import { useEffect, useCallback } from 'react'

interface KeyboardActions {
  onNextPage?: () => void
  onPrevPage?: () => void
  onGoToStart?: () => void
  onGoToEnd?: () => void
  onToggleFullscreen?: () => void
  onToggleControls?: () => void
  onEscape?: () => void
  enabled?: boolean
}

export function useKeyboard(actions: KeyboardActions) {
  const {
    onNextPage,
    onPrevPage,
    onGoToStart,
    onGoToEnd,
    onToggleFullscreen,
    onToggleControls,
    onEscape,
    enabled = true,
  } = actions

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'd':
          e.preventDefault()
          onNextPage?.()
          break
        case 'ArrowLeft':
        case 'a':
          e.preventDefault()
          onPrevPage?.()
          break
        case ' ':
          e.preventDefault()
          onNextPage?.()
          break
        case 'Home':
          e.preventDefault()
          onGoToStart?.()
          break
        case 'End':
          e.preventDefault()
          onGoToEnd?.()
          break
        case 'f':
          e.preventDefault()
          onToggleFullscreen?.()
          break
        case 'm':
          e.preventDefault()
          onToggleControls?.()
          break
        case 'Escape':
          e.preventDefault()
          onEscape?.()
          break
      }
    },
    [enabled, onNextPage, onPrevPage, onGoToStart, onGoToEnd, onToggleFullscreen, onToggleControls, onEscape]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
