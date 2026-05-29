import "./globals.css";

export const metadata = {
  title: "OneSpace",
  description: "Enterprise Knowledge Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
