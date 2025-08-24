# Daladala Guide - Dar es Salaam Public Transport

A comprehensive web application for navigating Dar es Salaam's public transport system (daladala routes).

## ✨ Features

### 🗺️ **Interactive Map**
- **Leaflet-based mapping** with OpenStreetMap tiles
- **Route visualization** with colored polylines
- **Stop markers** with popup information
- **Automatic map fitting** to show entire routes

### 🚌 **Route Management**
- **10+ predefined routes** covering major areas of DSM
- **Smart route search** by start and end stops
- **Route statistics** showing stop count and information
- **Color-coded routes** for easy identification

### 🔍 **Advanced Search**
- **Stop-to-stop routing** with intelligent suggestions
- **Fuzzy matching** for stop names
- **Route quality scoring** (shorter routes preferred)
- **Multiple route options** when available

### ⭐ **User Experience**
- **Favorite routes** saved to local storage
- **Route sharing** via URL or native sharing
- **Responsive design** for mobile and desktop
- **Modern UI** with intuitive controls

### 📝 **Contribution System**
- **Add new routes** with custom colors and notes
- **Add new stops** to existing routes
- **Data export/import** functionality
- **Community-driven** route database

### 💾 **Data Management**
- **CSV-based data** for easy editing
- **Geocoding cache** for faster loading
- **Local storage** for user preferences
- **Offline-capable** with cached data

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for initial map tiles and geocoding

### Installation
1. **Clone or download** the repository
2. **Open `index.html`** in your web browser
3. **Start exploring** Dar es Salaam's daladala routes!

### Usage
1. **Select a route** from the dropdown menu
2. **Click "Plot Route"** to see it on the map
3. **Search for routes** by entering start and end stops
4. **Add routes to favorites** for quick access
5. **Contribute new data** using the contribute form

## 📊 Route Data

### Current Routes
- **R1**: Mbezi - Makumbusho (19 stops)
- **R2**: Posta - Mwenge (5 stops)
- **R3**: Mbezi - City Centre (6 stops)
- **R4**: Kariakoo - Mbezi (7 stops)
- **R5**: Msasani - City Centre (4 stops)
- **R6**: Mikocheni - Posta (5 stops)
- **R7**: Upanga - Mwenge (5 stops)
- **R8**: Ilala - Mbezi (4 stops)
- **R9**: Temeke - Posta (3 stops)
- **R10**: Mbagala - City Centre (4 stops)

### Data Structure
- **`routes.csv`**: Main route data with stops
- **`routes_meta.csv`**: Route metadata (colors, notes)

## 🛠️ Technical Details

### Built With
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)** - Modern JavaScript features
- **Leaflet.js** - Interactive mapping library
- **PapaParse** - CSV parsing library
- **Font Awesome** - Icon library

### Architecture
- **Client-side rendering** for fast performance
- **Local storage** for user preferences and caching
- **Responsive design** with mobile-first approach
- **Progressive enhancement** for better accessibility

### Performance Features
- **Geocoding cache** to reduce API calls
- **Lazy loading** of map tiles
- **Efficient DOM manipulation**
- **Optimized route calculations**

## 🔧 Customization

### Adding New Routes
1. **Edit `data/routes.csv`**:
   ```csv
   route_id,route_name,stop_order,stop_name
   R11,New Route,1,First Stop
   R11,New Route,2,Second Stop
   ```

2. **Edit `data/routes_meta.csv`**:
   ```csv
   route_id,color,notes
   R11,#ff0000,Description of new route
   ```

### Styling
- **Modify `styles.css`** for custom appearance
- **Color scheme** easily customizable via CSS variables
- **Responsive breakpoints** for different screen sizes

### Functionality
- **Extend `app.js`** for additional features
- **Add new search algorithms** for better routing
- **Integrate with external APIs** for real-time data

## 🌐 Browser Support

- **Chrome** 60+
- **Firefox** 55+
- **Safari** 12+
- **Edge** 79+

## 📱 Mobile Experience

- **Touch-friendly** controls
- **Responsive layout** adapts to screen size
- **Mobile-optimized** map interactions
- **Fast loading** on mobile networks

## 🔒 Privacy & Security

- **No user data collection** - everything stored locally
- **OpenStreetMap** - free, open-source mapping
- **Nominatim geocoding** - privacy-respecting service
- **Local storage only** - no external data transmission

## 🤝 Contributing

### How to Contribute
1. **Add new routes** using the contribute form
2. **Submit data** via the web interface
3. **Report issues** or suggest improvements
4. **Share the app** with other DSM residents

### Data Guidelines
- **Accurate stop names** in English or Swahili
- **Logical stop ordering** from start to end
- **Descriptive route names** for clarity
- **Helpful notes** for route context

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **OpenStreetMap** contributors for map data
- **Nominatim** for geocoding services
- **Leaflet.js** team for the mapping library
- **Dar es Salaam residents** for route information

## 📞 Support

For questions, suggestions, or issues:
- **Use the contribute form** in the app
- **Check the log output** for debugging info
- **Review browser console** for errors

## 🚀 Future Enhancements

- **Real-time bus tracking** integration
- **Multi-language support** (Swahili, English)
- **Offline map tiles** for better performance
- **Route planning algorithms** for transfers
- **User reviews and ratings** for routes
- **Integration with transport APIs**

---

**Made with ❤️ for Dar es Salaam residents and visitors**

*Last updated: August 2024*
