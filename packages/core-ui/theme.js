module.exports = {
  componentsInclude: "./node_modules/@edgelabs/components/dist/**/*.js",

  /** @type {import('tailwindcss').Config} */
  defaultTheme: {
    theme: {
      extend: {
        colors: {
          black: {
            900: "#000000",
            800: "#111111",
            700: "#222222",
            600: "#333333",
            500: "#444444",
          },
          neutral: {
            900: "#000000",
          },
          blue: {
            600: "#066bff",
            700: "rgb(0 107 214)",
          },
          accent: {
            blue: {
              normal: "#0A84FF",
              alt: "#102841",
            },
          },
        },
      },
    },
  },
};
