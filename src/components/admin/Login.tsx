
import React, { useState, useEffect } from 'react';
import firebase, { auth } from '../../services/firebaseConfig';
import { isRootAdmin, getManagedStore } from '../../services/adminService';
import { User } from '../../types';

interface LoginProps {
  targetRole?: 'admin' | 'customer';
  onLogin?: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ targetRole, onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Specific state for the Domain Error
  const [domainError, setDomainError] = useState<{isError: boolean; domain: string}>({
    isError: false,
    domain: ''
  });

  // Helper function to get the exact hostname Firebase needs
  const getCurrentHostname = () => {
    if (typeof window === 'undefined') return '';
    return window.location.hostname;
  };

  useEffect(() => {
    setDomainError(prev => ({ ...prev, domain: getCurrentHostname() }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthError = (err: any) => {
    console.error("Auth Error Full Object:", err);
    setLoading(false);

    // Robust Check for Unauthorized Domain
    const isUnauthorized = 
        err?.code === 'auth/unauthorized-domain' || 
        (err?.message && err.message.includes('unauthorized-domain')) ||
        (err?.toString && err.toString().includes('unauthorized-domain'));

    if (isUnauthorized) {
      setDomainError({ isError: true, domain: getCurrentHostname() });
      return;
    }

    // Other standard errors
    let msg = "Authentication failed.";
    switch (err.code) {
      case 'auth/invalid-credential':
        msg = "Invalid phone number or password.";
        break;
      case 'auth/user-not-found':
        msg = "Account not found. Please register first.";
        break;
      case 'auth/wrong-password':
        msg = "Incorrect password.";
        break;
      case 'auth/email-already-in-use':
        msg = "This phone number is already registered.";
        break;
      case 'auth/weak-password':
        msg = "Password should be at least 6 characters.";
        break;
      case 'auth/popup-closed-by-user':
        msg = "Sign-in cancelled.";
        break;
      case 'auth/configuration-not-found':
        msg = "Google Sign-in is disabled in Firebase Console. Please enable it.";
        break;
      case 'auth/network-request-failed':
        msg = "Network error. Please check your internet connection.";
        break;
      default:
        msg = err.message || "An unexpected error occurred.";
    }
    setError(msg);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      
      const userEmail = result.user?.email;

      // --- ACCESS CONTROL ---
      let userRole: 'root' | 'seller' | 'customer' = 'customer';
      let managedStoreId: string | undefined = undefined;

      if (targetRole === 'admin') {
          // 1. Check Root
          if (isRootAdmin(userEmail, null)) {
              userRole = 'root';
          } 
          // 2. Check Seller
          else {
              const managedStore = await getManagedStore(userEmail, null);
              if (managedStore) {
                  userRole = 'seller';
                  managedStoreId = managedStore.storeId;
              } else {
                  setLoading(false);
                  setError(`Access Denied: The email "${userEmail}" is not authorized as an Admin/Seller.`);
                  await auth.signOut();
                  return; 
              }
          }
      } else {
          // targetRole === 'customer'
          userRole = 'customer';
      }
      
      // Success
      if (onLogin && result.user) {
        onLogin({
          id: result.user.uid,
          name: result.user.displayName || 'User',
          role: userRole,
          email: result.user.email || undefined,
          avatar: result.user.photoURL || undefined,
          managedStoreId
        });
      }
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handlePhonePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.phone || !formData.password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }
    if (isRegistering && !formData.name) {
      setError("Name is required for registration.");
      setLoading(false);
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
        setError("Please enter a valid phone number.");
        setLoading(false);
        return;
    }

    // --- ACCESS CONTROL PRE-CHECK (Optional but good for UX) ---
    // Note: We check properly AFTER login to prevent spoofing, but checking DB whitelist 
    // before auth requires DB read which is fine if rules allow.
    // However, for simplicity and security, let's auth first then check rights.

    const fakeEmail = `${cleanPhone}@quickorder.app`;

    try {
      let userCred;
      if (isRegistering) {
        userCred = await auth.createUserWithEmailAndPassword(fakeEmail, formData.password);
        if (userCred.user) {
            await userCred.user.updateProfile({ displayName: formData.name });
        }
      } else {
        userCred = await auth.signInWithEmailAndPassword(fakeEmail, formData.password);
      }

      // --- POST LOGIN ACCESS CHECK ---
      let userRole: 'root' | 'seller' | 'customer' = 'customer';
      let managedStoreId: string | undefined = undefined;

      if (targetRole === 'admin') {
          // 1. Check Root
          if (isRootAdmin(null, cleanPhone)) {
              userRole = 'root';
          } 
          // 2. Check Seller
          else {
              const managedStore = await getManagedStore(null, cleanPhone);
              if (managedStore) {
                  userRole = 'seller';
                  managedStoreId = managedStore.storeId;
              } else {
                  setLoading(false);
                  setError(`Access Denied: The number "${formData.phone}" is not authorized as an Admin.`);
                  return;
              }
          }
      }

      if (onLogin && userCred.user) {
        onLogin({
          id: userCred.user.uid,
          name: userCred.user.displayName || formData.name || 'User',
          role: userRole,
          phoneNumber: formData.phone,
          managedStoreId
        });
      }
    } catch (err) {
      handleAuthError(err);
    }
  };

  // --- RENDER: SETUP REQUIRED SCREEN (For Domain Error) ---
  if (domainError.isError) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-xl border-2 border-red-500 text-center max-w-md mx-auto relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
        
        <div className="flex justify-center mb-4 text-red-500">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">Domain Setup Required</h3>
        <p className="text-slate-600 mb-4 text-sm">
          Firebase blocked the login because this domain is not on the allowlist yet.
        </p>

        <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6 text-left">
          <p className="text-xs text-slate-500 mb-1">Your Current Address:</p>
          <div className="flex items-center gap-2 mb-3">
            <code className="flex-1 bg-white p-2 rounded border border-red-200 font-mono text-sm font-bold text-slate-800 break-all">
              {domainError.domain || "Unknown Domain"}
            </code>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(domainError.domain);
                const btn = document.getElementById('copy-btn');
                if(btn) btn.innerText = "Copied!";
                setTimeout(() => { if(btn) btn.innerText = "Copy"; }, 2000);
              }}
              id="copy-btn"
              className="bg-red-600 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="space-y-3">
             <a 
              href="https://console.firebase.google.com/u/0/project/_/authentication/settings" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-700 transition-colors shadow-md"
            >
              <span>Open Firebase Settings</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-white text-slate-600 border border-slate-300 font-semibold py-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              I have added it, Try Again
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-100 max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          {isRegistering ? 'Create Account' : (targetRole === 'admin' ? 'Admin Login' : 'User Login')}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {isRegistering ? 'Sign up to start ordering' : (targetRole === 'admin' ? 'Secure access for store owners.' : 'Welcome back! Please sign in.')}
        </p>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center space-x-2 bg-white border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-lg hover:bg-slate-50 transition-all shadow-sm group"
      >
        {loading ? (
            <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : (
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
        )}
        <span>Continue with Google</span>
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-500">Or using phone</span>
        </div>
      </div>

      <form onSubmit={handlePhonePasswordSubmit} className="space-y-4">
        {isRegistering && (
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary border-slate-300" placeholder="John Doe" required={isRegistering} />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Phone Number</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary border-slate-300" placeholder="9876543210" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary border-slate-300" placeholder="••••••" required minLength={6} />
        </div>
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
        )}
        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-all shadow-md flex justify-center">
          {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Login')}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-slate-600">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsRegistering(!isRegistering); setError(null); }} className="text-primary font-semibold hover:underline">
            {isRegistering ? 'Login here' : 'Register here'}
          </button>
        </p>
      </div>
      
      <div className="mt-8 pt-4 border-t border-slate-100">
         <p className="text-xs text-center text-slate-400 mb-1">System Info: Current Address</p>
         <div className="flex justify-center">
            <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-600 select-all">
                {getCurrentHostname()}
            </code>
         </div>
      </div>
    </div>
  );
};

export default Login;
