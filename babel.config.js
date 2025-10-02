module.exports = function (api) {
  const isTest = api.env('test');
  api.cache(true);
  return {
    presets: ['babel-preset-expo', ...(!isTest ? ['nativewind/babel'] : [])],
    plugins: ['react-native-reanimated/plugin'],
  };
};
