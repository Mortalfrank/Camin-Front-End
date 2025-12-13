// src/pages/ProductDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import CartIcon from '../components/CartIcon';
import { API_BASE_URL } from '../config/env';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id]);

  const fetchProduct = async (productId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (res.ok) {
        const products: Product[] = await res.json();
        const found = products.find(p => p.id === productId);
        setProduct(found || null);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product, quantity);
      alert('Product added to cart successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add to cart';
      alert(errorMessage);
      console.error('Add to cart error:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!product) {
    return <div className="p-8 text-center">Product not found</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Back
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {product.mainImageUrl ? (
            <img
              src={product.mainImageUrl}
              alt={product.name}
              className="w-full rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/500?text=' + encodeURIComponent(product.name);
              }}
            />
          ) : (
            <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No Image Available</p>
              </div>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="space-y-2 mb-6">
            {product.brand && <p><span className="font-semibold">Brand:</span> {product.brand}</p>}
            {product.model && <p><span className="font-semibold">Model:</span> {product.model}</p>}
            {product.series && <p><span className="font-semibold">Series:</span> {product.series}</p>}
            <p><span className="font-semibold">Texture:</span> {product.texture}</p>
            <p><span className="font-semibold">Stock:</span> {product.stock}</p>
          </div>
          {product.description && (
            <p className="text-gray-700 mb-6">{product.description}</p>
          )}
          <div className="mb-6">
            <p className="text-4xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <label className="font-semibold">Quantity:</label>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
              className="border rounded px-3 py-2 w-20"
            />
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full !bg-white !text-black py-3 rounded border !border-black hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-semibold"
            style={{ color: '#000', backgroundColor: '#fff' }}
          >
            {product.stock === 0 ? (
              'Out of Stock'
            ) : (
              <>
                <CartIcon size={20} className="text-black" />
                <span className="text-black">Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
