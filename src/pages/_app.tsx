import "@/styles/globals.css";
import "@meshsdk/react/styles.css";
import type { AppProps } from "next/app";
import { MeshProvider } from "@meshsdk/react";
import Layout from "@/components/layout";
import { ToastContainer } from "react-toastify";

function App({ Component, pageProps }: AppProps) {
  return (
    <MeshProvider>
      <Layout>
        <Component {...pageProps} />
        <ToastContainer />
      </Layout>
    </MeshProvider>
  );
}

export default App;
