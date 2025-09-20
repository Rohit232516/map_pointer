import './App.css';
import { GoogleMap, useJsApiLoader, Marker, Polygon } from '@react-google-maps/api';
import { useState } from "react";

const containerStyle = {
  width: '100%',
  height: '600px'
};

// Center on Jharkhand
const center = {
  lat: 23.6102,
  lng: 85.2799
};

// Approximate Jharkhand border coordinates (simplified)
const jharkhandCoords = [
  { lat: 25.196, lng: 87.034 },  // NE
  { lat: 25.0, lng: 84.0 },      // NW
  { lat: 22.0, lng: 84.0 },      // SW
  { lat: 21.95, lng: 87.0 },     // SE
  { lat: 25.196, lng: 87.034 }   // back to start
];

// Predefined cities
const cities = [
  { name: "Ranchi", lat: 23.3441, lng: 85.3096, special: true },
  { name: "Bokaro", lat: 23.6693, lng: 86.1511, special: true },
  { name: "Dhanbad", lat: 23.7957, lng: 86.4304, special: false },
  { name: "Jamshedpur", lat: 22.8046, lng: 86.2029, special: false },
  { name: "Hazaribagh", lat: 23.9966, lng: 85.3616, special: false }
];

function App() {
  const [markers, setMarkers] = useState([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBVFd5hkH3OnkuFGN2s0VuOzUYz9g1JPOM", // your key here
    libraries: ['places']
  });

  const handleMapClick = (e) => {
    const newMarker = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div>
      <h1>Jharkhand Map (Border Highlight + Cities)</h1>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={7}
        onClick={handleMapClick}
      >
        {/* Jharkhand border */}
        <Polygon
          paths={jharkhandCoords}
          options={{
            fillOpacity: 0,
            strokeColor: "red",
            strokeOpacity: 0.9,
            strokeWeight: 3,
          }}
        />

        {/* Predefined city markers */}
        {cities.map((city, index) => (
          <Marker 
            key={index} 
            position={{ lat: city.lat, lng: city.lng }}
            label={city.name}
            icon={{
              url: city.special
                ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" // special = blue
                : "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // default = red
            }}
          />
        ))}

        {/* User-added markers on click */}
        {markers.map((marker, index) => (
          <Marker key={index} position={marker} />
        ))}
      </GoogleMap>
    </div>
  );
}

export default App;
