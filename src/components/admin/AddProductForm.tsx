
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../../types';

interface AddProductFormProps {
    onAddProduct: (newProductData: Omit<Product, 'id' | 'storeId'>) => void;
    productToEdit?: Product | null;
    onUpdateProduct?: (updatedProduct: Product) => void;
    onCancelEdit?: () => void;
    // New props for Delete functionality
    productToDelete?: Product | null;
    onConfirmDelete?: (productId: number | string) => void;
    onCancelDelete?: () => void;
}

const initialFormState = {
    name: '',
    price: '',
    unit: '',
    description: '',
    imageUrl: '',
};

const AddProductForm: React.FC<AddProductFormProps> = ({ 
    onAddProduct, 
    productToEdit, 
    onUpdateProduct, 
    onCancelEdit,
    productToDelete,
    onConfirmDelete,
    onCancelDelete
}) => {
    const [formData, setFormData] = useState(initialFormState);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditing = !!productToEdit;

    useEffect(() => {
        if (isEditing && productToEdit) {
            setFormData({
                name: productToEdit.name,
                price: String(productToEdit.price),
                unit: productToEdit.unit,
                description: productToEdit.description,
                imageUrl: productToEdit.imageUrl,
            });
            setImagePreview(productToEdit.imageUrl);
        } else {
            setFormData(initialFormState);
            setImagePreview(null);
        }
        setError(''); // Clear errors when switching modes
    }, [productToEdit, isEditing]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 400;
                    const MAX_HEIGHT = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Compress to JPEG
                    
                    setFormData(prev => ({...prev, imageUrl: dataUrl}));
                    setImagePreview(dataUrl);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, price, unit, description, imageUrl } = formData;
        if (!name || !price || !unit || !imageUrl) {
            setError('Please fill in all required fields and provide an image.');
            return;
        }

        const productData = {
            name,
            price: parseFloat(price),
            unit,
            description,
            imageUrl,
        };

        if (isEditing && onUpdateProduct && productToEdit) {
            onUpdateProduct({ 
                ...productData, 
                id: productToEdit.id,
                storeId: productToEdit.storeId 
            });
        } else {
            onAddProduct(productData);
            // Reset form only when adding a new product
            setFormData(initialFormState);
            setImagePreview(null);
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
        setError('');
    };

    // --- RENDER DELETE CONFIRMATION ---
    if (productToDelete) {
        return (
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in text-center">
                 <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>
                
                <h3 className="text-lg leading-6 font-medium text-slate-900 mb-2">Delete Product</h3>
                <p className="text-sm text-slate-500 mb-6">
                    Do you want to delete <span className="font-bold text-slate-800">"{productToDelete.name}"</span>?
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onCancelDelete}
                        className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        No
                    </button>
                    <button
                        onClick={() => onConfirmDelete && onConfirmDelete(productToDelete.id)}
                        className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Yes
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER STANDARD ADD/EDIT FORM ---
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{isEditing ? 'Edit Product' : 'Add a New Product'}</h2>
            <p className="text-slate-500 mb-6">{isEditing ? 'Update the details for your product below.' : 'Fill in the details below to add a product to your store.'}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">Product Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-800 text-white border-slate-600 placeholder-slate-400" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-slate-600 mb-1">Price (₹)</label>
                            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-800 text-white border-slate-600 placeholder-slate-400" required min="0" step="0.01" />
                        </div>
                        <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-slate-600 mb-1">Unit</label>
                            <input type="text" name="unit" id="unit" value={formData.unit} onChange={handleChange} placeholder="e.g., kg, pack" className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-800 text-white border-slate-600 placeholder-slate-400" required />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-800 text-white border-slate-600 placeholder-slate-400"></textarea>
                </div>
                
                <div>
                     <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-600">Product Image</label>
                     </div>
                     <div className="mt-1 flex items-center space-x-6">
                         <div className="shrink-0 relative">
                            {imagePreview ? (
                                <img className="h-20 w-20 object-cover rounded-lg" src={imagePreview} alt="Current product" />
                            ) : (
                                <div className="h-20 w-20 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <svg className="h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 4v.01M28 8l4.09 4.09a2 2 0 01.59 1.41V28m0 0l-10-10-8 8-4-4m12 6l-4-4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                         </div>
                         <label className="block">
                             <span className="sr-only">Choose product photo</span>
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                         </label>
                     </div>
                </div>


                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                <div className="pt-4 border-t flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                    <button type="submit" className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        {isEditing ? 'Update Product' : 'Add Product'}
                    </button>
                    {isEditing && onCancelEdit && (
                        <button type="button" onClick={onCancelEdit} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-4 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddProductForm;
