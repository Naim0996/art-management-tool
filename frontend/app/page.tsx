import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-2">Art Management Tool</h1>
        <p className="text-gray-600">Welcome to our art gallery management system</p>
      </header>
      
      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/shop" className="block p-8 border rounded-lg hover:shadow-lg transition-shadow bg-white">
            <h2 className="text-2xl font-semibold mb-4">🛍️ Shop</h2>
            <p className="text-gray-600">Browse and purchase artwork from our collection</p>
          </Link>
          
          <Link href="/admin" className="block p-8 border rounded-lg hover:shadow-lg transition-shadow bg-white">
            <h2 className="text-2xl font-semibold mb-4">🔐 Admin</h2>
            <p className="text-gray-600">Manage products and inventory (requires login)</p>
          </Link>
        </div>
        
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Features</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Browse art products</li>
            <li>Add items to cart</li>
            <li>Multiple payment methods</li>
            <li>Admin dashboard for product management</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
