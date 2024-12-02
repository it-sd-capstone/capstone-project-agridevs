import React from 'react';
import ReactMapGL, { Layer, Source } from 'react-map-gl';
import { useLocation, useNavigate } from 'react-router-dom';
import { MAPBOX_TOKEN } from '../config';
import 'mapbox-gl/dist/mapbox-gl.css';
import './styles/MapView.css';

function MapView() {
    const location = useLocation();
    const navigate = useNavigate();
    const { profitData } = location.state || {};

    if (!profitData) {
        // Redirect to upload page if no data is available
        navigate('/');
        return null;
    }

    // Calculate min and max profit
    const profitValues = profitData.map((d) => d.profit);
    const minProfit = Math.min(...profitValues);
    const maxProfit = Math.max(...profitValues);

    // Set initial viewport
    const initialLatitude = profitData[0].latitude;
    const initialLongitude = profitData[0].longitude;

    const [viewport, setViewport] = React.useState({
        latitude: initialLatitude,
        longitude: initialLongitude,
        zoom: 13,
        bearing: 0,
        pitch: 0,
    });

    const geojson = {
        type: 'FeatureCollection',
        features: profitData.map((data) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [data.longitude, data.latitude],
            },
            properties: {
                profit: data.profit,
            },
        })),
    };

    return (
        <div className="map-view">
            <ReactMapGL
                {...viewport}
                width="100%"
                height="600px"
                onViewportChange={(nextViewport) => setViewport(nextViewport)}
                mapboxApiAccessToken={MAPBOX_TOKEN}
            >
                <Source id="profit-data" type="geojson" data={geojson}>
                    <Layer
                        id="profit-heatmap"
                        type="heatmap"
                        paint={{
                            'heatmap-weight': [
                                'interpolate',
                                ['linear'],
                                ['get', 'profit'],
                                minProfit,
                                0,
                                maxProfit,
                                1,
                            ],
                            'heatmap-intensity': 1,
                            'heatmap-radius': 20,
                            'heatmap-color': [
                                'interpolate',
                                ['linear'],
                                ['heatmap-density'],
                                0,
                                'red',
                                0.5,
                                'yellow',
                                1,
                                'green',
                            ],
                        }}
                    />
                </Source>
            </ReactMapGL>
        </div>
    );
}

export default MapView;
