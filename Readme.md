# react-native-prepare-svg 

> work in progress..

Tool to transform `svg` files and 'strings' into a flat `JSON` list.

> Useful to manipulate `SVG` with `Expo` or `react-native-svg` Components.

# Features

- Convert svg files to json, remove all unnecessary values.
- Group all svg files into a common lib file.
- Optimize output with [svgo](https://github.com/svg/svgo)
- Returns a json output that is friendly to be used in the react native application with [Expo.io](https://expo.io/) or [react-native-svg](https://www.npmjs.com/package/react-native-svg)


### How to use

```sh
  npm install -g react-native-prepare-svg
```

```sh
  react-native-prepare-svg [options]
```


### Options

```
  -h, --help             output usage information
  -v, --version          output the version number
  -i, --input [input]    Specifies input folder or file.
                         Default current folder
  -o, --output [output]  Specifies output file. Default ./svgson.json
  -p, --pretty           Prettyfied JSON
```


### Examples

- `input` current folder width default `output` **svgLib.json** file

  ```
  $ rnpreparesvg
  ```

- `input` **/svgs** folder with `output` **my-svgs.json** file

  ```
  $ rnpreparesvg --input svgs --output my-svgs.json
  ```

- `input` **myfile.svg** file | `output` **my-file.json** file

  ```
  $ rnpreparesvg -i myfile.svg -o my-file.json
  ```

- Complex example
  - `input` **/svgs** folder
  - `output` **rnpreparesvg.json** file
  - prettifies JSON output
  - group all _paths_ into the key `myPaths`

  ```
  $ rnpreparesvg -i ./svgs --title --pretty --key myPaths
  ```


### Use as Node Module

```sh
  # save in devDependencies
  npm i -D react-native-prepare-svg
```

```js
const rnpreparesvg = require('react-native-prepare-svg');

// From .svg file
const fs = require('fs');

fs.readFile('logo.svg', 'utf-8', (err, data) => {
  rnpreparesvg(data, { title: 'logo'}, result => console.log(result));
});

// From svg String
const SVG = '<svg width="300" height="300"><circle r="20" stroke-linecap="round" /></svg>';
rnpreparesvg(SVG, {}, result => console.log(result));

```


### Tests
```sh
  make test
  # or
  npm test
```


### License

MIT © [Jose Antonio Sanchez](https://tonisan.com)
