import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Poppins, Hind } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/auth-provider'
import { ToastProvider } from '@/components/providers/toaster-provider'
import { ConfettiProvider } from '@/components/providers'
import { ThemeInitializerScript } from '@/components/theme-initializer'

const clashDisplay = localFont({
  src: [
    {
      path: '../public/Fonts/ClashDisplay/Fonts/WEB/fonts/ClashDisplay-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-clash-display',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-poppins'
})

const hind = Hind({ 
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-hind'
})

export const metadata: Metadata = {
  title: 'KnightED',
  description: 'The Premium peer-to-peer tutoring platform for everyone',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeInitializerScript />
      </head>
      <body className={`${hind.className} ${clashDisplay.variable} ${poppins.variable} ${hind.variable}`}>
        <AuthProvider>
          <ConfettiProvider />
          <ToastProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
