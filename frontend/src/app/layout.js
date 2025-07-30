import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "MedFayda - Health Record Management System",
  description: "Secure health record access system integrated with Fayda ID for Ethiopia",
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/medical-heart-icon.svg',
        type: 'image/svg+xml',
        sizes: '32x32',
      }
    ],
    apple: [
      {
        url: '/medical-heart-icon.svg',
        type: 'image/svg+xml',
        sizes: '180x180',
      }
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
