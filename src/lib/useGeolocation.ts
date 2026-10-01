import { useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error';

export interface UseGeolocationResult {
  status: GeoStatus;
  coordinates: GeoCoordinates | null;
  errorMessage: string | null;
  requestLocation: () => Promise<GeoCoordinates | null>;
}

export function useGeolocation(): UseGeolocationResult {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [coordinates, setCoordinates] = useState<GeoCoordinates | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestLocation = useCallback(async (): Promise<GeoCoordinates | null> => {
    setStatus('requesting');
    setErrorMessage(null);

    try {
      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        const permissionState = await Geolocation.requestPermissions();
        const granted =
          permissionState.location === 'granted' || permissionState.coarseLocation === 'granted';

        if (!granted) {
          setStatus('denied');
          return null;
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 12000,
        });

        const coords: GeoCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setCoordinates(coords);
        setStatus('granted');
        return coords;
      }

      if (!('geolocation' in navigator)) {
        setStatus('unavailable');
        return null;
      }

      return await new Promise<GeoCoordinates | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords: GeoCoordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            };
            setCoordinates(coords);
            setStatus('granted');
            resolve(coords);
          },
          (err) => {
            setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error');
            setErrorMessage(err.message);
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
        );
      });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Location request failed');
      return null;
    }
  }, []);

  return { status, coordinates, errorMessage, requestLocation };
}
