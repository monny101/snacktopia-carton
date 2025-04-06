
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2, MapPin, CreditCard, TruckIcon, Store } from 'lucide-react';

type DeliveryMethod = 'delivery' | 'pickup';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  phoneNumber: string;
  isDefault: boolean;
}

// Mock addresses
const savedAddresses: Address[] = [
  {
    id: '1',
    name: 'Home',
    street: '123 Main Street',
    city: 'Lagos',
    state: 'Lagos State',
    phoneNumber: '+234 123 4567 890',
    isDefault: true
  },
  {
    id: '2',
    name: 'Office',
    street: '456 Business Avenue',
    city: 'Lagos',
    state: 'Lagos State',
    phoneNumber: '+234 987 6543 210',
    isDefault: false
  }
];

const Checkout: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(savedAddresses[0].id);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // New address form state
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    phoneNumber: ''
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate new address form
  const validateAddressForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newAddress.name.trim()) errors.name = 'Address name is required';
    if (!newAddress.street.trim()) errors.street = 'Street address is required';
    if (!newAddress.city.trim()) errors.city = 'City is required';
    if (!newAddress.state.trim()) errors.state = 'State is required';
    if (!newAddress.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add address form submission
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateAddressForm()) {
      // Here we would normally send this to the backend
      // For demo, we'll just hide the form
      setShowAddAddressForm(false);
      
      // Reset form
      setNewAddress({
        name: '',
        street: '',
        city: '',
        state: '',
        phoneNumber: ''
      });
    }
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (deliveryMethod === 'delivery' && !selectedAddressId && !isAuthenticated) {
      setFormErrors({ general: 'Please select a delivery address or create a new one' });
      return;
    }
    
    setProcessing(true);
    
    // Simulate API call to create order
    setTimeout(() => {
      // This would send order data to backend in production
      console.log('Order placed', {
        items,
        total: subtotal,
        deliveryMethod,
        addressId: deliveryMethod === 'delivery' ? selectedAddressId : null
      });
      
      setProcessing(false);
      clearCart();
      navigate('/order-confirmation', { 
        state: { 
          orderNumber: 'MCK' + Math.floor(100000 + Math.random() * 900000),
          total: subtotal,
          deliveryMethod,
          items
        } 
      });
    }, 2000);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checkout Form */}
        <div className="lg:col-span-2">
          {/* Delivery Method */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Method</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDeliveryMethod('delivery')}
                className={`flex items-center p-4 border rounded-lg ${
                  deliveryMethod === 'delivery' 
                    ? 'border-mondoBlue bg-mondoBlue/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  deliveryMethod === 'delivery' ? 'border-mondoBlue' : 'border-gray-400'
                }`}>
                  {deliveryMethod === 'delivery' && (
                    <div className="w-3 h-3 rounded-full bg-mondoBlue"></div>
                  )}
                </div>
                <div className="flex-1 flex items-center">
                  <TruckIcon className={`mr-3 ${deliveryMethod === 'delivery' ? 'text-mondoBlue' : 'text-gray-500'}`} />
                  <div>
                    <p className={`font-medium ${deliveryMethod === 'delivery' ? 'text-mondoBlue' : 'text-gray-700'}`}>
                      Home Delivery
                    </p>
                    <p className="text-sm text-gray-500">Delivered to your address</p>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`flex items-center p-4 border rounded-lg ${
                  deliveryMethod === 'pickup' 
                    ? 'border-mondoBlue bg-mondoBlue/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  deliveryMethod === 'pickup' ? 'border-mondoBlue' : 'border-gray-400'
                }`}>
                  {deliveryMethod === 'pickup' && (
                    <div className="w-3 h-3 rounded-full bg-mondoBlue"></div>
                  )}
                </div>
                <div className="flex-1 flex items-center">
                  <Store className={`mr-3 ${deliveryMethod === 'pickup' ? 'text-mondoBlue' : 'text-gray-500'}`} />
                  <div>
                    <p className={`font-medium ${deliveryMethod === 'pickup' ? 'text-mondoBlue' : 'text-gray-700'}`}>
                      Store Pickup
                    </p>
                    <p className="text-sm text-gray-500">Pick up at our store</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Delivery Address - Only show if delivery method is delivery */}
          {deliveryMethod === 'delivery' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
              
              {/* If user is not authenticated, show login prompt */}
              {!isAuthenticated ? (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
                  <p className="text-gray-700 mb-2">Please login to use your saved addresses or continue as guest.</p>
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/login', { state: { redirectTo: '/checkout' } })}
                    >
                      Login
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => setShowAddAddressForm(true)}
                    >
                      Continue as Guest
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Saved Addresses */}
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-3">Saved Addresses</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedAddresses.map((address) => (
                        <div 
                          key={address.id}
                          onClick={() => setSelectedAddressId(address.id)}
                          className={`border rounded-lg p-4 cursor-pointer ${
                            selectedAddressId === address.id 
                              ? 'border-mondoBlue bg-mondoBlue/5' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className={`w-5 h-5 rounded-full border-2 mt-0.5 mr-3 flex-shrink-0 flex items-center justify-center ${
                              selectedAddressId === address.id ? 'border-mondoBlue' : 'border-gray-400'
                            }`}>
                              {selectedAddressId === address.id && (
                                <div className="w-3 h-3 rounded-full bg-mondoBlue"></div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium">{address.name}</p>
                                {address.isDefault && (
                                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 py-0.5 px-2 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 text-sm mt-1">{address.street}</p>
                              <p className="text-gray-700 text-sm">
                                {address.city}, {address.state}
                              </p>
                              <p className="text-gray-700 text-sm mt-1">{address.phoneNumber}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* Add New Address Button */}
              {!showAddAddressForm && (
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setShowAddAddressForm(true)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Add New Address
                </Button>
              )}
              
              {/* Add New Address Form */}
              {showAddAddressForm && (
                <div className="mt-4 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">Add New Address</h3>
                  <form onSubmit={handleAddAddress}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {/* Address Name */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Address Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          placeholder="e.g., Home, Office"
                          value={newAddress.name}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md ${
                            formErrors.name ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring-1 focus:ring-mondoBlue`}
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                        )}
                      </div>
                      
                      {/* Phone Number */}
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          id="phoneNumber"
                          name="phoneNumber"
                          placeholder="e.g., +234 123 4567 890"
                          value={newAddress.phoneNumber}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md ${
                            formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring-1 focus:ring-mondoBlue`}
                        />
                        {formErrors.phoneNumber && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.phoneNumber}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Street Address */}
                    <div className="mb-4">
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <textarea
                        id="street"
                        name="street"
                        rows={2}
                        placeholder="Enter your full street address"
                        value={newAddress.street}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          formErrors.street ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-1 focus:ring-mondoBlue`}
                      />
                      {formErrors.street && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.street}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {/* City */}
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          placeholder="Enter city"
                          value={newAddress.city}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md ${
                            formErrors.city ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring-1 focus:ring-mondoBlue`}
                        />
                        {formErrors.city && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>
                        )}
                      </div>
                      
                      {/* State */}
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          placeholder="Enter state"
                          value={newAddress.state}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md ${
                            formErrors.state ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring-1 focus:ring-mondoBlue`}
                        />
                        {formErrors.state && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.state}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <Button 
                        type="button" 
                        variant="ghost"
                        onClick={() => setShowAddAddressForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-mondoBlue hover:bg-blue-700">
                        Save Address
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Error message for delivery method */}
              {formErrors.general && (
                <p className="mt-2 text-sm text-red-500">{formErrors.general}</p>
              )}
            </div>
          )}

          {/* Pickup Information - Only show if delivery method is pickup */}
          {deliveryMethod === 'pickup' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Pickup Information</h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="font-medium mb-2">Mondo Carton King Main Store</h3>
                <div className="flex items-start">
                  <MapPin className="mr-2 h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700">123 Market Street, Ikeja</p>
                    <p className="text-gray-700">Lagos, Nigeria</p>
                    <p className="text-gray-500 mt-1 text-sm">Open: Monday - Saturday, 8:00 AM - 6:00 PM</p>
                  </div>
                </div>
                
                <div className="mt-4 bg-white border border-gray-200 rounded-md p-3">
                  <p className="text-gray-700 text-sm">
                    <span className="font-medium">Note:</span> Please bring a valid ID for order pickup. Your order will be ready within 24 hours after confirmation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
              <CreditCard className="text-yellow-500 mr-3 mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-700 font-medium">Cash on Delivery/Pickup</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Payment will be collected at the time of delivery or pickup. Please have the exact amount ready.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            {/* Order Items */}
            <div className="max-h-60 overflow-y-auto mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center py-3 border-b border-gray-200 last:border-b-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden mr-3 flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium line-clamp-1">{item.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                      <p className="text-mondoBlue font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Cost Breakdown */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">
                  {deliveryMethod === 'pickup' ? 'Free' : '₦1,500.00'}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="text-gray-800 font-semibold">Total</span>
                <span className="text-mondoBlue font-bold text-xl">
                  ₦{(subtotal + (deliveryMethod === 'pickup' ? 0 : 1500)).toLocaleString()}
                </span>
              </div>
            </div>
            
            {/* Checkout Button */}
            <Button 
              onClick={handlePlaceOrder} 
              disabled={processing}
              className="w-full bg-mondoBlue hover:bg-blue-700 h-12 text-lg flex items-center justify-center"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Place Order'
              )}
            </Button>
            
            <div className="mt-6 text-center text-gray-500 text-sm">
              By placing your order, you agree to our{' '}
              <a href="#" className="text-mondoBlue hover:underline">Terms and Conditions</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
