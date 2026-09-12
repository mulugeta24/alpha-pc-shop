import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault(); // don't navigate when clicking the button
    if (product.stock === 0) return;
    try {
      await addToCart(product, 1);
      toast.success('Added to cart');
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const displayPrice = product.discountPrice || product.price;
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <Link
      to={`/products/${product._id}`}
      className="card overflow-hidden group flex flex-col hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 flex-shrink-0">
        {product.images?.length > 0 ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Badges */}
        {discount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            -{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-gray-800/80 text-white text-xs font-semibold px-2 py-1 rounded-md">
            Out of Stock
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm mb-3 line-clamp-2 flex-1">
          {product.name}
        </h3>

        {/* Price + Add to Cart */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="min-w-0">
            <p className="text-base font-bold text-primary-600 truncate">
              ETB {displayPrice.toLocaleString()}
            </p>
            {product.discountPrice && (
              <p className="text-xs text-gray-400 line-through">
                ETB {product.price.toLocaleString()}
              </p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            title={product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200
              ${product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : added
                  ? 'bg-green-500 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
          >
            {added ? (
              <><Check className="w-4 h-4" /><span className="hidden sm:inline">Added</span></>
            ) : (
              <><ShoppingCart className="w-4 h-4" /><span className="hidden sm:inline">Add</span></>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
