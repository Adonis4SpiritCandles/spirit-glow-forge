import { Flame } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse">
          <div className="w-24 h-24 rounded-full bg-primary/20 blur-xl"></div>
        </div>
        <Flame className="w-24 h-24 text-primary animate-[candle-flicker_1.5s_ease-in-out_infinite] relative z-10" />
      </div>
    </div>
  );
};

export default LoadingSpinner;
