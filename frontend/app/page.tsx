"use client";
import Link from "next/link";
import Image from "next/image";

import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { MegaMenu } from "primereact/megamenu";
import { Ripple } from "primereact/ripple";
import { useRouter } from "next/navigation";


export default function Home() {
  const navRouter = useRouter();

  const itemRenderer = (item: any, options: any) => {
    if (item.root) {
      return (
        <a className="flex align-items-center cursor-pointer px-3 py-2 overflow-hidden relative font-semibold text-lg uppercase p-ripple hover:surface-ground" style={{ borderRadius: '2rem' }} onClick={() => options.onClick && options.onClick()} >
          <span className={item.icon} />
          <span className="ml-2">{item.label}</span>
          <Ripple />
        </a>
      );
    } else if (!item.image) {
      return (
        <a className="flex align-items-center p-3 cursor-pointer mb-2 gap-2 " onClick={() => options.onClick && options.onClick()}>
          <span className="inline-flex align-items-center justify-content-center border-circle bg-primary w-3rem h-3rem">
            <i className={`${item.icon} text-lg`}></i>
          </span>
          <span className="inline-flex flex-column gap-1">
            <span className="font-medium text-lg text-900">{item.label}</span>
            <span className="white-space-nowrap">{item.subtext}</span>
          </span>
        </a>
      );
    } else {
      return (
        <div className="flex flex-column align-items-start gap-3" onClick={() => options.onClick && options.onClick()}>
          <img alt="megamenu-demo" src={item.image} className="w-full" />
          <span>{item.subtext}</span>
          <Button className="p-button p-component p-button-outlined" label={item.label} />
        </div>
      );
    }
  };
  const items = [
    {
      label: 'Home',
      root: true,
      template: itemRenderer,
      command: () => {
        navRouter.push('/');
      }
    },
    {
      label: '🎨 Art Gallery',
      root: true,
      template: itemRenderer,
      items: [
        [
          {
            items: [
              {
                label: 'Fumetti', icon: 'pi pi-list', template: itemRenderer, command: () => {
                  navRouter.push('/fumetti');
                },
              },
              {
                label: 'Personaggi', icon: 'pi pi-users', template: itemRenderer, command: () => {
                  navRouter.push('/personaggi');
                },
              }
            ]
          }
        ]
      ]
    },
    {
      label: 'Contact',
      root: true,
      template: itemRenderer
    }
  ];

  const end = <Avatar image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png" shape="circle" />;

  const start = <Image src="/logo.jpeg" alt="Logo" width={75} height={25} />;






  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Navigation Bar */}
      <div className="card">
        <MegaMenu model={items} orientation="horizontal" start={start} end={end} breakpoint="960px" className="p-3 surface-0 shadow-2" style={{ borderRadius: '3rem' }} />
      </div>





      {/* <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-purple-600">
                🎨 Art Gallery
              </Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/shop" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Shop
              </Link>
              <Link href="/cart" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Cart
              </Link>
              <Link href="/checkout" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Checkout
              </Link>
              <Link href="/admin" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Admin
              </Link>
              <Link href="/primereact-demo" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Demo
              </Link>
            </div>
          </div>
        </div>
      </nav> */}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 Art Management Tool. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}