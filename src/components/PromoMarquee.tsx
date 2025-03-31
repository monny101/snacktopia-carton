
import React from 'react';

const PromoMarquee: React.FC = () => {
  const promos = [
    "🔥 Free delivery on orders over ₦20,000",
    "⚡ New customers: Get 10% off your first order with code MONDO10",
    "🎁 Buy 5 cartons of detergent, get 1 free!",
    "💰 Bulk discounts available for businesses",
    "🚚 Same-day delivery available in Lagos"
  ];

  return (
    <div className="bg-mondoBlue text-white py-2 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {promos.map((promo, index) => (
          <React.Fragment key={index}>
            <span className="mx-4 text-sm font-medium">{promo}</span>
            {index < promos.length - 1 && <span className="mx-2">•</span>}
          </React.Fragment>
        ))}
        {/* Duplicate promos for seamless loop */}
        {promos.map((promo, index) => (
          <React.Fragment key={`repeat-${index}`}>
            <span className="mx-4 text-sm font-medium">{promo}</span>
            {index < promos.length - 1 && <span className="mx-2">•</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default PromoMarquee;
