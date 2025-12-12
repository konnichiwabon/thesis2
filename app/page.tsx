"use client"
import CardBox from "@/component/cardBox";
import dynamic from 'next/dynamic';

// Dynamically import MapComponent with SSR disabled
const MapComponent = dynamic(() => import('@/component/map'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
});

export default function Home() {
  return (
    <div>
      <MapComponent coords={[10.335682729765237, 123.9112697095374]} />
      <div>
        
      </div>
    </div>
  )
}
