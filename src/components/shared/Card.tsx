import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  className?: string;
  children?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  hoverEffect?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  className,
  children,
  image,
  imageAlt,
  title,
  subtitle,
  footer,
  hoverEffect = true,
  onClick,
}) => {
  return (
    <div 
      className={cn(
        "bg-white shadow-lg overflow-hidden border border-secondary/5 flex flex-col h-full",
        hoverEffect && "transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl",
        onClick && "cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      {image && (
        <div className="relative h-56 sm:h-64 overflow-hidden bg-accent">
          <img 
            src={image} 
            alt={imageAlt || title || "Image"} 
            className={cn(
              "w-full h-full object-cover transition-transform duration-700",
              onClick || hoverEffect ? "hover:scale-110" : ""
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-60"></div>
        </div>
      )}
      
      <div className="flex-grow p-6 flex flex-col">
        {(title || subtitle) && (
          <div className="mb-4 pb-4 border-b border-secondary/10">
            {subtitle && (
              <p className="text-xs font-sans text-primary font-bold uppercase tracking-widest mb-2">
                {subtitle}
              </p>
            )}
            {title && (
              <h3 className={cn(
                "font-serif text-2xl text-secondary font-bold leading-tight",
                onClick && "group-hover:text-primary transition-colors"
              )}>
                {title}
              </h3>
            )}
          </div>
        )}
        
        <div className="text-secondary/70 flex-grow leading-relaxed">
          {children}
        </div>
      </div>

      {footer && (
        <div className="p-4 border-t border-secondary/10 bg-accent/20 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;