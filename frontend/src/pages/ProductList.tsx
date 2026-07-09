// src/pages/ProductList.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import CartIcon from '../components/CartIcon';
import { API_BASE_URL } from '../config/env';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());
  const [messages, setMessages] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (addingIds.has(product.id)) return;
    setAddingIds(prev => new Set(prev).add(product.id));
    try {
      await addToCart(product, 1);
      setMessages(prev => ({ ...prev, [product.id]: 'Added!' }));
      setTimeout(() => setMessages(prev => { const n = { ...prev }; delete n[product.id]; return n; }), 2000);
    } catch (error: any) {
      setMessages(prev => ({ ...prev, [product.id]: error.message || 'Failed' }));
    } finally {
      setAddingIds(prev => { const n = new Set(prev); n.delete(product.id); return n; });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <Link to={`/products/${product.id}`}>
              <div className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden">
                {product.mainImageUrl ? (
                  <img
                    src={product.mainImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/300?text=' + encodeURIComponent(product.name);
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-center p-4">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">No Image</p>
                  </div>
                )}
              </div>
            </Link>
            <div className="p-4">
              <Link to={`/products/${product.id}`}>
                <h3 className="font-semibold text-lg mb-2 hover:text-blue-600">{product.name}</h3>
              </Link>
              <p className="text-gray-600 text-sm mb-2">{product.brand} {product.model}</p>
              <p className="text-2xl font-bold text-blue-600 mb-4">${product.price.toFixed(2)}</p>
              <button
                onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                disabled={addingIds.has(product.id)}
                className="w-full !bg-white !text-black py-2 rounded border !border-black hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-semibold"
                style={{ color: '#000', backgroundColor: '#fff' }}
              >
                <CartIcon size={18} className="text-black" />
                <span className="text-black">{addingIds.has(product.id) ? 'Adding...' : 'Add to Cart'}</span>
              </button>
              {messages[product.id] && (
                <p className="text-xs text-center mt-1 text-green-600">{messages[product.id]}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
