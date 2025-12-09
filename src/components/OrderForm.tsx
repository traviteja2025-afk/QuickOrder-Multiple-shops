
import React, { useState, useEffect } from 'react';
import { Product, ProductOrder, CustomerDetails, User } from '../types';
import ProductCard from './ProductCard';

interface OrderFormProps {
  products: Product[];
  onPlaceOrder: (customer: CustomerDetails, products: ProductOrder[]) => void;
  currentUser?: User | null;
  onLoginRequest?: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ products, onPlaceOrder, currentUser, onLoginRequest }) => {
  const [customer, setCustomer] = useState<CustomerDetails>({ name: '', address: '', contact: '' });
  const [productOrders, setProductOrders] = useState<ProductOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    setProductOrders(products.map(p => ({ product: p, quantity: 0 })));
  }, [products]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (currentUser) {
        setCustomer(prev => ({
            ...prev,
            name: currentUser.name || '',
            contact: currentUser.phoneNumber || '',
            // We don't have address in User type yet, but if we did we'd set it here
        }));
    }
  }, [currentUser]);


  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleQuantityChange = (productId: number | string, newQuantity: number) => {
    setProductOrders(prevOrders =>
      prevOrders.map(order =>
        order.product.id === productId ? { ...order, quantity: Math.max(0, newQuantity) } : order
      )
    );
  };
  
  const validateForm = () => {
    if (!customer.name.trim()) return "Please enter your full name.";
    if (!customer.address.trim()) return "Please enter your shipping address.";
    if (!/^\d{10}$/.test(customer.contact)) return "Please enter a valid 10-digit contact number.";

    const orderedProducts = productOrders.filter(p => p.quantity > 0);
    if (orderedProducts.length === 0) return "Please add at least one product to your order.";
    
    return "";
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Auth Check
    if (!currentUser) {
        if (onLoginRequest) {
            onLoginRequest();
        } else {
            setError("You must be logged in to place an order.");
        }
        return;
    }

    // 2. Validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    const orderedProducts = productOrders.filter(p => p.quantity > 0);
    onPlaceOrder(customer, orderedProducts);
  };
  
  const totalAmount = productOrders.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const filteredProductOrders = productOrders.filter(order => 
    order.product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Place Your Order</h2>
        <p className="text-slate-500 mb-6">Fill in your details and select the products you want to buy.</p>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">The store is currently empty. Please check back later!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-xl font-semibold text-slate-700">Your Details</h3>
                    {currentUser ? (
                         <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Logged in as {currentUser.name}</span>
                    ) : (
                         <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">Guest (Login required to pay)</span>
                    )}
                  </div>
                  <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                      <input type="text" name="name" id="name" value={customer.name} onChange={handleCustomerChange} className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-800 text-white border-slate-600 placeholder-slate-400" required />
                  </div>
                  <div>
                      <label htmlFor="address" className="block text-sm font-medium text-slate-600 mb-1">Shipping Address</label>
                      <textarea name="address" id="address" value={customer.address} onChange={handleCustomerChange} rows={3} className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-800 text-white border-slate-600 placeholder-slate-400" required></textarea>
                  </div>
                  <div>
                      <label htmlFor="contact" className="block text-sm font-medium text-slate-600 mb-1">Contact Number</label>
                      <input type="tel" name="contact" id="contact" value={customer.contact} onChange={handleCustomerChange} className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-slate-800 text-white border-slate-600 placeholder-slate-400" required />
                  </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b pb-2 gap-4">
                    <h3 className="text-xl font-semibold text-slate-700">Select Products</h3>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search for products..."
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredProductOrders.length > 0 ? (
                      filteredProductOrders.map(order => (
                        <ProductCard key={order.product.id} order={order} onQuantityChange={handleQuantityChange} />
                      ))
                  ) : (
                      <div className="text-center py-8 bg-slate-50 rounded-lg">
                          <p className="text-slate-500">No products found matching "{searchTerm}"</p>
                      </div>
                  )}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              
              <div className="pt-4 border-t">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-medium text-slate-600">Total Amount:</span>
                      <span className="text-2xl font-bold text-slate-900">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  
                  {currentUser ? (
                      <button type="submit" className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                          Place Order & Proceed to Pay
                      </button>
                  ) : (
                      <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 flex justify-center items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                           </svg>
                          Login to Checkout
                      </button>
                  )}
              </div>
          </form>
        )}
    </div>
  );
};

export default OrderForm;
