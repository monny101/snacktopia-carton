
import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Phone, MapPin, ClipboardCheck, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface OrderDetails {
  orderNumber: string;
  total: number;
  deliveryMethod: 'delivery' | 'pickup';
  items: OrderItem[];
}

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const orderDetails = location.state as OrderDetails | null;
  
  // If no order details, redirect to home
  if (!orderDetails) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-mondoBlue text-white p-6 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-lg">Thank you for your order!</p>
          </div>
          
          <div className="p-6">
            {/* Order Details */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Order Details</h2>
                <span className="text-gray-500">#{orderDetails.orderNumber}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Order Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start mb-4">
                    <ClipboardCheck className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Order Status</p>
                      <p className="text-green-600">Processing</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <ShoppingBag className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Delivery Method</p>
                      <p>{orderDetails.deliveryMethod === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Delivery/Pickup Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  {orderDetails.deliveryMethod === 'delivery' ? (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Delivery Address</p>
                        <p>123 Main Street</p>
                        <p>Lagos, Lagos State</p>
                        <p className="text-gray-500 text-sm mt-1">Estimated delivery: 1-3 business days</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <Home className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Pickup Location</p>
                        <p>Mondo Carton King Main Store</p>
                        <p>123 Market Street, Ikeja</p>
                        <p>Lagos, Nigeria</p>
                        <p className="text-gray-500 text-sm mt-1">Ready for pickup: Within 24 hours</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              
              <div className="border rounded-lg overflow-hidden">
                {orderDetails.items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center p-4 border-b last:border-b-0"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                        <p className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Payment Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₦{orderDetails.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>
                      {orderDetails.deliveryMethod === 'pickup' ? 'Free' : '₦1,500.00'}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-mondoBlue">
                      ₦{(orderDetails.total + (orderDetails.deliveryMethod === 'pickup' ? 0 : 1500)).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-start">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Payment Method</p>
                    <p>Cash on {orderDetails.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Support Information */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <p className="font-medium text-mondoBlue mb-2">Need Help?</p>
              <p className="text-gray-700 text-sm">
                If you have any questions about your order, please contact our customer service team.
              </p>
              <div className="mt-2 text-sm">
                <p>Email: <a href="mailto:support@mondocartonking.com" className="text-mondoBlue hover:underline">support@mondocartonking.com</a></p>
                <p>Phone: +234 123 4567 890</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button className="w-full sm:w-auto bg-mondoBlue hover:bg-blue-700">
                  Continue Shopping
                </Button>
              </Link>
              <Button variant="outline" className="w-full sm:w-auto">
                Track Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
