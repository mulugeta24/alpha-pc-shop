import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Save, X, Upload, Trash2, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState([]); // images already on the product
  const [newImageFiles, setNewImageFiles] = useState([]);   // File objects selected by user
  const [newImagePreviews, setNewImagePreviews] = useState([]); // preview URLs

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'gaming-pc',
    price: '',
    discountPrice: '',
    stock: '',
    isFeatured: false,
    isNewArrival: false,
    specifications: {
      processor: '',
      ram: '',
      storage: '',
      graphics: '',
      display: '',
      operatingSystem: 'Windows 11',
      weight: '',
      dimensions: '',
      ports: [],
      features: []
    }
  });

  useEffect(() => {
    if (isEdit) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const product = response.data.data.product;
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        discountPrice: product.discountPrice || '',
        stock: product.stock,
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        specifications: {
          processor: product.specifications?.processor || '',
          ram: product.specifications?.ram || '',
          storage: product.specifications?.storage || '',
          graphics: product.specifications?.graphics || '',
          display: product.specifications?.display || '',
          operatingSystem: product.specifications?.operatingSystem || 'Windows 11',
          weight: product.specifications?.weight || '',
          dimensions: product.specifications?.dimensions || '',
          ports: product.specifications?.ports || [],
          features: product.specifications?.features || []
        }
      });
      setExistingImages(product.images || []);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSpecChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [field]: value }
    }));
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value.split(',').map(item => item.trim()).filter(item => item)
      }
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + newImageFiles.length + files.length;
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
        toast.error(`${file.name} is not a valid image (JPG, PNG, WEBP only)`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    setNewImageFiles(prev => [...prev, ...validFiles]);
    const previews = validFiles.map(f => URL.createObjectURL(f));
    setNewImagePreviews(prev => [...prev, ...previews]);

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build multipart form data to support file uploads
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('price', parseFloat(formData.price));
      if (formData.discountPrice) data.append('discountPrice', parseFloat(formData.discountPrice));
      data.append('stock', parseInt(formData.stock));
      data.append('isFeatured', formData.isFeatured);
      data.append('isNewArrival', formData.isNewArrival);
      data.append('specifications', JSON.stringify(formData.specifications));

      // Attach new image files
      newImageFiles.forEach(file => {
        data.append('images', file);
      });

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (isEdit) {
        await api.put(`/products/${id}`, data, config);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', data, config);
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const totalImages = existingImages.length + newImagePreviews.length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update product information' : 'Create a new product listing'}
          </p>
        </div>
        <button onClick={() => navigate('/products')} className="btn-outline flex items-center space-x-2">
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input type="text" name="name" required className="input-field" value={formData.name} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea name="description" required rows="4" className="input-field" value={formData.description} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select name="category" required className="input-field" value={formData.category} onChange={handleChange}>
                <option value="gaming-pc">Gaming PC</option>
                <option value="laptop">Laptop</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (ETB)</label>
              <input type="number" name="price" required min="0" step="0.01" className="input-field" value={formData.price} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price (ETB)</label>
              <input type="number" name="discountPrice" min="0" step="0.01" className="input-field" value={formData.discountPrice} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <input type="number" name="stock" required min="0" className="input-field" value={formData.stock} onChange={handleChange} />
            </div>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="rounded w-4 h-4" />
                <span className="text-sm font-medium">Featured Product</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} className="rounded w-4 h-4" />
                <span className="text-sm font-medium">New Arrival</span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Product Images</h2>
          <p className="text-sm text-gray-500 mb-4">Upload up to 5 images (JPG, PNG, WEBP — max 5MB each)</p>

          {/* Existing images (edit mode) */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Current Images</p>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img, i) => (
                  <div key={img.public_id || i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={img.url} alt={img.alt || 'Product'} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New image previews */}
          {newImagePreviews.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">New Images to Upload</p>
              <div className="flex flex-wrap gap-3">
                {newImagePreviews.map((preview, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-blue-200 group">
                    <img src={preview} alt={`New ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload button */}
          {totalImages < 5 && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors w-full justify-center"
              >
                <ImagePlus className="w-5 h-5" />
                <span>Click to select images ({totalImages}/5 uploaded)</span>
              </button>
            </div>
          )}

          {totalImages === 5 && (
            <p className="text-sm text-amber-600 font-medium">Maximum 5 images reached. Remove one to add more.</p>
          )}
        </div>

        {/* Specifications */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Processor</label>
              <input type="text" required className="input-field" value={formData.specifications.processor} onChange={(e) => handleSpecChange('processor', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">RAM</label>
              <input type="text" required className="input-field" value={formData.specifications.ram} onChange={(e) => handleSpecChange('ram', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Storage</label>
              <input type="text" required className="input-field" value={formData.specifications.storage} onChange={(e) => handleSpecChange('storage', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Graphics</label>
              <input type="text" required className="input-field" value={formData.specifications.graphics} onChange={(e) => handleSpecChange('graphics', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display (laptops)</label>
              <input type="text" className="input-field" value={formData.specifications.display} onChange={(e) => handleSpecChange('display', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operating System</label>
              <input type="text" className="input-field" value={formData.specifications.operatingSystem} onChange={(e) => handleSpecChange('operatingSystem', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (laptops)</label>
              <input type="text" className="input-field" value={formData.specifications.weight} onChange={(e) => handleSpecChange('weight', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
              <input type="text" className="input-field" value={formData.specifications.dimensions} onChange={(e) => handleSpecChange('dimensions', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ports (comma-separated)</label>
              <input type="text" className="input-field" value={formData.specifications.ports.join(', ')} onChange={(e) => handleArrayChange('ports', e.target.value)} placeholder="USB 3.2, HDMI, USB-C" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Features (comma-separated)</label>
              <input type="text" className="input-field" value={formData.specifications.features.join(', ')} onChange={(e) => handleArrayChange('features', e.target.value)} placeholder="RGB Lighting, Wi-Fi 6, Bluetooth 5.3" />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/products')} className="btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center space-x-2 disabled:opacity-50">
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
