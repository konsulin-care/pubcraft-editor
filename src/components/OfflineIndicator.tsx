
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WifiOff, Wifi } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <Card className="bg-orange-50 border-orange-200 mb-4">
      <CardContent className="p-3">
        <div className="flex items-center space-x-2">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <span className="text-sm text-orange-800 font-medium">
            You're offline - Your work is being saved locally
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfflineIndicator;
