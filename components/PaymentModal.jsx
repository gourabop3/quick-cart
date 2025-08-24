"use client";
import { useState, useEffect } from "react";
import { XMarkIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function PaymentModal({ isOpen, onClose, orderData, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && orderData) {
      initializePayment();
    }
  }, [isOpen, orderData]);

  const initializePayment = async () => {
    if (!orderData?.payment?.orderId) {
      toast.error("Payment order not found");
      return;
    }

    setLoading(true);

    try {
      const options = {
        key: orderData.payment.key,
        amount: orderData.payment.amount,
        currency: orderData.payment.currency,
        name: "QuickCart",
        description: `Order #${orderData.order.orderId}`,
        order_id: orderData.payment.orderId,
        handler: async function (response) {
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999"
        },
        notes: {
          address: "QuickCart Office"
        },
        theme: {
          color: "#ea580c"
        },
        modal: {
          ondismiss: function() {
            onClose();
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      setLoading(true);
      
      const verifyResponse = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const result = await verifyResponse.json();

      if (result.success) {
        toast.success("Payment successful!");
        onPaymentSuccess(result.order);
        onClose();
      } else {
        toast.error("Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Payment verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">#{orderData?.order?.orderId?.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">₹{orderData?.order?.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">UPI</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <CreditCardIcon className="h-6 w-6 text-orange-600" />
            <div>
              <h4 className="font-medium text-orange-900">UPI Payment</h4>
              <p className="text-sm text-orange-700">
                Complete your payment using UPI, cards, or digital wallets
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Initializing payment...</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={initializePayment}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
}