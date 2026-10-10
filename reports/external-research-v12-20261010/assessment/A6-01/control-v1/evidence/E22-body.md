**NOTE:** this issue system is intended for reporting bugs and tracking progress in software
development. For all other usage and software development questions or discussion, please post a
question in our chat room: https://gitter.im/opentripplanner/OpenTripPlanner.


## Expected behavior
The server always process the latest real time update, even if the update takes longer than the polling interval (in such case some polling should be skipped)

## Observed behavior
The real-time information is lagging behind, sometimes by even 20 minutes or more.

## Version of OTP used (exact commit hash or JAR name)
2.7.0-SNAPSHOT

## Data sets in use (links to GTFS and OSM PBF files)
National Rail GTFS with GTFS-RT real-time update

## Router config and graph build config JSON
router-config-json
```json
{
  "routingDefaults": { 
    "drivingDirection": "left",
    "locale": "en_GB",
    "numItineraries": 10,
    "searchWindow": "PT6H",
    "transferSlack": "PT30S",
    "waitReluctance": 1.76,
    "accessEgress": {
      "maxDuration": "PT2H"
    },
    "walk": {
      "boardCost": 300,
      "reluctance": 1.68
    },
    "wheelchairAccessibility": {
      "trip": {
        "onlyConsiderAccessible": false,
        "unknownCost": 600,
        "inaccessibleCost": 3600
      },
      "stop": {
        "onlyConsiderAccessible": false,
        "unknownCost": 600,
        "inaccessibleCost": 3600
      },
      "elevator": {
        "onlyConsiderAccessible": false
      },
      "inaccessibleStreetReluctance": 25,
      "maxSlope": 0.08333,
      "slopeExceededReluctance": 50,
      "stairsReluctance": 25
    }
  },
  "timetableUpdates": {
    "maxSnapshotFrequency": "PT12S" 
  },
  "transit": {
    "searchThreadPoolSize": 4,
    "transferCacheRequests": [
      {
        "modes" : "WALK",
        "walk" : {
          "boardCost" : 300,
          "reluctance" : 1.68
        }
      },
      {
        "modes" : "WALK",
        "walk" : {
          "boardCost" : 0,
          "reluctance" : 1.0
        }
      }
    ]
  },
  "updaters": [
    {
      "type": "real-time-alerts",
      "url": "${NR_GTFSRT_URL}",
      "feedId" : "GB",
      "frequency": "PT1M"
    },
    {
      "type": "stop-time-updater",
      "url": "${NR_GTFSRT_URL}",
      "feedId" : "GB",
      "frequency": "PT27S"
    },
    {
      "type" : "vehicle-positions",
      "url" : "${NR_GTFSRT_URL}",
      "feedId" : "GB",
      "frequency" : "PT34S",
      "fuzzyTripMatching" : false,
      "features" : [
        "position",
        "stop-position",
        "occupancy"
      ]
    },
    {
      "type" : "vehicle-positions",
      "url" : "https://internal-proxy.servology.co.uk/dft/bus-data/gtfsrt/",
      "feedId" : "GB",
      "frequency" : "PT35S",
      "fuzzyTripMatching" : false,
      "features" : [
        "position",
        "stop-position",
        "occupancy"
      ]
    }
  ]
}
```

## Steps to reproduce the problem
Run OpenTripPlanner with a large dataset on a slow server with a polling interval short enough.

## Additional information
The final statement of the updater is `saveResultOnGraph.execute(runnable);` which is a future. As a result the updater finishes immediately while the `GraphUpdateManager` is still doing work.

```java
  @Override
  public Future<?> execute(GraphWriterRunnable runnable) {
    return scheduler.submit(() -> {
      try {
        runnable.run(realtimeUpdateContext);
      } catch (Exception e) {
        LOG.error("Error while running graph writer {}:", runnable.getClass().getName(), e);
      }
    });
  }
```

As processing GTFS-RT entities is fast, but updating the graph is slow, the updater finishes right after processing the entities and start another polling after the specified time delay, and the scheduler is accumulated with tasks to update the graph from the previous process results of previous GTFS-RT data.

Therefore, the expected behaviour of waiting after finishing update before the polling the next does not happen. 

The same problem applies to all updaters.
