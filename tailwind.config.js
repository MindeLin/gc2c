/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#06C755', // LINE Green
                secondary: '#2c3e50',
            }
        },
    },
    plugins: [],
}
