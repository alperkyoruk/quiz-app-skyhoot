// pages/_app.js
import 'tailwindcss/tailwind.css';  // Import Tailwind CSS first

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
