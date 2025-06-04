import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  Book,
  DollarSign,
  IndianRupee,
} from "lucide-react";
import { formatDate } from "../utils/formatDate";

function StudentPaymentDetails() {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getPaymentDetails() {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}student/payment-details`,
          {
            withCredentials: true,
          }
        );
        setPaymentData(res.data.data);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to get payment details. Please try again later"
        );
      } finally {
        setLoading(false);
      }
    }
    getPaymentDetails();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!paymentData || paymentData.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg shadow">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          No payment records found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          There are no payment details available for your account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="bg-indigo-600 px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-white">
          Payment Details
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-indigo-100">
          Your course payment information
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentData.map((payment, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {payment.course?.thumbnail && (
                <div className="w-full h-40 bg-gray-100">
                  <img
                    src={payment.course.thumbnail}
                    alt={payment.course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h4 className="text-base font-medium text-gray-900 truncate">
                    {payment.course?.title || "Unnamed Course"}
                  </h4>
                  <div className="flex items-center ml-2">
                    {payment.status === "successful" ? (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-sm">
                    <CreditCard className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 capitalize">
                      {payment.paymentMethod}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">
                      {formatDate(payment.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <IndianRupee className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">Amount:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {payment.amount}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === "successful"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {payment.status === "successful"
                        ? "Successful"
                        : "Failed"}
                    </span>
                    <span className="ml-auto text-xs text-gray-500">
                      ID: {payment.razorpay_payment_id || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentPaymentDetails;
