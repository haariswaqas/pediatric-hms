import { useMemo } from "react";
import { formatCurrency } from "./utils";
import { DollarSign, TrendingUp, Calendar, Users } from "lucide-react";



// Summary cards component
export const SummaryCards = ({ payments }) => {
    const stats = useMemo(() => {
      const total = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      const completed = payments.filter(p => p.status === 'completed').length;
      const pending = payments.filter(p => p.status === 'pending').length;
      const uniquePatients = new Set(payments.map(p => p.patient_details?.first_name + ' ' + p.patient_details?.last_name)).size;
      
      return { total, completed, pending, uniquePatients };
    }, [payments]);
  
    const cards = [
      {
        title: "Total Revenue",
        value: formatCurrency(stats.total),
        icon: DollarSign,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/20"
      },
      {
        title: "Completed",
        value: stats.completed,
        icon: TrendingUp,
        color: "text-blue-600 dark:text-blue-400", 
        bg: "bg-blue-50 dark:bg-blue-900/20"
      },
      {
        title: "Pending",
        value: stats.pending,
        icon: Calendar,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/20"
      },
      {
        title: "Unique Patients",
        value: stats.uniquePatients,
        icon: Users,
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-50 dark:bg-purple-900/20"
      }
    ];
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  