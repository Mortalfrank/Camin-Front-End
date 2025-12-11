// src/pages/Cart.tsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartIcon from '../components/CartIcon';

export default function Cart() {
  const { items, total, updateQuantity, removeItem, clearCart, loading } = useCart();

  const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (error: any) {
      alert(error.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (cartItemId: number) => {
    if (window.confirm('Remove this item from cart?')) {
      try {
        await removeItem(cartItemId);
      } catch (error: any) {
        alert(error.message || 'Failed to remove item');
      }
    }
  };

  const handleClear = async () => {
    if (window.confirm('Clear all items from cart?')) {
      try {
        await clearCart();
      } catch (error: any) {
        alert(error.message || 'Failed to clear cart');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CartIcon size={32} />
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <Link to="/products" className="text-blue-600 hover:text-blue-800">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <CartIcon size={32} />
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>
        <button
          onClick={handleClear}
          className="text-red-600 hover:text-red-800"
        >
          Clear Cart
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 flex gap-4">
            <img
              src={item.product.mainImageUrl || 'https://via.placeholder.com/100'}
              alt={item.product.name}
              className="w-24 h-24 object-cover rounded"
            />
            <div className="flex-1">
              <Link to={`/products/${item.product.id}`}>
                <h3 className="font-semibold text-lg hover:text-blue-600">{item.product.name}</h3>
              </Link>
              <p className="text-gray-600">${item.product.price.toFixed(2)} each</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-600 hover:text-red-800 ml-4"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-lg">${item.subtotal.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-semibold">Total:</span>
          <span className="text-2xl font-bold">${total.toFixed(2)}</span>
        </div>
        <Link
          to="/checkout"
          className="block w-full bg-blue-600 text-white text-center py-3 rounded hover:bg-blue-700 transition-colors"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}

