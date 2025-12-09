
import React, { useState, useEffect } from 'react';
import { Product, OrderDetails, OrderStatus, User, Store } from '../../types';
import AddProductForm from './AddProductForm';
import { createStore, deleteStore, getAllStores } from '../../services/adminService';
import firebase from '../../services/firebaseConfig';

interface AdminDashboardProps {
    // Current Store Context
    currentStore: Store | null;
    
    // Data
    products: Product[];
    orders: OrderDetails[];
    currentUser: User | null;
    
    // Actions
    onUpdateStoreSettings: (settings: Store) => void;
    onAddProduct: (newProductData: Omit<Product, 'id' | 'storeId'>) => void;
    onUpdateProduct: (updatedProduct: Product) => void;
    onDeleteProduct: (productId: number | string) => void;
    onUpdateOrderStatus: (firestoreId: string, status: OrderStatus, additionalData?: any) => void;
    onDeleteOrder: (firestoreId: string) => void;
    onNavigateToStore: (storeId: string) => void;
}

// --- SUB-COMPONENT: ORDER CARD ---
const OrderCard: React.FC<{ 
    order: OrderDetails, 
    onUpdateStatus: (id: string, status: OrderStatus, data?: any) => void,
    onDeleteOrder: (id: string) => void
}> = ({ order, onUpdateStatus, onDeleteOrder }) => {
    const [trackingInput, setTrackingInput] = useState('');
    const [showTrackingForm, setShowTrackingForm] = useState(false);

    if (!order.firestoreId) return null;

    const handleShip = () => {
        if (!trackingInput.trim()) return alert("Please enter tracking number");
        onUpdateStatus(order.firestoreId!, 'shipped', { trackingNumber: trackingInput });
        setShowTrackingForm(false);
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to permanently delete this order?")) {
            onDeleteOrder(order.firestoreId!);
        }
    };

    const renderBadge = () => {
        switch(order.status) {
            case 'pending': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">New Order</span>;
            case 'paid': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Paid</span>;
            case 'confirmed': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Confirmed</span>;
            case 'shipped': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Shipped</span>;
            case 'delivered': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Delivered</span>;
            case 'cancelled': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>;
        }
    };

    const renderActions = () => {
        switch(order.status) {
            case 'pending':
                return (
                    <div className="flex gap-2 justify-end mt-2">
                         <button onClick={() => onUpdateStatus(order.firestoreId!, 'paid')} className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">Mark Paid</button>
                         <button onClick={() => onUpdateStatus(order.firestoreId!, 'cancelled')} className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300">Cancel</button>
                    </div>
                );
            case 'paid':
                return (
                    <div className="flex gap-2 justify-end mt-2">
                        <button onClick={() => onUpdateStatus(order.firestoreId!, 'confirmed')} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Confirm</button>
                    </div>
                );
            case 'confirmed':
                return (
                    <div className="mt-2 text-right">
                        {showTrackingForm ? (
                            <div className="flex gap-2 items-center justify-end">
                                <input 
                                    type="text" 
                                    placeholder="Tracking No." 
                                    value={trackingInput} 
                                    onChange={(e) => setTrackingInput(e.target.value)}
                                    className="border rounded px-2 py-1 text-sm w-32"
                                />
                                <button onClick={handleShip} className="px-2 py-1 bg-blue-600 text-white rounded text-sm">Save</button>
                                <button onClick={() => setShowTrackingForm(false)} className="px-2 py-1 text-slate-500 text-xs hover:underline">X</button>
                            </div>
                        ) : (
                            <button onClick={() => setShowTrackingForm(true)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Mark Shipped</button>
                        )}
                    </div>
                );
            case 'shipped':
                return (
                     <div className="flex gap-2 justify-end mt-2">
                        <button onClick={() => onUpdateStatus(order.firestoreId!, 'delivered')} className="px-3 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-700">Mark Delivered</button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-slate-50 relative group">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                     {renderBadge()}
                     <span className="text-xs text-slate-400 font-mono">#{order.orderId}</span>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-primary">₹{order.totalAmount.toFixed(2)}</p>
                    <button onClick={handleDelete} className="text-slate-300 hover:text-red-500 transition-colors" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
            <div className="mt-2">
                <p className="font-semibold text-slate-800">{order.customer.name}</p>
                <div className="text-sm mt-1">{order.status === 'shipped' && `Tracking: ${order.trackingNumber}`}</div>
            </div>
            <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-slate-500 mb-1">{order.customer.address}, {order.customer.contact}</p>
                <ul className="text-xs text-slate-600 space-y-1">
                    {order.products.map(item => (
                        <li key={item.product.id} className="flex justify-between">
                            <span>{item.product.name} x{item.quantity}</span>
                            <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            </div>
            {renderActions()}
        </div>
    );
};

// --- SUB-COMPONENT: ROOT ADMIN DASHBOARD (Manage Stores) ---
const RootAdminView: React.FC<{ onNavigateToStore: (id: string) => void }> = ({ onNavigateToStore }) => {
    const [stores, setStores] = useState<Store[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newStore, setNewStore] = useState({ id: '', name: '', ownerEmail: '', ownerPhone: '', vpa: '', merchantName: '' });

    useEffect(() => { loadStores(); }, []);
    const loadStores = async () => { setStores(await getAllStores()); };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validation: ID must be URL safe
        const storeId = newStore.id.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (!storeId) return alert("Invalid Store ID");
        
        try {
            await createStore({
                storeId: storeId,
                name: newStore.name,
                ownerEmail: newStore.ownerEmail,
                ownerPhone: newStore.ownerPhone,
                vpa: newStore.vpa,
                merchantName: newStore.merchantName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            setIsCreating(false);
            setNewStore({ id: '', name: '', ownerEmail: '', ownerPhone: '', vpa: '', merchantName: '' });
            loadStores();
        } catch (err) {
            console.error(err);
            alert("Error creating store.");
        }
    };

    const handleDelete = async (id: string) => {
        if(window.confirm(`Delete store ${id} AND ALL its data?`)) {
            await deleteStore(id);
            loadStores();
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-900">Root Admin: Manage Stores</h2>
                <button onClick={() => setIsCreating(!isCreating)} className="bg-slate-900 text-white px-4 py-2 rounded-lg">
                    {isCreating ? 'Cancel' : 'Create New Store'}
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-lg space-y-4 border border-slate-200">
                    <h3 className="font-bold text-lg">New Store Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase">Store ID (URL Slug)</label>
                            <input type="text" placeholder="e.g. teja-shop" value={newStore.id} onChange={e=>setNewStore({...newStore, id: e.target.value})} className="w-full border p-2 rounded" required />
                            <p className="text-xs text-slate-400">This will be the link: app/?store=teja-shop</p>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase">Store Display Name</label>
                             <input type="text" placeholder="e.g. Teja's Electronics" value={newStore.name} onChange={e=>setNewStore({...newStore, name: e.target.value})} className="w-full border p-2 rounded" required />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase">Owner Email</label>
                             <input type="email" placeholder="owner@gmail.com" value={newStore.ownerEmail} onChange={e=>setNewStore({...newStore, ownerEmail: e.target.value})} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase">Owner Phone</label>
                             <input type="tel" placeholder="9876543210" value={newStore.ownerPhone} onChange={e=>setNewStore({...newStore, ownerPhone: e.target.value})} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase">UPI VPA</label>
                             <input type="text" placeholder="shop@upi" value={newStore.vpa} onChange={e=>setNewStore({...newStore, vpa: e.target.value})} className="w-full border p-2 rounded" required />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase">Merchant Legal Name</label>
                             <input type="text" placeholder="Teja Enterprises" value={newStore.merchantName} onChange={e=>setNewStore({...newStore, merchantName: e.target.value})} className="w-full border p-2 rounded" required />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded">Create Store</button>
                </form>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map(store => (
                    <div key={store.storeId} className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-xl text-slate-800">{store.name}</h4>
                                <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded font-mono">{store.storeId}</span>
                            </div>
                            <div className="mt-4 text-sm text-slate-600 space-y-1">
                                <p><span className="font-semibold">Owner:</span> {store.ownerEmail || store.ownerPhone || 'N/A'}</p>
                                <p><span className="font-semibold">VPA:</span> {store.vpa}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-2">
                            <button onClick={() => onNavigateToStore(store.storeId)} className="flex-1 bg-primary text-white py-2 rounded text-sm hover:bg-primary-600">Open Shop</button>
                            <button onClick={() => handleDelete(store.storeId)} className="bg-red-50 text-red-600 px-3 py-2 rounded text-sm hover:bg-red-100">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: SELLER SETTINGS FORM ---
const StoreSettingsForm: React.FC<{ settings: Store, onSave: (s: Store) => void }> = ({ settings, onSave }) => {
    const [formData, setFormData] = useState(settings);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => { setFormData(settings); }, [settings]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        setIsExpanded(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-primary/20">
             <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 17h.01M9 20h.01M3 20h.01M3 17h.01M9 17h.01M9 14h.01M3 14h.01M9 11h.01M3 11h.01M15 20h6M15 17h6M15 14h6M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z" />
                    </svg>
                    Store Configuration ({formData.name})
                </h2>
                <button className="text-slate-500" type="button">
                    {isExpanded ? '▲' : '▼'}
                </button>
             </div>

             {isExpanded && (
                 <form onSubmit={handleSubmit} className="mt-4 space-y-4 animate-fade-in">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Store Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Merchant UPI ID (VPA)</label>
                        <input type="text" value={formData.vpa} onChange={e => setFormData({...formData, vpa: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Merchant Display Name</label>
                        <input type="text" value={formData.merchantName} onChange={e => setFormData({...formData, merchantName: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                    </div>
                    <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded hover:bg-primary-600">Save Settings</button>
                 </form>
             )}
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const { 
        currentStore, 
        products, 
        orders, 
        currentUser,
        onNavigateToStore,
        onUpdateStoreSettings,
        onAddProduct, 
        onUpdateProduct, 
        onDeleteProduct, 
        onUpdateOrderStatus, 
        onDeleteOrder 
    } = props;

    // --- STATES ---
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    // --- IF ROOT ADMIN & NO STORE SELECTED -> SHOW ROOT VIEW ---
    if (currentUser?.role === 'root' && !currentStore) {
        return <RootAdminView onNavigateToStore={onNavigateToStore} />;
    }

    // --- IF NO STORE SELECTED (Should technically be handled by router, but safe guard) ---
    if (!currentStore) {
        return <div className="text-center py-10">No Store Selected</div>;
    }

    // --- SELLER DASHBOARD (For specific store) ---
    const handleUpdate = (updatedProduct: Product) => { onUpdateProduct(updatedProduct); setEditingProduct(null); };

    // Grouping Orders
    const activeOrders = orders.filter(o => ['pending', 'paid', 'confirmed', 'shipped'].includes(o.status));
    const completedOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

    return (
        <div className="space-y-12">
            
            {/* Store Settings Config */}
            <StoreSettingsForm settings={currentStore} onSave={onUpdateStoreSettings} />

            <AddProductForm
                key={editingProduct ? `edit-${editingProduct.id}` : productToDelete ? `delete-${productToDelete.id}` : 'add-new'}
                onAddProduct={onAddProduct}
                productToEdit={editingProduct}
                productToDelete={productToDelete}
                onUpdateProduct={handleUpdate}
                onCancelEdit={() => setEditingProduct(null)}
                onConfirmDelete={(id) => { onDeleteProduct(id); setProductToDelete(null); }}
                onCancelDelete={() => setProductToDelete(null)}
            />

            {/* Order Management Section */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 border-b pb-4">Order Management</h2>
                <div className="flex gap-4 mb-6 border-b border-slate-100">
                    <button onClick={() => setActiveTab('active')} className={`pb-2 px-4 font-semibold ${activeTab === 'active' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}>Active ({activeOrders.length})</button>
                    <button onClick={() => setActiveTab('completed')} className={`pb-2 px-4 font-semibold ${activeTab === 'completed' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}>History ({completedOrders.length})</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(activeTab === 'active' ? activeOrders : completedOrders).map(order => (
                        <OrderCard key={order.orderId} order={order} onUpdateStatus={onUpdateOrderStatus} onDeleteOrder={onDeleteOrder} />
                    ))}
                    {(activeTab === 'active' ? activeOrders : completedOrders).length === 0 && <p className="col-span-full text-center text-slate-500 py-8">No orders found.</p>}
                </div>
            </div>

            {/* Product List Section */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 border-b pb-4">Manage Products</h2>
                {products.length > 0 ? (
                    <div className="space-y-4">
                        {products.map(product => (
                            <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg bg-slate-50">
                                <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow">
                                    <h4 className="font-semibold text-slate-800">{product.name}</h4>
                                    <p className="text-md font-bold text-primary">₹{product.price.toFixed(2)}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row space-y-2 gap-2">
                                    <button onClick={() => { setEditingProduct(product); setProductToDelete(null); window.scrollTo({top:0, behavior:'smooth'}); }} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">Edit</button>
                                    <button onClick={() => { setProductToDelete(product); setEditingProduct(null); window.scrollTo({top:0, behavior:'smooth'}); }} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-4">No products yet.</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
