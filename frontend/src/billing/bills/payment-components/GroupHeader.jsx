// Group header component
import { TrendingUp, CreditCard, User, FileText, Filter } from 'lucide-react';
export const GroupHeader = ({ groupKey, groupValue, count }) => {
    const getGroupIcon = () => {
      switch (groupKey) {
        case 'status': return <TrendingUp className="w-4 h-4" />;
        case 'method': return <CreditCard className="w-4 h-4" />;
        case 'patient': return <User className="w-4 h-4" />;
        case 'bill_number': return <FileText className="w-4 h-4" />;
        default: return <Filter className="w-4 h-4" />;
      }
    };
  
    return (
      <tr>
        <td colSpan="7" className="px-4 py-3 bg-gray-100 dark:bg-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              {getGroupIcon()}
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {groupValue || 'Unknown'} ({count} payments)
            </span>
          </div>
        </td>
      </tr>
    );
  };
  