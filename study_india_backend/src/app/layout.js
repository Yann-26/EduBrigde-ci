// Replace the entire file with this:
export const metadata = {
  title: 'Study India API',
  description: 'Backend API for Study India Application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}