
import Link from "next/link";

export default function Home() {



  return (
    <>
          {/* Hero Section */}
      
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Welcome to Art Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover unique artwork from talented artists around the world. Browse, shop, and manage your art collection with ease.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/shop"
              className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Start Shopping
            </Link>
            <Link
              href="/admin"
              className="bg-white text-purple-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-purple-600 hover:bg-purple-50 transition-colors"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Featured Artwork Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-64 bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <span className="text-8xl">🎭</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Abstract Art</h3>
              <p className="text-gray-600">Explore modern abstract masterpieces</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-64 bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
              <span className="text-8xl">🖼️</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Classic Paintings</h3>
              <p className="text-gray-600">Timeless artwork from renowned artists</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-64 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <span className="text-8xl">🎨</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Digital Art</h3>
              <p className="text-gray-600">Contemporary digital creations</p>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link href="/shop" className="block p-8 border-2 border-purple-200 rounded-lg hover:shadow-xl transition-shadow bg-white hover:border-purple-400">
            <div className="text-5xl mb-4">🛍️</div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Shop</h2>
            <p className="text-gray-600">Browse and purchase artwork from our collection</p>
          </Link>

          <Link href="/cart" className="block p-8 border-2 border-purple-200 rounded-lg hover:shadow-xl transition-shadow bg-white hover:border-purple-400">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Shopping Cart</h2>
            <p className="text-gray-600">View and manage items in your cart</p>
          </Link>

          <Link href="/checkout" className="block p-8 border-2 border-purple-200 rounded-lg hover:shadow-xl transition-shadow bg-white hover:border-purple-400">
            <div className="text-5xl mb-4">💳</div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Checkout</h2>
            <p className="text-gray-600">Complete your purchase securely</p>
          </Link>

          <Link href="/admin" className="block p-8 border-2 border-purple-200 rounded-lg hover:shadow-xl transition-shadow bg-white hover:border-purple-400">
            <div className="text-5xl mb-4">🔐</div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Admin</h2>
            <p className="text-gray-600">Manage products and inventory (requires login)</p>
          </Link>

          <Link href="/primereact-demo" className="block p-8 border-2 border-purple-200 rounded-lg hover:shadow-xl transition-shadow bg-white hover:border-purple-400">
            <div className="text-5xl mb-4">⚙️</div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">PrimeReact Demo</h2>
            <p className="text-gray-600">Explore PrimeReact components and themes</p>
          </Link>

          <Link href="/admin/login" className="block p-8 border-2 border-purple-200 rounded-lg hover:shadow-xl transition-shadow bg-white hover:border-purple-400">
            <div className="text-5xl mb-4">🔑</div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Admin Login</h2>
            <p className="text-gray-600">Sign in to access admin features</p>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-16 p-8 bg-white rounded-lg shadow-lg">
          <h3 className="text-3xl font-bold mb-6 text-center text-gray-900">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✨</span>
              <div>
                <h4 className="font-semibold text-lg mb-1">Browse Art Products</h4>
                <p className="text-gray-600">Explore a curated collection of unique artwork</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🛒</span>
              <div>
                <h4 className="font-semibold text-lg mb-1">Easy Shopping Cart</h4>
                <p className="text-gray-600">Add items to cart and manage your purchases</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💳</span>
              <div>
                <h4 className="font-semibold text-lg mb-1">Multiple Payment Methods</h4>
                <p className="text-gray-600">Pay with credit card, PayPal, or Stripe</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-semibold text-lg mb-1">Admin Dashboard</h4>
                <p className="text-gray-600">Manage products and inventory efficiently</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎨</span>
              <div>
                <h4 className="font-semibold text-lg mb-1">PrimeReact UI</h4>
                <p className="text-gray-600">Beautiful components with modern themes</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h4 className="font-semibold text-lg mb-1">Secure Authentication</h4>
                <p className="text-gray-600">Protected admin area with secure login</p>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}