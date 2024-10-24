import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white text-center flex justify-center items-center">
      <div>
        <h1 className="mb-1 text-4xl font-bold">WELCOME TO </h1>
        <h1 className="mb-8 text-4xl font-bold">WEB3 MARKET PLACE</h1>

        <Link
          href="/marketplace"
          target="_blank"
          className="flex justify-center items-center"
        >
          <div className="bg-slate-700 hover:bg-slate-500 hover:font-bold w-64 py-2 border border-white rounded-xl mb-6">
            MARKETPLACE
          </div>
        </Link>

        <Link
          href="/merchant"
          target="_blank"
          className="flex justify-center items-center"
        >
          <div className="bg-slate-700 hover:bg-slate-500 hover:font-bold w-64 py-2 border border-white rounded-xl">
            MERCHANT
          </div>
        </Link>
      </div>
    </div>
  );
}
