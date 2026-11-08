import React from 'react';
import {
  Landmark,
  Wallet,
  Car,
  Home,
  PiggyBank,
  CreditCard,
  Building2,
  Users,
  Zap,
  HelpCircle,
} from 'lucide-react';

interface ProductIconProps {
  name: string;
  className?: string;
}

export const ProductIcon: React.FC<ProductIconProps> = ({ name, className = 'w-6 h-6' }) => {
  switch (name) {
    case 'Landmark':
      return <Landmark className={className} />;
    case 'Wallet':
      return <Wallet className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'Home':
      return <Home className={className} />;
    case 'PiggyBank':
      return <PiggyBank className={className} />;
    case 'CreditCard':
      return <CreditCard className={className} />;
    case 'Building2':
      return <Building2 className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};
