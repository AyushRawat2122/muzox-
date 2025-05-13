import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  
  useEffect(() => {
  
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    
   
    const promptDismissed = localStorage.getItem('pwaPromptDismissed');
    if (promptDismissed) {
      const dismissedTime = parseInt(promptDismissed, 10);
      const currentTime = new Date().getTime();
 
      if (currentTime - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }
    
   
    const handleBeforeInstallPrompt = (e) => {
  
      e.preventDefault();

      setDeferredPrompt(e);

      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
  
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
    setShowPrompt(false);
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
  };
  
  const handleDismiss = () => {
    localStorage.setItem('pwaPromptDismissed', new Date().getTime().toString());
    setShowPrompt(false);
  };
  
  if (!showPrompt || isInstalled) return null;
  
  return (
    <motion.div 
      className="fixed bottom-4 left-0 right-0 mx-auto max-w-sm px-4 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="bg-black backdrop-blur-md bg-opacity-90 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium text-white">Install Muzox</h3>
            <button 
              onClick={handleDismiss} 
              className="text-zinc-500 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-zinc-400 mb-5 text-sm">
            Get the full Muzox experience with our app. Faster access, offline playback, and seamless integration with your device.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 bg-transparent border border-zinc-800 rounded-lg text-zinc-400 flex-1 hover:bg-zinc-900 hover:text-zinc-200 transition-all text-sm font-medium"
            >
              Not now
            </button>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2.5 bg-[#fe7641] rounded-lg text-white flex-1 hover:bg-opacity-90 transition-all text-sm font-medium shadow-lg shadow-[#fe7641]/20"
            >
              Install App
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PWAInstallPrompt; 