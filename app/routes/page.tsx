"use client"
import dynamic from 'next/dynamic';

// Dynamically import RouteManagerPage with SSR disabled (Leaflet doesn't work with SSR)
const RouteManagerPage = dynamic(() => import('@/component/routeManager'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-lg text-gray-600">Loading Route Manager...</div>
    </div>
  )
});

export default function RouteManager() {
  return <RouteManagerPage />;
}
