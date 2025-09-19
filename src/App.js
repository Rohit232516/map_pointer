import './App.css';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useState } from "react";

const containerStyle = {
  width: '400px',
  height: '400px'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

function App() {
  const [markers, setMarkers] = useState([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyBVFd5hkH3OnkuFGN2s0VuOzUYz9g1JPOM', // replace with your API key
    libraries: ['places']
  });

  const handleMapClick = (e) => {
    const newMarker = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    console.log(newMarker);
    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div>
      <h1>Hello, World!</h1>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onClick={handleMapClick}
      >
        {markers.map((marker, index) => (
          <Marker key={index} position={marker} />
        ))}
      </GoogleMap>
    </div>
  );
}

export default App;
