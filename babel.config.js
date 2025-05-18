// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@": "./src",
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@navigation": "./src/navigation",
            "@hooks": "./src/hooks",
            "@contexts": "./src/contexts",
            "@api": "./src/api",
            "@utils": "./src/utils",
            "@constants": "./src/constants",
            "@types": "./src/types",
            "@assets": "./assets",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
// This configuration file is used to set up Babel for a React Native project.
// It includes the Expo preset and a module resolver plugin to simplify imports.
// The module resolver plugin allows you to use custom aliases for directories,
// making it easier to import components, screens, hooks, contexts, API calls,
// utilities, constants, types, and assets.
// Additionally, the react-native-reanimated/plugin is included to enable
// support for the Reanimated library, which is commonly used for animations
// in React Native applications.
