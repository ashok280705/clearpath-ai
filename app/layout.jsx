import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'ClearPath AI',
  description: 'Report air pollution hotspots and earn rewards',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
