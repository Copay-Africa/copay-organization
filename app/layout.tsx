import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Copay Organization",
  description: "Modern cooperative payment management system",
  keywords: ["cooperative", "payment", "management", "finance", "organization"],
  authors: [{ name: "Copay Team" }],
  creator: "Copay Organization",
  publisher: "Copay Organization",
  robots: {
    index: false, // Don't index in search engines for security
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  // Security headers
  other: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
};

// Viewport configuration (separated as per Next.js 16 requirements)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [{
    media: '(prefers-color-scheme: light)',
    color: '#ffffff'
  }, {
    media: '(prefers-color-scheme: dark)',
    color: '#1E2329'
  }]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional security headers */}
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta name="format-detection" content="telephone=no" />

        {/* Content Security Policy */}
        <meta
          httpEquiv="Content-Security-Policy"
          content={`
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval';
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            font-src 'self' https://fonts.gstatic.com;
            img-src 'self' data: https:;
            connect-src 'self' https:;
            frame-ancestors 'none';
            form-action 'self';
            upgrade-insecure-requests;
          `.replace(/\s+/g, ' ').trim()}
        />
      </head>
      <body
        className={`${inter.variable} font-inter antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
