import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import CartIcon from '../components/CartIcon';
import { API_BASE_URL } from '../config/env';
import { getFallbackProductImage } from '../utils/productImages';
import { getProductDisplay } from '../utils/productDisplay';
import './ProductDetail.css';

type Notice = {
  tone: 'success' | 'error';
  text: string;
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct(Number(id));
    }
  }, [id]);

  const fetchProduct = async (productId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (!res.ok) {
        setProduct(null);
        return;
      }

      const products: Product[] = await res.json();
      setProduct(products.find((item) => item.id === productId) || null);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || addingToCart) return;
    setAddingToCart(true);

    try {
      await addToCart(getProductDisplay(product), quantity);
      setNotice({ tone: 'success', text: `${quantity} added to cart.` });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add to cart.';
      setNotice({ tone: 'error', text: message });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <div className="product-state">LOADING PRODUCT</div>;
  }

  if (!product) {
    return (
      <div className="product-state">
        PRODUCT NOT FOUND
        <Link to="/products">BACK TO COLLECTIONS</Link>
      </div>
    );
  }

  const displayProduct = getProductDisplay(product);
  const details = [
    ['MODEL', displayProduct.model],
    ['BRAND', displayProduct.brand],
    ['SERIES', displayProduct.series],
    ['TEXTURE', displayProduct.texture],
    ['STOCK', product.stock > 0 ? `${product.stock}` : 'OUT'],
  ].filter(([, value]) => Boolean(value));

  return (
    <article className="product-page">
      <button type="button" onClick={() => navigate(-1)} className="product-back">
        BACK
      </button>

      {notice && (
        <div className={`product-notice ${notice.tone}`} role="status">
          {notice.text}
        </div>
      )}

      <div className="product-layout">
        <section className="product-media">
          <div className="product-image-frame">
            <img
              src={displayProduct.mainImageUrl || getFallbackProductImage(product)}
              alt={displayProduct.name}
              onError={(event) => {
                event.currentTarget.src = getFallbackProductImage(product);
              }}
            />
          </div>
        </section>

        <section className="product-info">
          <p>/PRODUCT VIEW</p>
          <h1>{displayProduct.name}</h1>
          <div className="product-price">${product.price.toFixed(2)}</div>

          <dl className="product-details">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          {displayProduct.description && (
            <p className="product-description">{displayProduct.description}</p>
          )}

          <div className="product-actions">
            <label>
              QTY
              <input
                type="number"
                min="1"
                max={Math.max(product.stock, 1)}
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    Math.max(1, Math.min(product.stock, Number(event.target.value) || 1)),
                  )
                }
              />
            </label>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className="product-cart-button"
            >
              <CartIcon size={17} />
              <span>
                {product.stock === 0 ? 'OUT OF STOCK' : addingToCart ? 'ADDING' : 'ADD TO CART'}
              </span>
            </button>
          </div>
        </section>
      </div>
    </article>
  );
}
