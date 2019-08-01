# figma-plugin-palette

Source code for the "Image Palette" plugin:

https://www.figma.com/c/plugin/731841207668879837/Image-Palette

# Usage

If you want to run this locally, you'll need node@8.x, npm@6.1.x and Figma's Desktop Application.

First clone this repo and install dependencies:

```sh
git clone https://github.com/mattdesl/figma-plugin-palette.git
cd figma-plugin-palette
npm install
```

Then you can run the development version:

```sh
npm run start
```

This will generate a `dist` folder.

Now open a project in Figma Desktop, select Menu > Plugins > Development > New Plugin. Click "Choose a manifest.json" and find the `manifest.json` file in `figma-plugin-palette/dist/image-palette/manifest.json`.

Now you can run the plugin via Right Click > Plugins > Image Palette. You can also open the Console via that context menu, and re-run the last plugin via Cmd + Option + P.

# Production Build

Once you are happy, you can run the following to build a standalone and more optimized version:

```sh
npm run build
```

Note that you will need to change the `"id"` in `./src/image-palette/manifest.json` if you wish to publish changes to your own plugin.