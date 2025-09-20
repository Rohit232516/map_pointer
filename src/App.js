// import './App.css';
// import { GoogleMap, useJsApiLoader, Marker, Polygon } from '@react-google-maps/api';
// import { useState } from "react";

// const containerStyle = {
//   width: '100%',
//   height: '600px'
// };

// // Center on Jharkhand
// const center = {
//   lat: 23.6102,
//   lng: 85.2799
// };

// // Approximate Jharkhand border coordinates (simplified)
// const jharkhandCoords = [
//   { lat: 25.196, lng: 87.034 },  // NE
//   { lat: 25.0, lng: 84.0 },      // NW
//   { lat: 22.0, lng: 84.0 },      // SW
//   { lat: 21.95, lng: 87.0 },     // SE
//   { lat: 25.196, lng: 87.034 }   // back to start
// ];

// function App() {
//   const [markers, setMarkers] = useState([]);

//   const { isLoaded } = useJsApiLoader({
//     googleMapsApiKey: "AIzaSyBVFd5hkH3OnkuFGN2s0VuOzUYz9g1JPOM", // your key here
//     libraries: ['places']
//   });

//   const handleMapClick = (e) => {
//     const newMarker = {
//       lat: e.latLng.lat(),
//       lng: e.latLng.lng()
//     };
//     setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
//   };

//   if (!isLoaded) return <div>Loading...</div>;

//   return (
//     <div>
//       <h1>Jharkhand Map (Border Highlight)</h1>
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={center}
//         zoom={7}
//         onClick={handleMapClick}
//       >
//         {/* Draw only border of Jharkhand */}
//         <Polygon
//           paths={jharkhandCoords}
//           options={{
//             fillOpacity: 0,       // no fill, only border
//             strokeColor: "red",   // border color (red or green)
//             strokeOpacity: 0.9,
//             strokeWeight: 3,
//           }}
//         />

//         {/* Dynamic markers on click */}
//         {markers.map((marker, index) => (
//           <Marker key={index} position={marker} />
//         ))}
//       </GoogleMap>
//     </div>
//   );
// }

// export default App;

// App.js
import './App.css';
import { GoogleMap, useJsApiLoader, Marker, Polyline, Polygon } from '@react-google-maps/api';
import { useState, useEffect } from "react";

const containerStyle = {
  width: '100%',
  height: '600px'
};

const center = { lat: 23.6102, lng: 85.2799 };

function extractPathFromGeoJSON(data) {
  if (!data) return [];
  let coords = [];

  // FeatureCollection -> use first feature
  if (data.type === 'FeatureCollection' && Array.isArray(data.features) && data.features.length) {
    const feat = data.features[0];
    if (feat && feat.geometry) {
      const geom = feat.geometry;
      if (geom.type === 'Polygon') coords = geom.coordinates[0];
      else if (geom.type === 'MultiPolygon') coords = geom.coordinates[0][0];
    }
  }
  else if (data.type === 'Feature' && data.geometry) {
    const geom = data.geometry;
    if (geom.type === 'Polygon') coords = geom.coordinates[0];
    else if (geom.type === 'MultiPolygon') coords = geom.coordinates[0][0];
  }
  else if (data.type === 'Polygon' && Array.isArray(data.coordinates)) {
    coords = data.coordinates[0];
  }
  else if (data.type === 'MultiPolygon' && Array.isArray(data.coordinates)) {
    coords = data.coordinates[0][0];
  }

  // convert [lng,lat] -> {lat, lng}
  return coords.map(([lng, lat]) => ({ lat, lng }));
}

function App() {
  const [markers, setMarkers] = useState([]);
  const [jharkhandPath, setJharkhandPath] = useState([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_API_KEY", // <-- replace
    libraries: ['places']
  });

  useEffect(() => {
    // Example GeoJSON source (public GitHub repo). If this link is blocked by CORS/use in your environment, swap for another GeoJSON URL.
    const geoJsonUrl = "https://raw.githubusercontent.com/shuklaneerajdev/IndiaStateTopojsonFiles/master/Jharkhand.geojson";

    fetch(geoJsonUrl)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch GeoJSON');
        return r.json();
      })
      .then((data) => {
        const path = extractPathFromGeoJSON(data);
        if (path && path.length) {
          setJharkhandPath(path);
        } else {
          console.warn('No polygon found in GeoJSON');
        }
      })
      .catch((err) => {
        console.error('Error loading Jharkhand GeoJSON:', err);
        // Optionally set a small fallback polygon or notify the user
      });
  }, []);

  const handleMapClick = (e) => {
    const newMarker = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarkers((prev) => [...prev, newMarker]);
  };

  if (!isLoaded) return <div>Loading map...</div>;

  // dotted / dotted-border polyline options
  const dottedOptions = {
    strokeOpacity: 0, // hide the solid stroke
    strokeWeight: 0,
    // icons array for repeating dot (small circle). Adjust scale & repeat for spacing.
    icons: [
      {
        icon: {
          // small filled circle vector path
          path: 'M 0,0 m -1,0 a 1,1 0 1,0 2,0 a 1,1 0 1,0 -2,0',
          scale: 4,
          strokeOpacity: 0,
          fillOpacity: 1
        },
        offset: '0',
        repeat: '12px'
      }
    ]
  };

  return (
    <div>
      <h1>Jharkhand (dotted border from GeoJSON)</h1>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={7} onClick={handleMapClick}>
        {/* Fill polygon (transparent) - optional */}
        {jharkhandPath.length > 2 && (
          <Polygon
            paths={jharkhandPath}
            options={{
              fillColor: 'red',
              fillOpacity: 0.03,
              strokeOpacity: 0 // hide default stroke, we'll draw dotted polyline on top
            }}
          />
        )}

        {/* Dotted border: draw a polyline around the polygon (close it by adding first point again) */}
        {jharkhandPath.length > 2 && (
          <Polyline
            path={[...jharkhandPath, jharkhandPath[0]]}
            options={{
              ...dottedOptions,
              strokeColor: 'red',
              // icons defined above already control visible dots
            }}
          />
        )}

        {/* Click markers */}
        {markers.map((m, i) => <Marker key={i} position={m} />)}
      </GoogleMap>
    </div>
  );
}

export default App;

