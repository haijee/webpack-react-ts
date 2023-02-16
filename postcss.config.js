const stylelint = require("stylelint");

module.exports = {
  plugins: [
    require("autoprefixer"),
    // 添加css代码校验
    stylelint({
      config: {
        rules: {
          "declaration-no-important": true,
        },
      },
    }),
  ],
};
