import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const useHaptics = () => {
  const isNative = Capacitor.isNativePlatform();

  const light = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  };

  const medium = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  };

  const heavy = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  };

  const success = async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: 'success' as any });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  };

  const warning = async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: 'warning' as any });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  };

  const error = async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: 'error' as any });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  };

  return { light, medium, heavy, success, warning, error };
};
