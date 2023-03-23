---
title: Mute Indicator
description: Mute Indicator so you can see if and what sources are muted.
path: Mute-Indicator
date: 2023-03-23T17:22:28.062Z
---
#﻿# Actions Import
<i-sb-import-loader import-name="Mute Indicator">
TlM0RR+LCAAAAAAABACdVF1vmzAUfZ+0/4DytEmjMpCEZJomtWmbQtd0kAZIRh+MbYgbYxhfKa3232egXfOxvSxSFHzPveeec4Pv8/t3ktSrSJbThPc+S+qnNsBhTMSpJ8tfpJuyIJLBMUWwSDKpUk7ACZA+BLVEN0p/rH+Uvspyr6uDqBA8uSj90Zwl6bn7ERDFDaEC9JGmD7EcDIEm93UEZDgeEFkZjcJQx3CsgrDjaot+lqRshPCSsbco4TBgpOErspLsxB8RKzG5zJL4iuZCbC1SQsjynZxXZweu5M4mqQgvdvpHWVKm/zGIthiyLaxzu+THKjLIcRKfttM6RlHCUZlljZQj7GjCe1M+tnix76hNwCRHGU1fmvcO0A0h6SmjFTlq3kknIRHSEDnQ0IKTz77vUuFtm/v+DUVZkidhcTK7uPP9y0zo2ibZZtj3/aovhqcBTRn7fpyjJGM0OMGM9XYJ7/c7B3VBJgluvWFvlgYxihYae8JTp7jdgutzK91i18yhexMt1cc10m4iSzkz5u5AxAZM4Pq5lZjoyqHBlD0YU7MK1G1ke2u21BywmkdpgxPBNbEE75XZ9hC1W+zZt0tXYcY5iJaeyZGS00A1n2xvxQJulXs5DJTOdHz3Up9c3+WzSbQxkWbXIo8bU1YKDeDOEz1dK/o+P1ujGD+5tVkt+ewSx06JJ4M04GcKvlAU4W/zd85W5/niIiod1aFIHT9A1QEWFzyu/bD0ZmDOZ1VAI0pqrEHX5ivP4rcUF0Ir++ayciXmsPTsClGUm9qswp75sFoM1oG7EHmIGpN83784G02u2ukynxJu0NPs0NN1fUpNDdA/3mMHCO7SuLJr7C7a/yG0wHXzPXj/0oygJE4p+8cLiAmD9byA2fHt2Fk0RB8MkT4O5FE4COV+CKE8GhEo64qGwpAMhwrWDxpvCY3WDam41vtIUaeNmHHz2UdeF8TegmqRfyypTiLH5LFp9Bb99fp4f3jXp02L9rLd764IxmCaE7yDdmBL1GV263OnVJTFsVg9r/m/fgNDauN+/wUAAA==
</i-sb-import-loader>

#﻿# Installation
In Streamer.bot select `Import` in the top left.
Drag and Drop the `Import File` into the
 `Import String`.

#﻿# Configuration
#﻿## Streamer.bot
1. Make sure you've imported the import code [above](#actions-import).
2. Link the `Mute Indicator - Mute event` action to the `InputMuteStateChanged` event in Stream Apps --> OBS.
3. Make sure that the `Server/Clients` `-->` `Websocket Server` is enabled.

#﻿## OBS Studio
1. Make a browser source in OBS Studio with the settings: `Width = 1920`, `Height = 1080`.
2. Put the URL of the widget in the Browser Source, find URL [here](#widget).

#﻿# Widget
Put this URL into OBS: https://ik1497.github.io/Extensions/Mute-Indicator/

#﻿## URL Parameters

[Customize with URL Parameters](https://ik1497.github.io/Extensions-Builder/#Mute-Indicator)