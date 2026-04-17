![Publish Status](https://github.com/ether/ep_padlist2/workflows/Node.js%20Package/badge.svg) [![Backend Tests Status](https://github.com/ether/ep_padlist2/actions/workflows/test-and-release.yml/badge.svg)](https://github.com/ether/ep_padlist2/actions/workflows/test-and-release.yml)

# Pad List / Index for Etherpad

[Etherpad](https://etherpad.org/) plugin to display a list of all
pads.

The list is available at `/list`

This is a fork of [ep_padlist](https://github.com/esripdx/ep_padlist),
which is no longer maintained.

### Installation

To install the current published package:

```shell
cd /path/to/etherpad
npm i ep_padlist2
```

To install the latest commit in Git:

```shell
cd /path/to/etherpad
npm i ether/ep_padlist2
```

## Installation

Install from the Etherpad admin UI (**Admin → Manage Plugins**,
search for `ep_padlist2` and click *Install*), or from the Etherpad
root directory:

```sh
pnpm run plugins install ep_padlist2
```

> ⚠️ Don't run `npm i` / `npm install` yourself from the Etherpad
> source tree — Etherpad tracks installed plugins through its own
> plugin-manager, and hand-editing `package.json` can leave the
> server unable to start.

After installing, restart Etherpad.

### License

Copyright 2013 Esri, Inc\
Copyright 2020 Richard Hansen

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
