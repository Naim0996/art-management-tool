'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartItem {
  product_id: string;
  quantity: number;
}

interface Cart {
  id: string;
  items: CartItem[];
}

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCart();
    fetchProducts();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/cart');
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products');
      const data = await response.json();
      const productsMap: Record<string, Product> = {};
      data.forEach((product: Product) => {
        productsMap[product.id] = product;
      });
      setProducts(productsMap);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await fetch(`http://localhost:8080/api/cart/${productId}`, {
        method: 'DELETE',
      });
      fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => {
      const product = products[item.product_id];
      if (product) {
        return total + product.price * item.quantity;
      }
      return total;
    }, 0);
  };

  const proceedToCheckout = () => {
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <header className="max-w-4xl mx-auto mb-8">
        <Link href="/shop" className="text-blue-600 hover:underline mb-2 block">
          ← Continue Shopping
        </Link>
        <h1 className="text-4xl font-bold">Shopping Cart</h1>
      </header>

      <main className="max-w-4xl mx-auto">
        {cart && cart.items.length > 0 ? (
          <>
            <div className="space-y-4 mb-8">
              {cart.items.map((item) => {
                const product = products[item.product_id];
                if (!product) return null;
                
                return (
                  <div key={item.product_id} className="border rounded-lg p-6 bg-white flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{product.name}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-lg font-bold mt-2">
                        ${(product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-2xl font-bold">Total:</span>
                <span className="text-3xl font-bold">${calculateTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={proceedToCheckout}
                className="w-full bg-green-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-green-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-600 text-xl mb-4">Your cart is empty</p>
            <Link
              href="/shop"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
