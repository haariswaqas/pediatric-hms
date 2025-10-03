import React from "react";
import { FileText, CheckCircle, AlertTriangle, Users } from "lucide-react";

// Analytics Cards Component
export default function AnalyticsCards({ parameters }) {
    const totalTests = parameters.length;
    const normalTests = parameters.filter(p => p.status?.toLowerCase() === 'normal').length;
    const abnormalTests = parameters.filter(p => p.status?.toLowerCase() !== 'normal').length;
    const uniquePatients = new Set(parameters.map(p => p.child_details?.name)).size;
    
    const cards = [
      {
        title: "Total Tests",
        value: totalTests,
        icon: FileText,
        color: "bg-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20"
      },
      {
        title: "Normal Results",
        value: normalTests,
        icon: CheckCircle,
        color: "bg-green-500",
        bgColor: "bg-green-50 dark:bg-green-900/20"
      },
      {
        title: "Abnormal Results",
        value: abnormalTests,
        icon: AlertTriangle,
        color: "bg-red-500",
        bgColor: "bg-red-50 dark:bg-red-900/20"
      },
      {
        title: "Unique Patients",
        value: uniquePatients,
        icon: Users,
        color: "bg-purple-500",
        bgColor: "bg-purple-50 dark:bg-purple-900/20"
      }
    ];
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className={`${card.bgColor} rounded-xl p-6 border border-slate-200 dark:border-slate-700`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{card.title}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{card.value}</p>
              </div>
              <div className={`p-3 ${card.color} rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  