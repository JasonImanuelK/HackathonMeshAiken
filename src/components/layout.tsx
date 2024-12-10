import { CardanoWallet, useWallet } from "@meshsdk/react";
import Link from "next/link";

const layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 p-4">
        <nav className="container mx-auto">
          <ul className="flex items-center justify-between">
            <li>
              <Link href="/" className="text-white hover:text-gray-400 px-4 py-2 transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/marketplace" className="text-white hover:text-gray-400 px-4 py-2 transition">
                Marketplace
              </Link>
            </li>
            <li>
              <Link href="/merchant" className="text-white hover:text-gray-400 px-4 py-2 transition">
                Merchant
              </Link>
            </li>
            <li>
              <Link href="/history" className="text-white hover:text-gray-400 px-4 py-2 transition">
                Tx History
              </Link>
            </li>
            <li>
              <CardanoWallet />
            </li>
          </ul>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4">{children}</main>
      <footer className="bg-gray-800 p-4 mt-auto">
        <div className="container mx-auto text-center">
          <p className="text-gray-400">© 2024 My Website</p>
        </div>
      </footer>
    </div>
  );
};

export default layout;
