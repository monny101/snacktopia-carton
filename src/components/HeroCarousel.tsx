
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';

const images = [
  {
    src: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Assorted products",
  },
  {
    src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Business shopping",
  },
  {
    src: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Bulk items",
  },
  {
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    alt: "Business solutions",
  },
];

const HeroCarousel: React.FC = () => {
  return (
    <Carousel className="w-full" opts={{ loop: true, align: "start" }}>
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative rounded-lg overflow-hidden shadow-2xl border border-white/10 h-[350px]">
              <img 
                src={image.src} 
                alt={image.alt} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2" />
      <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2" />
    </Carousel>
  );
};

export default HeroCarousel;
