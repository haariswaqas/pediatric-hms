import React from "react";
import { TestTube, Clock, CheckCircle, AlertTriangle, Users, Calendar } from "lucide-react";

export default function StatCard({ labRequestItems }) {
    const getStatusCounts = () => {
        const counts = {
            total: labRequestItems.length,
            ordered: 0,
            processing: 0,
            completed: 0,
            collected: 0,
            cancelled: 0,
            rejected: 0,
            verified: 0
        };

        labRequestItems.forEach(item => {
            const status = item.lab_request_details?.status || item.status;
            switch (status) {
                case 'ORDERED':
                    counts.ordered++;
                    break;
                case 'PROCESSING':
                    counts.processing++;
                    break;
                case 'COMPLETED':
                    counts.completed++;
                    break;
                case 'COLLECTED':
                    counts.collected++;
                    break;
                case 'CANCELLED':
                    counts.cancelled++;
                    break;
                case 'REJECTED':
                    counts.rejected++;
                    break;
                case 'VERIFIED':
                    counts.verified++;
                    break;
            }
        });

        return counts;
    };

    const getPriorityStats = () => {
        const priorities = {
            routine: 0,
            urgent: 0,
            stat: 0
        };

        labRequestItems.forEach(item => {
            const priority = item.lab_request_details?.priority || 'nothing is here';
            priorities[priority.toLowerCase()] = (priorities[priority.toLowerCase()] || 0) + 1;
        });

        return priorities;
    };

    const getRecentRequests = () => {
        const today = new Date();
        const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return labRequestItems.filter(item => {
            const requestDate = new Date(item.lab_request_details?.date_requested);
            return requestDate >= last7Days;
        }).length;
    };

    const counts = getStatusCounts();
    const priorities = getPriorityStats();
    const recentRequests = getRecentRequests();

    const stats = [
        {
            title: "Total Requests",
            value: counts.total,
            icon: TestTube,
            color: "bg-blue-500",
            lightColor: "bg-blue-50 dark:bg-blue-900/20",
            textColor: "text-blue-600 dark:text-blue-400"
        },
        {
            title: "Processing",
            value: counts.processing + counts.ordered,
            icon: Clock,
            color: "bg-yellow-500",
            lightColor: "bg-yellow-50 dark:bg-yellow-900/20",
            textColor: "text-yellow-600 dark:text-yellow-400"
        },
        {
            title: "Completed",
            value: counts.completed + counts.verified,
            icon: CheckCircle,
            color: "bg-green-500",
            lightColor: "bg-green-50 dark:bg-green-900/20",
            textColor: "text-green-600 dark:text-green-400"
        },
        {
            title: "Urgent Priority",
            value: priorities.urgent,
            icon: AlertTriangle,
            color: "bg-red-500",
            lightColor: "bg-red-50 dark:bg-red-900/20",
            textColor: "text-red-600 dark:text-red-400"
        },
        {
            title: "Routine Priority",
            value: priorities.routine,
            icon: Users,
            color: "bg-purple-500",
            lightColor: "bg-purple-50 dark:bg-purple-900/20",
            textColor: "text-purple-600 dark:text-purple-400"
        },
        {
            title: "Stat Priority",
            value: priorities.stat,
            icon: Calendar,
            color: "bg-indigo-500",
            lightColor: "bg-indigo-50 dark:bg-indigo-900/20",
            textColor: "text-indigo-600 dark:text-indigo-400"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    {stat.title}
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`${stat.lightColor} p-3 rounded-lg`}>
                                <Icon className={`h-6 w-6 ${stat.textColor}`} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}