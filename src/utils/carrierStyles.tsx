import { Badge } from '@/components/ui/badge';

export interface CarrierStyle {
  name: string;
  bg: string;
  text: string;
  border: string;
}

export const getCarrierStyle = (carrierName: string | undefined): CarrierStyle => {
  if (!carrierName) {
    return {
      name: 'Unknown',
      bg: 'bg-gray-600',
      text: 'text-white',
      border: 'border-gray-700',
    };
  }

  const carrier = carrierName.toLowerCase().trim();
  
  const styles: Record<string, CarrierStyle> = {
    dhl: {
      name: 'DHL',
      bg: 'bg-red-600',
      text: 'text-white',
      border: 'border-red-700',
    },
    inpost: {
      name: 'InPost',
      bg: 'bg-yellow-400',
      text: 'text-black',
      border: 'border-yellow-500',
    },
    fedex: {
      name: 'FedEx',
      bg: 'bg-orange-600',
      text: 'text-white',
      border: 'border-orange-700',
    },
    dpd: {
      name: 'DPD',
      bg: 'bg-red-600',
      text: 'text-white',
      border: 'border-red-700',
    },
    ups: {
      name: 'UPS',
      bg: 'bg-amber-800',
      text: 'text-white',
      border: 'border-amber-900',
    },
    gls: {
      name: 'GLS',
      bg: 'bg-blue-600',
      text: 'text-white',
      border: 'border-blue-700',
    },
  };
  
  return styles[carrier] || {
    name: carrierName.toUpperCase(),
    bg: 'bg-gray-600',
    text: 'text-white',
    border: 'border-gray-700',
  };
};

interface CarrierBadgeProps {
  carrierName: string | undefined;
  className?: string;
}

export const CarrierBadge = ({ carrierName, className = '' }: CarrierBadgeProps) => {
  if (!carrierName) return null;
  
  const style = getCarrierStyle(carrierName);
  
  // Enhanced InPost visibility
  const isInPost = carrierName.toLowerCase().includes('inpost');
  const textClass = isInPost ? 'text-black font-extrabold' : style.text;
  const borderClass = isInPost ? 'border-yellow-600 border-2' : style.border;
  
  return (
    <Badge 
      className={`
        ${style.bg} 
        ${textClass} 
        border
        ${borderClass}
        font-bold 
        text-shadow-sm
        shadow-md
        px-3 py-1
        rounded-none
        ${className}
      `}
    >
      {style.name}
    </Badge>
  );
};
