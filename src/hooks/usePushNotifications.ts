import { useEffect, useState } from 'react';
import { PushNotifications, PermissionStatus } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [permissionStatus, setPermissionStatus] = useState<string>('prompt');
  const { toast } = useToast();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const initPushNotifications = async () => {
      try {
        // Request permission
        const result = await PushNotifications.requestPermissions();
        setPermissionStatus(result.receive as string);

        if (result.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          await PushNotifications.register();
        }

        // On registration success
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token:', token.value);
          // TODO: Send token to your backend
        });

        // On registration error
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration:', error);
        });

        // Show notification when app is in foreground
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          toast({
            title: notification.title || 'New notification',
            description: notification.body,
          });
        });

        // Handle notification tap
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed:', notification);
          // TODO: Navigate to relevant screen
        });
      } catch (error) {
        console.error('Push notification setup error:', error);
      }
    };

    initPushNotifications();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [toast]);

  return { permissionStatus };
};
