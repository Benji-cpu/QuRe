import { useState, useEffect } from 'react';

interface UseTimeClockReturn {
  currentTime: Date;
  formattedTime: string;
  formattedDate: string;
}

export const useTimeClock = (): UseTimeClockReturn => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, []);

  // Format time as HH:MM
  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Format date as "Weekday, Month Day"
  const formattedDate = currentTime.toLocaleDateString([], { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return {
    currentTime,
    formattedTime,
    formattedDate
  };
};

export default useTimeClock;