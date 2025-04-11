"use client";

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TabItemProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function TabItem({ icon, label, isActive, onClick }: TabItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative w-12 h-12">
      <motion.div
        className={cn(
          "absolute right-0 flex items-center cursor-pointer py-3 pl-4 rounded-l-md",
          isActive 
            ? "bg-gray-800 text-white shadow-sm" 
            : "bg-white text-gray-700 border border-r-0 border-gray-200 hover:bg-gray-100"
        )}
        initial={{ width: "48px" }}
        animate={{ 
          width: isHovered ? "auto" : "48px",
        }}
        transition={{ duration: 0.15 }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-3 whitespace-nowrap">
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              transition={{ duration: 0.15 }}
              className="text-sm font-medium"
            >
              {label}
            </motion.span>
          )}
          
          <div className={cn("transition-all", !isHovered && "ml-2")}>
            {icon}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 