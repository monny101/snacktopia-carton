
import React from 'react';

const PromoMarquee: React.FC = () => {
  return (
    <div className="bg-mondoYellow text-mondoBlue py-1 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="mx-4">Free delivery on orders above ₦20,000</span>
        <span className="mx-4">Buy in bulk and save more!</span>
        <span className="mx-4">Special discounts for wholesale customers</span>
        <span className="mx-4">Visit our store: No. 50 Okedigo Street, Odotu, near Eki FM, Ondo City</span>
        <span className="mx-4">Contact us: +234803 580 2867</span>
      </div>
    </div>
  );
};

export default PromoMarquee;
