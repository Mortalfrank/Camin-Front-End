import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import CartIcon from '../components/CartIcon';
import { API_BASE_URL } from '../config/env';
import { getFallbackProductImage } from '../utils/productImages';
import { caminCatalogItems, getProductDisplay } from '../utils/productDisplay';
import './ProductList.css';

type Notice = {
  tone: 'success' | 'error';
  text: string;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [query, setQuery] = useState('');
  const { addToCart } = useCart();
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const displayProducts = products
      .slice(0, caminCatalogItems.length)
      .map((product, index) => getProductDisplay(product, index));
    const term = query.trim().toLowerCase();
    if (!term) return displayProducts;

    return displayProducts.filter((product) => {
      const content = [
        product.name,
        product.brand,
        product.model,
        product.series,
        product.texture,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return content.includes(term);
    });
  }, [products, query]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (!res.ok) {
        setNotice({ tone: 'error', text: 'Unable to load products.' });
        return;
      }

      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setNotice({ tone: 'error', text: 'Backend is not reachable.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (addingIds.has(product.id)) return;
    setAddingIds(prev => new Set(prev).add(product.id));

    try {
      await addToCart(product, 1);
      setNotice({ tone: 'success', text: `${product.name} added to cart.` });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add to cart.';
      setNotice({ tone: 'error', text: message });
    } finally {
      setAddingIds(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <div>
          <p>/COLLECTIONS</p>
          <h1>CAM_IN CAMERA SKINS</h1>
        </div>
        <label className="catalog-search">
          <span>SEARCH</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="MODEL / TEXTURE"
          />
        </label>
      </header>

      {notice && (
        <div className={`catalog-notice ${notice.tone}`} role="status">
          {notice.text}
        </div>
      )}

      {loading ? (
        <div className="catalog-state">LOADING PRODUCTS</div>
      ) : filteredProducts.length === 0 ? (
        <div className="catalog-state">NO PRODUCTS FOUND</div>
      ) : (
        <section className="catalog-grid" aria-label="Products">
          {filteredProducts.map((product, index) => (
            <article key={product.id} className="catalog-card">
              <Link to={`/products/${product.id}`} className="catalog-image-link">
                <div className="catalog-image-frame">
                  <img
                    src={product.mainImageUrl || getFallbackProductImage(product, index)}
                    alt={product.name}
                    onError={(event) => {
                      event.currentTarget.src = getFallbackProductImage(product, index);
                    }}
                  />
                </div>
              </Link>
              <div className="catalog-copy">
                <Link to={`/products/${product.id}`}>
                  <h2>{product.name}</h2>
                </Link>
                <p>{[product.brand, product.model].filter(Boolean).join(' ') || product.texture}</p>
                <div className="catalog-meta">
                  <span>${product.price.toFixed(2)}</span>
                  <span>{product.stock > 0 ? `${product.stock} IN STOCK` : 'OUT OF STOCK'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0 || addingIds.has(product.id)}
                  className="catalog-cart-button"
                >
                  <CartIcon size={16} />
                  <span>
                    {product.stock === 0 ? 'OUT OF STOCK' : addingIds.has(product.id) ? 'ADDING' : 'ADD TO CART'}
                  </span>
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
