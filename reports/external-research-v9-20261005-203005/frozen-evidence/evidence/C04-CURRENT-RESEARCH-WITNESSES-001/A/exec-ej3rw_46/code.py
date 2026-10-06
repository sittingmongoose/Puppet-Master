import json, math
def fwd(lon_deg, lat_deg):
    R = 6378137.0
    x = math.radians(lon_deg) * R
    y = math.log(math.tan(math.pi/4 + math.radians(lat_deg)/2)) * R
    return x, y
def inv(x, y):
    R = 6378137.0
    lon = math.degrees(x / R)
    lat = math.degrees(2*math.atan(math.exp(y/R)) - math.pi/2)
    return lon, lat
def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2-p1; dl = math.radians(lon2-lon1)
    a = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*R*math.asin(math.sqrt(a))
out = {}
x, y = fwd(13.4050, 52.5200)
rt = inv(x, y)
out['correct_input_lonlat'] = [13.4050, 52.5200]
out['correct_roundtrip_lonlat'] = [round(rt[0],6), round(rt[1],6)]
out['mercator_xy_m'] = [round(x,3), round(y,3)]
xs, ys = fwd(52.5200, 13.4050)
sw = inv(xs, ys)
out['swapped_input_lonlat'] = [52.5200, 13.4050]
out['swapped_result_lonlat'] = [round(sw[0],6), round(sw[1],6)]
out['axis_swap_error_km'] = round(haversine_km(52.52, 13.405, sw[1], sw[0]), 1)
print(json.dumps(out, indent=1))