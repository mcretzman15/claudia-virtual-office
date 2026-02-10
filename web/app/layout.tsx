export const metadata = {
  title: "Claudia's Virtual Office",
  description: "Real-time project monitoring for Matt Cretzman",
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