/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { MobileStickyCommandBar } from './components/MobileStickyCommandBar';
import { ScrollToTop } from './components/ScrollToTop';
import { AdminPanelModal } from './components/AdminPanelModal';
import type { Session } from '@supabase/supabase-js';
import { StoreProvider, useStore } from './context/StoreContext';
import { supabase } from './lib/supabase';
import { Product, CartItem } from './types/tactical';

const SECRET_HASHES = ['#/bromindash'];
const SECRET_PATHS = ['/bromindash'];

function AppContent() {
  const { products } = useStore();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tfv_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminSession, setAdminSession] = useState<Session | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [editingTargetProduct, setEditingTargetProduct] = useState<Product | null>(null);

  // Overlay bawah default minimize — dibuka hanya kalau pengunjung yang meminta.
  // State ini dibagi ke ScrollToTop supaya jarak tombol ke overlay selalu sama,
  // baik saat overlay besar maupun minimize.
  const [isBarMinimized, setIsBarMinimized] = useState(true);

  // Clean secret admin route from URL bar (both hash and pathname)
  const cleanSecretUrl = () => {
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    const hasSecretHash = SECRET_HASHES.some((h) => hash.startsWith(h));
    const hasSecretPath = SECRET_PATHS.includes(path);

    if (hasSecretHash || hasSecretPath) {
      const nextPath = hasSecretPath ? '/' : window.location.pathname;
      const nextSearch = window.location.search || '';
      window.history.replaceState(null, '', nextPath + nextSearch);
    }
  };

  // Track Supabase Auth session globally so Header & App reflect admin login state
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setAdminSession(data.session);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      setAdminSession(nextSession);
      if (event === 'SIGNED_IN') {
        cleanSecretUrl();
      }
      if (event === 'PASSWORD_RECOVERY') {
        setIsAdminOpen(true);
      }
      if (event === 'SIGNED_OUT') {
        setIsAdminOpen(false);
        cleanSecretUrl();
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tfv_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Secret URL listener (e.g. #/intel-ops-88 or /intel-ops-88) - no visible buttons for visitors
  useEffect(() => {
    const checkSecretRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const isSecretRoute =
        SECRET_HASHES.some((h) => hash === h) ||
        SECRET_PATHS.includes(path);

      if (isSecretRoute) {
        setIsAdminOpen(true);
      }
    };

    checkSecretRoute();
    window.addEventListener('hashchange', checkSecretRoute);
    window.addEventListener('popstate', checkSecretRoute);
    return () => {
      window.removeEventListener('hashchange', checkSecretRoute);
      window.removeEventListener('popstate', checkSecretRoute);
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    setEditingTargetProduct(null);
    cleanSecretUrl();
  };

  const handleAdminEditProduct = (product: Product) => {
    if (!adminSession) return;
    setEditingTargetProduct(product);
    setIsAdminOpen(true);
  };

  const handleLogoutAdmin = async () => {
    await supabase.auth.signOut();
    setAdminSession(null);
    setIsAdminOpen(false);
    setEditingTargetProduct(null);
    cleanSecretUrl();
  };

  const handleAddToCart = (product: Product, selectedSize: number) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };
        return next;
      } else {
        return [...prev, { product, selectedSize, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, size: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId, size);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.selectedSize === size) {
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: string, size: number) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.selectedSize === size))
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F8FAFC] flex flex-col selection:bg-[#F8B704] selection:text-[#0F1115]">
      
      {/* Sticky Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        isAdminLoggedIn={Boolean(adminSession)}
        adminEmail={adminSession?.user?.email}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Main Content */}
      <main className="flex-1">
        <HomePage
          onAddToCart={handleAddToCart}
          onQuickView={(product) => setQuickViewProduct(product)}
          onOpenCart={() => setIsCartOpen(true)}
          isAdminLoggedIn={Boolean(adminSession)}
          onAdminEditProduct={handleAdminEditProduct}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Slide-Over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Quick View Product Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Admin Panel Modal (Command Center - Secret Link or Active Admin Session) */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        initialEditProduct={editingTargetProduct}
        onClearInitialEditProduct={() => setEditingTargetProduct(null)}
      />

      {/* Docked Mobile Sticky Command Bar */}
      <MobileStickyCommandBar
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        onQuickCheckout={() => setIsCartOpen(true)}
        isMinimized={isBarMinimized}
        onToggleMinimize={setIsBarMinimized}
      />

      {/* Floating Scroll to Top Button */}
      <ScrollToTop isBarMinimized={isBarMinimized} />

    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
