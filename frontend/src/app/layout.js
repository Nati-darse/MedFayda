import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "MedFayda - Health Record Management System",
  description: "Secure health record access system integrated with Fayda ID for Ethiopia",
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
