# mup-fix-bin-paths

Some npm packages (such as sspk) break deploying a meteor app from Windows due to the path seperator they use in bin paths. Npm 5.4.0 fixed it, but Meteor doesn't use it until version 1.6. This plugin can be used for apps using older versions of Meteor.

This plugin automatically checks before every deploy the bin paths in the `package.json` for every npm package used by the app, and fixes any paths in their `package.json` that only work on Windows.

## Use
Install with `npm i -g mup-fix-bin-paths`.
Next, add it to the `plugins` array in your mup config:

```js
module.exports = {
  // rest of config

  plugins: ['mup-fix-bin-paths']
}
```

Next time you run `mup deploy` or `mup meteor push`, it will automatically fix any bin paths that will break the deploy.
