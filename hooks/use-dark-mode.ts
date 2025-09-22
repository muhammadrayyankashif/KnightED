import { useState, useEffect } from 'react'

export function useDarkMode() {
  // Initialize to false (light mode) - will be corrected in useEffect after hydration
  const [isDark, setIsDark] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // This effect runs only on the client after hydration is complete
    const storedDarkMode = localStorage.getItem('darkMode')
    const shouldBeDark = storedDarkMode === 'true'

    setIsDark(shouldBeDark)
    setIsMounted(true)

    // Apply the theme to the document
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newValue = !isDark
    setIsDark(newValue)
    localStorage.setItem('darkMode', String(newValue))

    if (newValue) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return { isDark, toggleDarkMode, isMounted }
}
