import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';

/// <reference types="google.maps" />

interface Activity {
  title: string;
  time: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description: string;
}

interface MapProps {
  activities: Activity[];
  className?: string;
}

const Map: React.FC<MapProps> = ({ activities, className = "" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Get Google Maps API key from Supabase edge function
  const getApiKey = async () => {
    try {
      console.log('[Map] Fetching Google Maps API key...');
      const res: any = await Promise.race([
        supabase.functions.invoke('google-maps-key'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('API key fetch timeout')), 8000))
      ]);
      const { data, error } = res || {};
      if (error) throw new Error(error.message);
      if (!data?.apiKey) throw new Error('Missing apiKey in response');
      console.log('[Map] API key received');
      return data.apiKey;
    } catch (err) {
      console.error('[Map] Could not fetch API key from server:', err);
      throw new Error('Google Maps API key not found');
    }
  };

  // Initialize Google Maps
  useEffect(() => {
    let retryId: number | undefined;
    let observer: IntersectionObserver | undefined;

    const attemptInit = async () => {
      console.log('[Map] Attempting init, container ref:', mapContainer.current);
      console.log('[Map] Container current exists:', !!mapContainer.current);
      
      // Try to get container via ref first, then fallback to getElementById
      let container = mapContainer.current;
      if (!container) {
        console.log('[Map] Ref not found, trying getElementById...');
        container = document.getElementById('google-map-container') as HTMLDivElement;
        if (container) {
          console.log('[Map] Found container via getElementById');
          mapContainer.current = container;
        }
      }
      
      if (!container) {
        console.log('[Map] Container element not found, retrying...');
        if (retryId) clearTimeout(retryId);
        retryId = window.setTimeout(attemptInit, 200); // Increased timeout
        return;
      }

      // Check if container is visible and has dimensions
      const rect = mapContainer.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.log('[Map] Container has no dimensions, waiting for visibility...');
        
        // Use IntersectionObserver to wait for container to become visible
        if (!observer) {
          observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && entry.boundingClientRect.width > 0 && entry.boundingClientRect.height > 0) {
              console.log('[Map] Container is now visible, initializing...');
              observer?.disconnect();
              attemptInit();
            }
          });
          observer.observe(mapContainer.current);
        }
        return;
      }

      try {
        console.log('[Map] initMap start');
        setIsLoading(true);
        setError(null);

        console.log('[Map] Requesting API key');
        const apiKey = await getApiKey();
        console.log('[Map] API key obtained, loading Google Maps JS...');

        // If already loaded (HMR, navigation), skip reloading
        if ((window as any).google?.maps) {
          console.log('[Map] Google Maps already present on window');
        } else {
          const loader = new Loader({
            apiKey,
            version: 'weekly',
            libraries: ['places']
          });

          // Timeout safeguard so we don't hang forever
          await Promise.race([
            loader.load(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Google Maps JS load timeout')), 12000))
          ]);
        }
        console.log('[Map] Google Maps JS loaded');

        // Initialize map centered on Hong Kong
        const map = new window.google.maps.Map(mapContainer.current!, {
          center: { lat: 22.3193, lng: 114.1694 },
          zoom: 11,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        console.log('[Map] Map created');
        mapRef.current = map;
        setIsMapReady(true);
        
        // If activities are already available, process them immediately after map creation
        if (activities && activities.length > 0) {
          console.log('[Map] Processing activities immediately after map creation');
          // Small delay to ensure map is fully rendered
          setTimeout(() => {
            processActivitiesOnMap(map, activities);
          }, 100);
        }
      } catch (err) {
        console.error('[Map] Failed to load Google Maps:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
      } finally {
        setIsLoading(false);
        if (retryId) clearTimeout(retryId);
      }
    };

    // Add a small delay to ensure component is fully mounted
    const initTimeout = setTimeout(() => {
      attemptInit();
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      if (retryId) clearTimeout(retryId);
      if (observer) observer.disconnect();
    };
  }, []);

  // Function to process activities and add markers to the map
  const processActivitiesOnMap = (map: any, activitiesToProcess: Activity[]) => {
    console.log('[Map] Processing activities:', activitiesToProcess);
    console.log('[Map] Activities count:', activitiesToProcess.length);
    
    // Clear existing markers and polyline
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }
    
    // Filter activities with valid coordinates
    const validActivities = activitiesToProcess.filter(activity => 
      activity.coordinates && 
      activity.coordinates.lat && 
      activity.coordinates.lng
    );

    console.log('[Map] Valid activities for mapping:', validActivities.length);
    console.log('[Map] Valid activities:', validActivities.map(a => ({ title: a.title, coordinates: a.coordinates })));

    if (validActivities.length === 0) {
      console.log('[Map] No valid activities with coordinates found - no markers will be added');
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    const path: any[] = [];

    // Add markers for each activity
    validActivities.forEach((activity, index) => {
      const { lat, lng } = activity.coordinates!;
      const position = new window.google.maps.LatLng(lat, lng);

      // Create custom marker with number
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: activity.title,
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="hsl(220 14% 96%)" stroke="hsl(220 13% 91%)" stroke-width="3"/>
              <circle cx="20" cy="20" r="15" fill="hsl(221 83% 53%)" />
              <text x="20" y="26" text-anchor="middle" fill="white" font-family="system-ui" font-size="14" font-weight="bold">${index + 1}</text>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        }
      });

      // Add info window with activity details
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family: system-ui; max-width: 200px; padding: 8px;">
            <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">${activity.title}</h4>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">${activity.time}</p>
            <p style="margin: 0; font-size: 12px; line-height: 1.4; color: #374151;">${activity.description}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
      path.push(position);
    });

    // Add route line between locations
    if (validActivities.length > 1) {
      const polyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: 'hsl(221 83% 53%)',
        strokeOpacity: 0.7,
        strokeWeight: 3,
        icons: [{
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            strokeColor: 'hsl(221 83% 53%)',
          },
          offset: '100%',
          repeat: '50px'
        }]
      });

      polyline.setMap(map);
      polylineRef.current = polyline;
    }

    // Fit map to show all markers
    if (validActivities.length > 1) {
      map.fitBounds(bounds);
      // Ensure minimum zoom level
      const listener = window.google.maps.event.addListener(map, 'bounds_changed', () => {
        if (map.getZoom() > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    } else {
      map.setCenter({ lat: validActivities[0].coordinates!.lat, lng: validActivities[0].coordinates!.lng });
      map.setZoom(14);
    }
  };

  // Update markers and routes when activities change or map becomes ready
  useEffect(() => {
    if (!mapRef.current || !activities || !isMapReady) {
      console.log('[Map] Not ready to process activities. Map:', !!mapRef.current, 'Activities:', activities?.length || 0, 'MapReady:', isMapReady);
      return;
    }
    
    console.log('[Map] Activities changed or map became ready, updating markers');
    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      processActivitiesOnMap(mapRef.current, activities);
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [activities, isMapReady]);

  return (
    <div className={`w-full h-full rounded-lg ${className}`} style={{ minHeight: '200px' }}>
      {error ? (
        <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
          <div className="text-center p-4">
            <p className="text-sm text-muted-foreground mb-2">{error}</p>
            <p className="text-xs text-muted-foreground">Check API key and referrer restrictions</p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      ) : null}
      
      <div 
        ref={(el) => {
          console.log('[Map] Setting container ref:', el);
          mapContainer.current = el;
        }}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '200px' }}
        id="google-map-container"
      />
    </div>
  );
};

export default Map;