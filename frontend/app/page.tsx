import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-10 py-6 bg-white border-b">
        <div className="text-2xl font-bold text-blue-600">Cudobe</div>
        <div className="space-x-6">
          <Link href="/login" className="text-slate-600 hover:text-blue-600 font-medium">Login</Link>
          <Link href="/register" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 text-center px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
          The Future of <span className="text-blue-600">Safe Trades</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
          Cudobe connects your bank to a local blockchain escrow. We hold the funds securely until you confirm the deal is done.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Info Section */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-10 px-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h3 className="text-xl font-bold mb-3">Escrow Protected</h3>
          <p className="text-slate-500">Your money is locked in a smart contract. No one can touch it until the buyer approves.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h3 className="text-xl font-bold mb-3">Stripe Integration</h3>
          <p className="text-slate-500">Fund your wallet instantly using your credit card or bank account via our secure gateway.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h3 className="text-xl font-bold mb-3">Local Node Speed</h3>
          <p className="text-slate-500">Running on a local Ethereum node for zero-cost, lightning-fast test transactions.</p>
        </div>
      </section>
    </div>
  );
}