import math
def hav_km(lat1, lon1, lat2, lon2):
    R = 6371.0088
    p = math.pi/180
    a = (math.sin((lat2-lat1)*p/2)**2
         + math.cos(lat1*p)*math.cos(lat2*p)*math.sin((lon2-lon1)*p/2)**2)
    return 2*R*math.asin(math.sqrt(a))
lat1, lon1, lat2, lon2 = 0.0, 179.99, 0.0, -179.99
n = 1000
naive = 0.0
for i in range(n):
    t1, t2 = i/n, (i+1)/n
    naive += hav_km(lat1, lon1+(lon2-lon1)*t1, lat1, lon1+(lon2-lon1)*t2)
wrapped = 0.0
for i in range(n):
    t1, t2 = i/n, (i+1)/n
    l1 = lon1 + ((lon2+360.0)-lon1)*t1   # continue eastward past the antimeridian
    l2 = lon1 + ((lon2+360.0)-lon1)*t2
    wrapped += hav_km(lat1, l1, lat1, l2)
print("track endpoint A (lat,lon)=(0.0, 179.99); endpoint B (lat,lon)=(0.0, -179.99)")
print("naive linear longitude path (through lon=0): %.1f km" % naive)
print("short antimeridian-crossing path:            %.1f km" % wrapped)
print("ratio naive/wrapped: %.1fx" % (naive/wrapped))
print("scope: arithmetic only; demonstrates discontinuity magnitude, not renderer behavior")
