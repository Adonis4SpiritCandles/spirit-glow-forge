import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, ArrowUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "@/contexts/CartContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const { itemCount } = useCartContext();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsOpen(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  const actions = [
    {
      icon: Heart,
      label: 'Wishlist',
      color: 'from-pink-500 to-rose-500',
      onClick: () => {
        navigate('/wishlist');
        setIsOpen(false);
      },
    },
    {
      icon: ShoppingCart,
      label: 'Cart',
      color: 'from-primary to-accent',
      badge: itemCount > 0 ? itemCount : undefined,
      onClick: () => {
        navigate('/cart');
        setIsOpen(false);
      },
    },
    {
      icon: ArrowUp,
      label: 'Scroll to Top',
      color: 'from-amber-500 to-orange-500',
      onClick: scrollToTop,
    },
  ];

  return (
    <TooltipProvider>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed bottom-40 md:bottom-44 right-6 z-30"
          >
            {/* Action buttons */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2"
                >
                  {actions.map((action, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <motion.button
                          initial={{ opacity: 0, x: 50, scale: 0 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 50, scale: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={action.onClick}
                          className={`relative w-11 h-11 rounded-full bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center`}
                        >
                          <action.icon className="w-4 h-4" />
                          {action.badge && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                              {action.badge}
                            </span>
                          )}
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>{action.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main FAB button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(!isOpen)}
                  className={`w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center ${
                    isOpen ? 'rotate-45' : ''
                  } transition-transform duration-300`}
                >
                  <Plus className="w-6 h-6" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{isOpen ? 'Close' : 'Quick Actions'}</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
};

export default FloatingActionButton;
