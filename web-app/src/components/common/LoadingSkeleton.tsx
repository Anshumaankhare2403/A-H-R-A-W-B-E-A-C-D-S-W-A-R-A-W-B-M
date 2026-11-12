import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={cn(
            'animate-pulse rounded bg-[#131b28] border border-[#1b2538]',
            className
          )}
        />
      ))}
    </>
  );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 rounded-md border border-[#1b2333] bg-[#0d1118]', className)}>
    <Skeleton className="h-3.5 w-1/3 mb-3" />
    <Skeleton className="h-7 w-1/2 mb-2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export default Skeleton;
