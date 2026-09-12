import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Plus, Minus, Truck, Shield, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const addToCartHandler = async () => {
    try {
      await addToCart(product, quantity);
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Product not found</p>
      </div>
    );
  }

  const specs = product.specifications || {};

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          </div>

          <div className="flex items-baseline space-x-4">
            {product.discountPrice ? (
              <>
                <span className="text-4xl font-bold text-primary-600">
                  ETB {product.discountPrice.toLocaleString()}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ETB {product.price.toLocaleString()}
                </span>
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                  Save {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-4xl font-bold text-primary-600">
                ETB {product.price.toLocaleString()}
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Stock */}
          <div className={`flex items-center space-x-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <span className="font-semibold">
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity */}
          <div className="flex items-center space-x-4">
            <span className="font-medium">Quantity:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                disabled={quantity >= product.stock}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={addToCartHandler}
              disabled={product.stock === 0}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex items-center space-x-3">
              <Truck className="w-6 h-6 text-primary-600" />
              <div>
                <p className="font-medium text-sm">Fast Delivery</p>
                <p className="text-xs text-gray-500">Delivered across Ethiopia</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-primary-600" />
              <div>
                <p className="font-medium text-sm">Warranty</p>
                <p className="text-xs text-gray-500">1 Year Warranty</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="w-6 h-6 text-primary-600" />
              <div>
                <p className="font-medium text-sm">Easy Returns</p>
                <p className="text-xs text-gray-500">30 Day Returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-6">Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between py-3 border-b">
            <span className="text-gray-600">Processor</span>
            <span className="font-medium">{specs.processor || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-3 border-b">
            <span className="text-gray-600">RAM</span>
            <span className="font-medium">{specs.ram || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-3 border-b">
            <span className="text-gray-600">Storage</span>
            <span className="font-medium">{specs.storage || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-3 border-b">
            <span className="text-gray-600">Graphics</span>
            <span className="font-medium">{specs.graphics || 'N/A'}</span>
          </div>
          {specs.display && (
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Display</span>
              <span className="font-medium">{specs.display}</span>
            </div>
          )}
          {specs.weight && (
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Weight</span>
              <span className="font-medium">{specs.weight}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-b">
            <span className="text-gray-600">Operating System</span>
            <span className="font-medium">{specs.operatingSystem || 'N/A'}</span>
          </div>
          {specs.ports && specs.ports.length > 0 && (
            <div className="col-span-1 md:col-span-2 py-3 border-b">
              <span className="text-gray-600 block mb-2">Ports</span>
              <div className="flex flex-wrap gap-2">
                {specs.ports.map((port, index) => (
                  <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {port}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
