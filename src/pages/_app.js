// pages/_app.js
import 'tailwindcss/tailwind.css';  // Import Tailwind CSS first
import Navbar from '@/components/Navbar';  // Then import your Navbar component

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
