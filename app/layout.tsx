import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "aLARM — Live Account Risk Manager",
  description: "Prop-firm style risk dashboard for your live MT5 account",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
