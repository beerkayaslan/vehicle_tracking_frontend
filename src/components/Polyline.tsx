import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useRef } from "react";

interface PolylineProps {
  path: Array<{ lat: number; lng: number }>;
}

export default function Polyline({ path }: PolylineProps) {
  const map = useMap();
  const maps = useMapsLibrary("maps");
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !maps) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    const polyline = new maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            strokeColor: "black",
            fillColor: "orange",
            fillOpacity: 1,
            strokeWeight: 1,
            strokeOpacity: 1,
            scale: 4,
          },
          offset: "100%",
          repeat: "180px",
        },
      ],
    });

    polyline.setMap(map);
    polylineRef.current = polyline;

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [map, maps, path]);

  return null;
}
