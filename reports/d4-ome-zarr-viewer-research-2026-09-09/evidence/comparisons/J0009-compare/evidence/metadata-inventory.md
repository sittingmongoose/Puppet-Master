# Real metadata evidence

These are copied, hash-verified primary JSON receipts. No pixels were fetched or decoded. Each link preserves the original bytes. The manifest records URLs, acquisition times and hashes.

## S00016

[Primary URL](https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0062A/6001240_labels.zarr/zarr.json); [captured JSON](metadata/S00016.json); SHA256 `a8109467e29e1d40ddc5425707eb4107f0b91405fc979636407aa795c1bdce6d`.

```json
{
  "ome.version": "0.5",
  "multiscales": [
    {
      "axes": [
        {
          "name": "c",
          "type": "channel"
        },
        {
          "name": "z",
          "type": "space",
          "unit": "micrometer"
        },
        {
          "name": "y",
          "type": "space",
          "unit": "micrometer"
        },
        {
          "name": "x",
          "type": "space",
          "unit": "micrometer"
        }
      ],
      "datasets": [
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.5002025531914894,
                0.3603981534640209,
                0.3603981534640209
              ],
              "type": "scale"
            }
          ],
          "path": "0"
        },
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.5002025531914894,
                0.7207963069280418,
                0.7207963069280418
              ],
              "type": "scale"
            }
          ],
          "path": "1"
        },
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.5002025531914894,
                1.4415926138560835,
                1.4415926138560835
              ],
              "type": "scale"
            }
          ],
          "path": "2"
        }
      ]
    }
  ],
  "omero.rdefs": {
    "defaultT": 0,
    "defaultZ": 118,
    "model": "color"
  }
}
```

## S00010

[Primary URL](https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0062A/6001240_labels.zarr/0/zarr.json); [captured JSON](metadata/S00010.json); SHA256 `6e5ee3968ee682d71b057fddd7a711a585ae2670f4e516b8d7c495e6aa42e88a`.

```json
{
  "zarr_format": 3,
  "shape": [
    2,
    236,
    275,
    271
  ],
  "data_type": "uint16",
  "dimension_names": [
    "c",
    "z",
    "y",
    "x"
  ],
  "chunk_grid": {
    "configuration": {
      "chunk_shape": [
        1,
        10,
        512,
        512
      ]
    },
    "name": "regular"
  },
  "chunk_key_encoding": {
    "name": "default"
  },
  "codecs": [
    {
      "configuration": {
        "chunk_shape": [
          1,
          1,
          256,
          256
        ],
        "codecs": [
          {
            "configuration": {
              "endian": "little"
            },
            "name": "bytes"
          },
          {
            "configuration": {
              "blocksize": 0,
              "clevel": 5,
              "cname": "zstd",
              "shuffle": "shuffle",
              "typesize": 2
            },
            "name": "blosc"
          }
        ],
        "index_codecs": [
          {
            "configuration": {
              "endian": "little"
            },
            "name": "bytes"
          },
          {
            "name": "crc32c"
          }
        ]
      },
      "name": "sharding_indexed"
    }
  ],
  "fill_value": 0
}
```

## S00050

[Primary URL](https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0062A/6001240_labels.zarr/labels/zarr.json); [captured JSON](metadata/S00050.json); SHA256 `c2ffc26a18a16cc7d63b802abf99a42fd90a87711bffbeb19bd2044b296bccf1`.

```json
{
  "attributes": {
    "ome": {
      "version": "0.5",
      "labels": [
        "0"
      ]
    }
  },
  "zarr_format": 3,
  "consolidated_metadata": null,
  "node_type": "group"
}
```

## S00069

[Primary URL](https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0062A/6001240_labels.zarr/labels/0/zarr.json); [captured JSON](metadata/S00069.json); SHA256 `feaa2c5bceef982b8a6576008d9df5d293343114c3961fd73911f3c8cedb8d9b`.

```json
{
  "ome.version": "0.5",
  "multiscales": [
    {
      "datasets": [
        {
          "path": "0",
          "coordinateTransformations": [
            {
              "type": "scale",
              "scale": [
                1.0,
                0.5002025531914894,
                0.3603981534640209,
                0.3603981534640209
              ]
            }
          ]
        },
        {
          "path": "1",
          "coordinateTransformations": [
            {
              "type": "scale",
              "scale": [
                1.0,
                0.5002025531914894,
                0.7207963069280418,
                0.7207963069280418
              ]
            }
          ]
        },
        {
          "path": "2",
          "coordinateTransformations": [
            {
              "type": "scale",
              "scale": [
                1.0,
                0.5002025531914894,
                1.4415926138560835,
                1.4415926138560835
              ]
            }
          ]
        }
      ],
      "name": "0",
      "axes": [
        {
          "name": "c",
          "type": "channel"
        },
        {
          "name": "z",
          "type": "space",
          "unit": "micrometer"
        },
        {
          "name": "y",
          "type": "space",
          "unit": "micrometer"
        },
        {
          "name": "x",
          "type": "space",
          "unit": "micrometer"
        }
      ]
    }
  ],
  "omero.rdefs": null,
  "image-label.source": {
    "image": "../.."
  },
  "colors_count": 61,
  "properties_count": 61,
  "first_color": {
    "label-value": 1,
    "rgba": [
      128,
      128,
      128,
      128
    ]
  }
}
```

## S00076

[Primary URL](https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0062A/6001240_labels.zarr/labels/0/0/zarr.json); [captured JSON](metadata/S00076.json); SHA256 `6418df19cb52575942f3dfca801a0e16f894a869dd0bfab2b0142d5ba12368bb`.

```json
{
  "zarr_format": 3,
  "shape": [
    1,
    236,
    275,
    271
  ],
  "data_type": "int8",
  "dimension_names": [
    "c",
    "z",
    "y",
    "x"
  ],
  "chunk_grid": {
    "name": "regular",
    "configuration": {
      "chunk_shape": [
        1,
        59,
        69,
        136
      ]
    }
  },
  "chunk_key_encoding": {
    "name": "default",
    "configuration": {
      "separator": "/"
    }
  },
  "codecs": [
    {
      "name": "bytes"
    },
    {
      "name": "zstd",
      "configuration": {
        "level": 0,
        "checksum": false
      }
    }
  ],
  "fill_value": 0
}
```

## S00014

[Primary URL](https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/idr0090/190129.zarr/zarr.json); [captured JSON](metadata/S00014.json); SHA256 `eb17f4e8c039d2083cf2c3d8dcc7536b6df7e71658b55de517e1836eb3eb0ee5`.

```json
{
  "ome.version": "0.5",
  "plate.name": "190129",
  "plate.version": null,
  "rows": 6,
  "columns": 11,
  "listed_wells": 49,
  "field_count": 32,
  "first_declared_well": {
    "columnIndex": 6,
    "path": "B/7",
    "rowIndex": 1
  }
}
```

## S00042

[Primary URL](https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/idr0090/190129.zarr/B/7/zarr.json); [captured JSON](metadata/S00042.json); SHA256 `ebe6de44c939dc9694078c1bbf335e97a3828df3a155733ed5f205705610b6d5`.

```json
{
  "ome.version": "0.5",
  "well": {
    "images": [
      {
        "path": "0"
      },
      {
        "path": "1"
      },
      {
        "path": "2"
      },
      {
        "path": "3"
      },
      {
        "path": "4"
      },
      {
        "path": "5"
      },
      {
        "path": "6"
      },
      {
        "path": "7"
      },
      {
        "path": "8"
      },
      {
        "path": "9"
      },
      {
        "path": "10"
      },
      {
        "path": "11"
      },
      {
        "path": "12"
      },
      {
        "path": "13"
      },
      {
        "path": "14"
      },
      {
        "path": "15"
      },
      {
        "path": "16"
      },
      {
        "path": "17"
      },
      {
        "path": "18"
      },
      {
        "path": "19"
      },
      {
        "path": "20"
      },
      {
        "path": "21"
      },
      {
        "path": "22"
      },
      {
        "path": "23"
      },
      {
        "path": "24"
      },
      {
        "path": "25"
      },
      {
        "path": "26"
      },
      {
        "path": "27"
      },
      {
        "path": "28"
      },
      {
        "path": "29"
      },
      {
        "path": "30"
      },
      {
        "path": "31"
      }
    ]
  }
}
```

## S00127

[Primary URL](https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/idr0090/190129.zarr/B/7/0/zarr.json); [captured JSON](metadata/S00127.json); SHA256 `5c1b15dd3b7659d4ff5b8b83297c7d5135fd9e6fb44170b7d2f903845982450a`.

```json
{
  "ome.version": "0.5",
  "multiscales": [
    {
      "axes": [
        {
          "name": "c",
          "type": "channel"
        },
        {
          "name": "z",
          "type": "space",
          "unit": "micrometer"
        },
        {
          "name": "y",
          "type": "space",
          "unit": "micrometer"
        },
        {
          "name": "x",
          "type": "space",
          "unit": "micrometer"
        }
      ],
      "datasets": [
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.2,
                0.065,
                0.065
              ],
              "type": "scale"
            }
          ],
          "path": "0"
        },
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.2,
                0.13,
                0.13
              ],
              "type": "scale"
            }
          ],
          "path": "1"
        },
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.2,
                0.26,
                0.26
              ],
              "type": "scale"
            }
          ],
          "path": "2"
        },
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.2,
                0.52,
                0.52
              ],
              "type": "scale"
            }
          ],
          "path": "3"
        },
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.2,
                1.04,
                1.04
              ],
              "type": "scale"
            }
          ],
          "path": "4"
        },
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.2,
                2.08,
                2.08
              ],
              "type": "scale"
            }
          ],
          "path": "5"
        }
      ],
      "name": "/B/7/0"
    }
  ],
  "omero.rdefs": {
    "defaultT": 0,
    "defaultZ": 15,
    "model": "color"
  }
}
```

## S00128

[Primary URL](https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/4496763.zarr/zarr.json); [captured JSON](metadata/S00128.json); SHA256 `4851597f80f7f6b8e6b6d4c610e007fc6c1c6f2cda13b27e7c8f051ca2112aca`.

```json
{
  "ome.version": "0.5",
  "multiscales": [
    {
      "axes": [
        {
          "name": "c",
          "type": "channel"
        },
        {
          "name": "z",
          "type": "space",
          "unit": "micrometer"
        },
        {
          "name": "y",
          "type": "space"
        },
        {
          "name": "x",
          "type": "space"
        }
      ],
      "datasets": [
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.20000000000000018,
                1.0,
                1.0
              ],
              "type": "scale"
            }
          ],
          "path": "0"
        },
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.20000000000000018,
                2.0,
                2.0
              ],
              "type": "scale"
            }
          ],
          "path": "1"
        },
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.20000000000000018,
                4.0,
                4.0
              ],
              "type": "scale"
            }
          ],
          "path": "2"
        },
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.20000000000000018,
                8.0,
                8.0
              ],
              "type": "scale"
            }
          ],
          "path": "3"
        },
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.20000000000000018,
                16.0,
                16.0
              ],
              "type": "scale"
            }
          ],
          "path": "4"
        },
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.20000000000000018,
                32.0,
                32.0
              ],
              "type": "scale"
            }
          ],
          "path": "5"
        }
      ]
    }
  ],
  "omero.rdefs": {
    "defaultT": 0,
    "defaultZ": 12,
    "model": "color"
  }
}
```

## S00129

[Primary URL](https://livingobjects.ebi.ac.uk/idr/share/ome2024-ngff-challenge/idr0090/190129.zarr/ro-crate-metadata.json); [captured JSON](metadata/S00129.json); SHA256 `de0a8d495fe6b968b13e5100bde86876153d9495f9df435482fa034cadd9f1d7`.

```json
{
  "@context": [
    "https://w3id.org/ro/crate/1.1/context",
    {
      "organism_classification": "https://schema.org/taxonomicRange",
      "BioChemEntity": "https://schema.org/BioChemEntity",
      "channel": "https://www.openmicroscopy.org/Schemas/Documentation/Generated/OME-2016-06/ome_xsd.html#Channel",
      "obo": "http://purl.obolibrary.org/obo/",
      "FBcv": "http://ontobee.org/ontology/FBcv/",
      "acquisiton_method": {
        "@reverse": "https://schema.org/result",
        "@type": "@id"
      },
      "biological_entity": "https://schema.org/about",
      "biosample": "http://purl.obolibrary.org/obo/OBI_0002648",
      "preparation_method": "https://www.wikidata.org/wiki/Property:P1537",
      "specimen": "http://purl.obolibrary.org/obo/HSO_0000308"
    }
  ],
  "@graph": [
    {
      "@id": "./",
      "@type": "Dataset",
      "name": "idr0090 Ashdown Malaria",
      "description": "A machine learning approach to define antimalarial drug action from heterogeneous cell-based screens",
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "resultOf": {
        "@id": "#d75a1cc1-948c-4c3e-b37c-a57db665cca4"
      }
    },
    {
      "@id": "ro-crate-metadata.json",
      "@type": "CreativeWork",
      "conformsTo": {
        "@id": "https://w3id.org/ro/crate/1.1"
      },
      "about": {
        "@id": "./"
      }
    },
    {
      "@id": "#4369b565-ab46-4684-ba39-6ec4077d13e3",
      "@type": "biosample",
      "organism_classification": {
        "@id": "NCBI:txid36329"
      }
    },
    {
      "@id": "#3d360fd7-d5d2-404b-90ee-a93c0172f683",
      "@type": "specimen",
      "biosample": {
        "@id": "#4369b565-ab46-4684-ba39-6ec4077d13e3"
      }
    },
    {
      "@id": "#d75a1cc1-948c-4c3e-b37c-a57db665cca4",
      "@type": "image_acquisition",
      "fbbi_id": {
        "@id": "obo:FBbi_00000246"
      },
      "specimen": {
        "@id": "#3d360fd7-d5d2-404b-90ee-a93c0172f683"
      }
    }
  ]
}
```

## S00046

[Primary URL](https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr/.zattrs); [captured JSON](metadata/S00046.json); SHA256 `1e2053235c14e8a5b3e7f5c5b40eb0cae75e9264e39af2b08258c3adbc2fd7f1`.

```json
{
  "ome.version": null,
  "multiscales": [
    {
      "axes": [
        {
          "name": "c",
          "type": "channel"
        },
        {
          "name": "z",
          "type": "space",
          "unit": "micrometer"
        },
        {
          "name": "y",
          "type": "space",
          "unit": "micrometer"
        },
        {
          "name": "x",
          "type": "space",
          "unit": "micrometer"
        }
      ],
      "datasets": [
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.5002025531914894,
                0.3603981534640209,
                0.3603981534640209
              ],
              "type": "scale"
            }
          ],
          "path": "0"
        },
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.5002025531914894,
                0.7207963069280418,
                0.7207963069280418
              ],
              "type": "scale"
            }
          ],
          "path": "1"
        },
        {
          "coordinateTransformations": [
            {
              "scale": [
                1.0,
                0.5002025531914894,
                1.4415926138560835,
                1.4415926138560835
              ],
              "type": "scale"
            }
          ],
          "path": "2"
        }
      ],
      "version": "0.4"
    }
  ],
  "omero.rdefs": {
    "defaultT": 0,
    "defaultZ": 118,
    "model": "color"
  }
}
```

## S00123

[Primary URL](https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0101A/13457539.zarr/.zattrs); [captured JSON](metadata/S00123.json); SHA256 `30add669e46f820323c0d1d83a6637698f3c0c571e8724be10cd851ff9b3d8a0`.

```json
{
  "ome.version": null,
  "multiscales": [
    {
      "axes": [
        {
          "name": "t",
          "type": "time"
        },
        {
          "name": "c",
          "type": "channel"
        },
        {
          "name": "z",
          "type": "space",
          "unit": "micrometer"
        },
        {
          "name": "y",
          "type": "space",
          "unit": "micrometer"
        },
        {
          "name": "x",
          "type": "space",
          "unit": "micrometer"
        }
      ],
      "coordinateTransformations": [
        {
          "scale": [
            1.0,
            1.0,
            0.4,
            0.108335,
            0.108335
          ],
          "type": "scale"
        },
        {
          "translation": [
            0,
            0,
            1.2,
            161.59,
            176.44
          ],
          "type": "translation"
        }
      ],
      "datasets": [
        {
          "coordinateTransformations": [
            {
              "scale": [
                1,
                1,
                1,
                1,
                1
              ],
              "type": "scale"
            }
          ],
          "path": "0"
        },
        {
          "coordinateTransformations": [
            {
              "scale": [
                1,
                1,
                1,
                2,
                2
              ],
              "type": "scale"
            }
          ],
          "path": "1"
        }
      ],
      "version": "0.4"
    }
  ],
  "omero.rdefs": {
    "defaultT": 0,
    "defaultZ": 9,
    "model": "color"
  }
}
```

## S00147

[Primary URL](https://livingobjects.ebi.ac.uk/idr/zarr/test-data/v0.6dev2/idr0067/9036345_tiles.zarr/zarr.json); [captured JSON](metadata/S00147.json); SHA256 `68d2c3bdac9b5326d30a76822e6fd4c93a4fce21a387890a6c4b684950fb8ae8`.

```json
{
  "attributes": {
    "ome": {
      "coordinateTransformations": [
        {
          "input": "9036345_cropped_300_300_300_300_rot20.zarr",
          "output": "stitched",
          "type": "sequence",
          "transformations": [
            {
              "name": "affine_identity",
              "type": "affine",
              "affine": [
                [
                  1.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0
                ],
                [
                  0.0,
                  1.0,
                  0.0,
                  0.0,
                  0.0
                ],
                [
                  0.0,
                  0.0,
                  1.0,
                  0.0,
                  0.0
                ],
                [
                  0.0,
                  0.0,
                  0.0,
                  1.0,
                  0.0
                ]
              ]
            },
            {
              "name": "translate_tile_to_stitched_position",
              "type": "translation",
              "translation": [
                0,
                0,
                48.586505195354995,
                48.586505195354995
              ]
            }
          ]
        },
        {
          "input": "9036345_cropped_200_200_200_200_rot30.zarr",
          "output": "stitched",
          "type": "sequence",
          "transformations": [
            {
              "name": "affine_identity",
              "type": "affine",
              "affine": [
                [
                  1.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0
                ],
                [
                  0.0,
                  1.0,
                  0.0,
                  0.0,
                  0.0
                ],
                [
                  0.0,
                  0.0,
                  1.0,
                  0.0,
                  0.0
                ],
                [
                  0.0,
                  0.0,
                  0.0,
                  1.0,
                  0.0
                ]
              ]
            },
            {
              "name": "translate_tile_to_stitched_position",
              "type": "translation",
              "translation": [
                0,
                0,
                32.391003463569994,
                32.391003463569994
              ]
            }
          ]
        },
        {
          "input": "9036345_full.zarr",
          "output": "stitched",
          "type": "sequence",
          "transformations": [
            {
              "name": "affine_identity",
              "type": "affine",
              "affine": [
                [
                  1.0,
                  0.0,
                  0.0,
                  0.0,
                  0.0
                ],
                [
                  0.0,
                  1.0,
                  0.0,
                  0.0,
                  0.0
                ],
                [
                  0.0,
                  0.0,
                  1.0,
                  0.0,
                  0.0
                ],
                [
                  0.0,
                  0.0,
                  0.0,
                  1.0,
                  0.0
                ]
              ]
            }
          ]
        }
      ],
      "version": "0.6dev2",
      "coordinateSystems": [
        {
          "name": "stitched",
          "axes": [
            {
              "name": "t",
              "type": "time"
            },
            {
              "name": "c",
              "type": "channel"
            },
            {
              "name": "y",
              "type": "space",
              "unit": "micrometer"
            },
            {
              "name": "x",
              "type": "space",
              "unit": "micrometer"
            }
          ]
        }
      ]
    }
  },
  "zarr_format": 3,
  "consolidated_metadata": null,
  "node_type": "group"
}
```
