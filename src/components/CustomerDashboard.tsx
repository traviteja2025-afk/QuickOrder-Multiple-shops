
import React, { useState } from 'react';
import { Product, ProductOrder, CustomerDetails, User, OrderDetails } from '../types';
import OrderForm from './OrderForm';
import OrderHistory from './OrderHistory';

interface CustomerDashboardProps {
  products: Product[];
  onPlaceOrder: (customer: CustomerDetails, products: ProductOrder[]) => void;
  currentUser: User | null;
  orders: OrderDetails[];
  onLoginRequest: () => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ 
  products, 
  onPlaceOrder, 
  currentUser, 
  orders,
  onLoginRequest
}) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'history'>('shop');

  // Filter orders for the specific user
  const myOrders = currentUser 
    ? orders.filter(o => o.userId === currentUser.id).sort((a, b) => (b.orderId > a.orderId ? 1 : -1)) 
    : [];

  return (
    <div className="w-full">
        {/* Navigation Tabs (Only visible if logged in) */}
        {currentUser && (
             <div className="flex justify-center mb-8">
                <div className="bg-white p-1 rounded-full shadow-sm border border-slate-200 inline-flex">
                    <button 
                        onClick={() => setActiveTab('shop')}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                            activeTab === 'shop' 
                            ? 'bg-primary text-white shadow-md' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Shop Now
                    </button>
                    <button 
                         onClick={() => setActiveTab('history')}
                         className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                            activeTab === 'history' 
                            ? 'bg-primary text-white shadow-md' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        My Orders
                        {myOrders.length > 0 && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'history' ? 'bg-white text-primary' : 'bg-slate-200 text-slate-600'}`}>
                                {myOrders.length}
                            </span>
                        )}
                    </button>
                </div>
             </div>
        )}

        {/* Content Area */}
        {activeTab === 'shop' ? (
             <OrderForm 
                products={products} 
                onPlaceOrder={onPlaceOrder} 
                currentUser={currentUser}
                onLoginRequest={onLoginRequest}
            />
        ) : (
            <div className="max-w-2xl mx-auto">
                 <h2 className="text-2xl font-bold text-slate-900 mb-6">Order History</h2>
                 <OrderHistory orders={myOrders} />
            </div>
        )}
        
        {/* Helper message if not logged in and trying to see history (though tab is hidden) */}
        {activeTab === 'history' && !currentUser && (
            <div className="text-center py-12">
                 <p className="text-slate-600 mb-4">Please login to view your order history.</p>
                 <button onClick={onLoginRequest} className="text-primary font-bold hover:underline">Login Now</button>
            </div>
        )}
    </div>
  );
};

export default CustomerDashboard;
