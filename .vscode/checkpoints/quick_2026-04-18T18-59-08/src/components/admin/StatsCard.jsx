'use client';

import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  textColor,
  trend,
  trendUp = true,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className={`${bgColor} p-3 rounded-xl`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}
          >
            {trendUp ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{title}</p>
      </div>
    </motion.div>
  );
}
