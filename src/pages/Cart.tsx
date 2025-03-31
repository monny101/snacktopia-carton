
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ChevronLeft, Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const navigate = useNavigate();

  const handleQuantityDecrease = (id: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(id, currentQuantity - 1);
    }
  };

  const handleQuantityIncrease = (id: string, currentQuantity: number) => {
    updateQuantity(id, currentQuantity + 1);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <div className="mb-4 p-4 rounded-full bg-gray-100">
            <ShoppingCart size={64} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6 text-center">Looks like you haven't added any products to your cart yet.</p>
          <Link to="/products">
            <Button className="bg-mondoBlue hover:bg-blue-700">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold">Cart Items ({items.length})</h2>
                <Button 
                  variant="ghost" 
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Cart
                </Button>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                      <p className="text-mondoBlue font-bold mt-1">₦{item.price.toLocaleString()}</p>
                      
                      <div className="flex flex-wrap justify-between items-center mt-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-gray-300 rounded-md mr-4 mb-2 sm:mb-0">
                          <button 
                            onClick={() => handleQuantityDecrease(item.id, item.quantity)} 
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-1 text-center w-12">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityIncrease(item.id, item.quantity)} 
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        {/* Subtotal and Remove Button */}
                        <div className="flex items-center">
                          <span className="font-medium text-gray-800 mr-4">₦{(item.price * item.quantity).toLocaleString()}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/products')}
              className="flex items-center"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">TBD at checkout</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="text-gray-800 font-semibold">Total</span>
                <span className="text-mondoBlue font-bold text-xl">₦{subtotal.toLocaleString()}</span>
              </div>
            </div>
            
            <Link to="/checkout">
              <Button className="w-full bg-mondoBlue hover:bg-blue-700 h-12 text-lg">
                Proceed to Checkout
              </Button>
            </Link>
            
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
              <AlertTriangle className="text-yellow-500 mr-3 mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                Delivery options and final costs will be calculated at checkout based on your delivery address.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
