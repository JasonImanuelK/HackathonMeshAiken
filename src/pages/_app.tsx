import "@/styles/globals.css";
import "@meshsdk/react/styles.css";
import type { AppProps } from "next/app";
import { MeshProvider } from "@meshsdk/react";
import Layout from "@/components/layout";

function App({ Component, pageProps }: AppProps) {
  return (
    <MeshProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </MeshProvider>
  );
}

export default App;
