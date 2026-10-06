# The portrait

`portrait.jpg` is Alexander Gardner's photograph of Abraham Lincoln, taken on 8 November 1863. It
is in the public domain: its copyright has expired, and Wikimedia Commons marks it "Public
domain".

| | |
| --- | --- |
| Title | Abraham Lincoln O-77 matte collodion print |
| Author | Alexander Gardner |
| Date | 8 November 1863 |
| Licence | Public domain |
| Page on Wikimedia Commons | https://commons.wikimedia.org/wiki/File:Abraham_Lincoln_O-77_matte_collodion_print.jpg |
| Original file | https://upload.wikimedia.org/wikipedia/commons/a/ab/Abraham_Lincoln_O-77_matte_collodion_print.jpg |
| Size of the original | 2200 × 2835 pixels, 3,898,023 bytes |
| SHA-256 of the original | `f5e79a35f74b54e0435dfc87f5956d6917725e2f5b8c17932ecf5bad704e29b2` |
| SHA-1 of the original, as Commons lists it | `61bb61bed8175f8f669c288bf1ecba02b3a33a9e` |

The committed file is the original reduced to 600 × 774 pixels with ffmpeg 8.1.2:

```bash
ffmpeg -i Abraham_Lincoln_O-77_matte_collodion_print.jpg -vf scale=600:-2 -q:v 3 portrait.jpg
```

Wikimedia sends the original only to a request that names a browser as its user agent.
