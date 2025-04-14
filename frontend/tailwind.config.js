/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // ✅ Adjust paths as needed
  theme: {
    extend: {
      colors: {
        primary: '#102542',    
        accent: '#F87060',    
        text: '#E2E8F0',     
        secondary: '#829AB1',  
        hover: '#F4A261',    
        success: '#4CAF50',    
      },
    },
  },
  plugins: [],
};
