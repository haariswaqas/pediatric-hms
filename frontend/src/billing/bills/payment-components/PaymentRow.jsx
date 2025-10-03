// Payment row component
import { formatCurrency } from "./utils";
import { formatDate } from "./utils";
import { StatusBadge } from "./StatusBadge";
import { CreditCard, Calendar, User, FileText } from "lucide-react";
import { Eye } from "lucide-react";


export const PaymentRow = ({ payment, onView }) => {
    return (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">#{payment.id}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{payment.bill_details?.bill_number}</div>
            </div>
          </div>
        </td>
        
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <User className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {payment.patient_details?.first_name} {payment.patient_details?.last_name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Paid by: {payment.parent_details?.first_name} {payment.parent_details?.last_name}
              </div>
            </div>
          </div>
        </td>
  
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(payment.amount, payment.currency)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              of {formatCurrency(payment.bill_details?.total_amount, payment.currency)}
            </div>
          </div>
        </td>
  
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
              {payment.method?.replace('_', ' ')}
            </span>
          </div>
        </td>
  
        <td className="px-4 py-4 whitespace-nowrap">
          <StatusBadge status={payment.status} />
        </td>
  
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {formatDate(payment.created_at)}
            </span>
          </div>
        </td>
  
        <td className="px-4 py-4 whitespace-nowrap text-right">
          <button
            onClick={() => onView(payment.id)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
        </td>
      </tr>
    );
  };
  