
import React, { useState, useEffect } from 'react';
import { getAllStores } from '../services/adminService';
import { Store } from '../types';

interface LandingPageProps {
    onNavigateToStore: (storeId: string) => void;
    onNavigateToAdmin: () => void;
}

const StoreCard: React.FC<{ store: Store, onClick: () => void }> = ({ store, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border border-slate-100 group transform hover:-translate-y-1"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl group-hover:bg-primary group-hover:text-white transition-colors">
                {store.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                ID: {store.storeId}
            </span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">{store.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-2">Merchant: {store.merchantName}</p>
        <div className="mt-4 flex items-center text-primary text-sm font-semibold">
            <span>Visit Shop</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
        </div>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToStore, onNavigateToAdmin }) => {
    const [storeInput, setStoreInput] = useState('');
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStores = async () => {
            const data = await getAllStores();
            setStores(data);
            setLoading(false);
        };
        loadStores();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (storeInput.trim()) {
            onNavigateToStore(storeInput.trim().toLowerCase());
        }
    };

    return (
        <div className="w-full min-h-screen relative overflow-hidden bg-slate-50 animate-fade-in flex flex-col">
            {/* Background Gradients */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none" aria-hidden="true">
                <div 
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#38bdf8] to-[#0284c7] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" 
                    style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}>
                </div>
            </div>

            {/* Hero Section */}
            <div className="pt-20 pb-10 px-6 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl mb-4">
                    QuickOrder UPI
                </h1>
                <p className="text-lg leading-8 text-slate-600 max-w-2xl mx-auto mb-8">
                    Discover local shops, place orders, and pay instantly via UPI.
                </p>

                {/* Search Bar */}
                <div className="max-w-md mx-auto relative z-10 mb-4">
                    <form onSubmit={handleSubmit} className="flex gap-2 bg-white p-2 rounded-xl shadow-lg border border-slate-100">
                        <input 
                            type="text" 
                            placeholder="Enter Store ID to visit directly..." 
                            value={storeInput}
                            onChange={(e) => setStoreInput(e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg border-none focus:ring-0 outline-none text-slate-700 placeholder-slate-400"
                        />
                        <button 
                            type="submit"
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors"
                        >
                            Go
                        </button>
                    </form>
                </div>
                
                <button onClick={onNavigateToAdmin} className="text-sm font-semibold text-slate-500 hover:text-primary underline">
                    Are you a seller? Login here
                </button>
            </div>

            {/* Stores Grid Section */}
            <div className="flex-grow bg-white/50 backdrop-blur-sm py-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Explore Shops</h2>
                        <span className="text-sm text-slate-500">{stores.length} Active Stores</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                    ) : stores.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stores.map(store => (
                                <StoreCard 
                                    key={store.storeId} 
                                    store={store} 
                                    onClick={() => onNavigateToStore(store.storeId)} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-500 text-lg">No shops available yet.</p>
                            <p className="text-slate-400 text-sm mt-2">Check back later or start your own!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
