(function() {

    function createMapAdapter() {

        const apiKey = String(
            window.ECOSCAN_GOOGLE_MAPS_API_KEY || ""
        ).trim();

        if (!apiKey) {
            return Promise.reject(
                new Error(
                    "Google Maps is not configured. Add a restricted API key in js/google-maps-config.js."
                )
            );
        }

        const apiReady = new Promise(
            function(resolve, reject) {

                let settled = false;
                const timeoutId = setTimeout(
                    function() {
                        fail(
                            new Error(
                                "Google Maps did not load. Check the API key, billing, and enabled APIs."
                            )
                        );
                    },
                    15000
                );

                function finish(callback, value) {
                    if (settled) {
                        return;
                    }

                    settled = true;
                    clearTimeout(timeoutId);
                    callback(value);
                }

                function fail(error) {
                    finish(reject, error);
                }

                window.__ecoGoogleMapsLoaded = function() {
                    finish(resolve);
                };
                window.gm_authFailure = function() {
                    fail(
                        new Error(
                            "Google rejected this API key. Check its website and API restrictions."
                        )
                    );
                };

                const script = document.createElement("script");
                const params = new URLSearchParams({
                    key: apiKey,
                    v: "weekly",
                    loading: "async",
                    callback: "__ecoGoogleMapsLoaded"
                });

                script.src =
                    `https://maps.googleapis.com/maps/api/js?${params}`;
                script.async = true;
                script.onerror = function() {
                    fail(
                        new Error(
                            "Could not download the Google Maps JavaScript API. Check your internet connection and API key."
                        )
                    );
                };

                document.head.appendChild(script);

            }
        );

        return apiReady.then(
            async function() {

                const [mapsLibrary, markerLibrary, placesLibrary, coreLibrary] =
                    await Promise.all([
                        google.maps.importLibrary("maps"),
                        google.maps.importLibrary("marker"),
                        google.maps.importLibrary("places"),
                        google.maps.importLibrary("core")
                    ]);

                const { Map, Circle, InfoWindow } = mapsLibrary;
                const { LatLngBounds } = coreLibrary;
                const { AdvancedMarkerElement } = markerLibrary;
                const {
                    Place
                } = placesLibrary;
                const mapId =
                    window.ECOSCAN_GOOGLE_MAP_ID || "DEMO_MAP_ID";
                let activeInfoWindow = null;

                const closeActiveInfoWindow = function() {
                    if (activeInfoWindow) {
                        activeInfoWindow.close();
                        activeInfoWindow = null;
                    }
                };

                document.addEventListener(
                    "pointerdown",
                    function(event) {
                        const infoWindowElement =
                            event.target?.closest?.(".gm-style-iw-c");

                        if (!infoWindowElement) {
                            closeActiveInfoWindow();
                        }
                    },
                    true
                );

                class GoogleMapWrapper {

                    constructor(elementId) {
                        this.googleMap = new Map(
                            document.getElementById(elementId),
                            {
                                center: { lat: 0, lng: 0 },
                                zoom: 2,
                                mapId,
                                mapTypeControl: false,
                                streetViewControl: false,
                                fullscreenControl: false,
                                gestureHandling: "cooperative",
                                zoomControl: true
                            }
                        );

                        this.googleMap.addListener(
                            "click",
                            closeActiveInfoWindow
                        );
                    }

                    setView(coordinates, zoom) {
                        this.googleMap.setCenter({
                            lat: coordinates[0],
                            lng: coordinates[1]
                        });
                        this.googleMap.setZoom(zoom);
                        return this;
                    }

                    setInteractionMode(expanded) {
                        this.googleMap.setOptions({
                            gestureHandling:
                                expanded ? "greedy" : "cooperative"
                        });
                    }

                    invalidateSize() {
                        const center = this.googleMap.getCenter();
                        google.maps.event.trigger(
                            this.googleMap,
                            "resize"
                        );
                        if (center) {
                            this.googleMap.setCenter(center);
                        }
                    }

                    on(eventName, handler) {
                        this.googleMap.addListener(
                            eventName,
                            function(event) {
                                if (!event.latLng) {
                                    return;
                                }

                                if (event.domEvent?.cancelable) {
                                    event.domEvent.preventDefault();
                                }

                                handler({
                                    latlng: {
                                        lat: event.latLng.lat(),
                                        lng: event.latLng.lng()
                                    }
                                });
                            }
                        );

                        return this;
                    }

                    removeLayer(layer) {
                        if (layer && typeof layer.remove === "function") {
                            layer.remove();
                        }
                    }

                }

                class GoogleMarkerLayer {

                    constructor() {
                        this.googleMap = null;
                        this.markers = new Set();
                    }

                    addTo(mapWrapper) {
                        this.googleMap = mapWrapper.googleMap;
                        return this;
                    }

                    addMarker(marker) {
                        marker.setMap(this.googleMap);
                        this.markers.add(marker);
                    }

                    clearLayers() {
                        for (const marker of this.markers) {
                            marker.remove();
                        }
                        this.markers.clear();
                    }

                }

                class GoogleMarker {

                    constructor(coordinates, options) {
                        this.position = {
                            lat: coordinates[0],
                            lng: coordinates[1]
                        };
                        this.googleMap = null;
                        this.popup = null;
                        this.popupContent = "";
                        this.popupOpenHandlers = [];

                        const content = document.createElement("div");
                        content.innerHTML = options?.icon?.html || "";

                        this.marker = null;

                        try {
                            this.marker = new AdvancedMarkerElement({
                                position: this.position,
                                content,
                                gmpClickable: true
                            });

                            this.marker.addEventListener(
                                "gmp-click",
                                () => this.openPopup()
                            );
                        } catch (error) {
                            console.error(
                                "Google Advanced Markers could not initialize. Check the Maps API key and Map ID.",
                                error
                            );
                        }
                    }

                    setMap(googleMap) {
                        if (!this.marker) {
                            return;
                        }

                        this.googleMap = googleMap;
                        try {
                            this.marker.map = googleMap;
                        } catch (error) {
                            this.googleMap = null;
                            console.error(
                                "Google Maps could not attach a marker:",
                                error
                            );
                        }
                    }

                    addTo(layer) {
                        if (typeof layer?.addMarker === "function") {
                            layer.addMarker(this);
                        } else if (layer?.googleMap) {
                            this.setMap(layer.googleMap);
                        } else {
                            throw new TypeError(
                                "Google marker target must be a map or marker layer."
                            );
                        }

                        return this;
                    }

                    bindPopup(content) {
                        this.popupContent = content;
                        this.popup = new InfoWindow({ content });
                        this.popup.addListener(
                            "domready",
                            () => {
                                this.popupOpenHandlers.forEach(
                                    handler => handler()
                                );
                            }
                        );
                        return this;
                    }

                    setPopupContent(content) {
                        this.popupContent = content;
                        if (this.popup) {
                            this.popup.setContent(content);
                        }
                    }

                    on(eventName, handler) {
                        if (eventName === "popupopen") {
                            this.popupOpenHandlers.push(handler);
                        }
                        return this;
                    }

                    openPopup() {
                        if (!this.marker || !this.popup || !this.googleMap) {
                            return;
                        }

                        closeActiveInfoWindow();
                        activeInfoWindow = this.popup;

                        this.popup.open({
                            map: this.googleMap,
                            anchor: this.marker,
                            shouldFocus: false
                        });
                    }

                    remove() {
                        if (!this.marker || !this.googleMap) {
                            return;
                        }

                        try {
                            this.marker.map = null;
                        } catch (error) {
                            console.warn(
                                "Google Maps could not detach a marker:",
                                error
                            );
                        }

                        this.googleMap = null;
                    }

                }

                class GoogleCircle {

                    constructor(coordinates, options) {
                        this.circle = new Circle({
                            center: {
                                lat: coordinates[0],
                                lng: coordinates[1]
                            },
                            radius: options.radius,
                            strokeColor: options.color,
                            strokeWeight: options.weight,
                            fillColor: options.fillColor,
                            fillOpacity: options.fillOpacity
                        });
                    }

                    addTo(mapWrapper) {
                        this.circle.setMap(mapWrapper.googleMap);
                        return this;
                    }

                    remove() {
                        this.circle.setMap(null);
                    }

                }

                const L = {
                    map: elementId => new GoogleMapWrapper(elementId),
                    tileLayer: () => ({
                        addTo: function() {
                            return this;
                        }
                    }),
                    layerGroup: () => new GoogleMarkerLayer(),
                    divIcon: options => options,
                    marker: (coordinates, options) =>
                        new GoogleMarker(coordinates, options),
                    circle: (coordinates, options) =>
                        new GoogleCircle(coordinates, options)
                };

                return {
                    L,
                    Place,
                    LatLngBounds
                };

            }
        );

    }

    window.EcoGoogleMapAdapter = {
        load: createMapAdapter
    };

})();
