'use client'

import { useEffect } from 'react'

/**
 * ThemeInitializer - Loads the user's saved theme preference before rendering
 * This prevents a flash of light theme when the page loads
 */
export function ThemeInitializer() {
  useEffect(() => {
    // Check localStorage for saved theme preference
    const storedDarkMode = localStorage.getItem('darkMode')

    // Determine if dark mode should be enabled
    // Default to light mode (false) on first visit, only use dark if explicitly saved
    const shouldBeDark = storedDarkMode === 'true'

    // Apply dark mode class immediately
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return null
}

/**
 * ThemeInitializerScript - Inline script that runs before React hydration
 * This is rendered as a script tag to prevent flash of wrong theme
 */
export function ThemeInitializerScript() {
  const themeScript = `
    (function() {
      try {
        const storedDarkMode = localStorage.getItem('darkMode');
        const shouldBeDark = storedDarkMode === 'true';

        if (shouldBeDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {}
    })();
  `

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  )
}
