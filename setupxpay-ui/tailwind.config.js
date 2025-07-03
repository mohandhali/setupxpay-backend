module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        slideFadeIn: "slideFadeIn 0.6s ease-out",
        fadeInDown: "fadeInDown 0.6s ease-out",
        fadeInSlow: "fadeInSlow 1.2s ease-in",
        bounceIn: "bounceIn 1s both"
      },
      keyframes: {
        slideFadeIn: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: 0, transform: "translateY(-20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeInSlow: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        bounceIn: {
          "0%": {
            opacity: 0,
            transform: "scale(0.3)"
          },
          "50%": {
            opacity: 1,
            transform: "scale(1.05)"
          },
          "70%": {
            transform: "scale(0.9)"
          },
          "100%": {
            transform: "scale(1)"
          }
        }
      },
    },
  },
  plugins: [],
};
