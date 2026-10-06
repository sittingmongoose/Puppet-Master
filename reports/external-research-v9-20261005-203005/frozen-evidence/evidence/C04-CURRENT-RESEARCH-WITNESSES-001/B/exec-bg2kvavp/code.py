import math
def hav_km(lat1, lon1, lat2, lon2):
    R = 6371.0088
    p = math.pi/180
    a = (math.sin((lat2-lat1)*p/2)**2
         + math.cos(lat1*p)*math.cos(lat2*p)*math.sin((lon2-lon1)*p/2)**2)
    return 2*R*math.asin(math.sqrt(a))
lat, lon = 51.5, -0.12   # intended point: (lat=51.5, lon=-0.12), EPSG:4326 lat/lon
swapped_lat, swapped_lon = lon, lat   # naive importer treats (lon,lat) tuple as (lat,lon)
d = hav_km(lat, lon, swapped_lat, swapped_lon)
print("intended point  (lat,lon) =", (lat, lon))
print("swapped reading (lat,lon) =", (swapped_lat, swapped_lon))
print("great-circle distance between the two readings: %.1f km" % d)
print("scope: pure haversine arithmetic in isolated python; not a projection engine")
