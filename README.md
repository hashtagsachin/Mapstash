# Geopin 2.0 - Mapstash

A full-stack location-based pin management application that allows users to save, organize, and discover geographic locations with notes and tags.

## 🌟 Features

### Core Functionality
- **Interactive Map Interface**: Click-to-add pins with Google Maps integration
- **Pin Management**: Full CRUD operations for location pins
- **Smart Tagging System**: Organize pins with color-coded tags and autocomplete
- **Geographic Search**: Find pins within a specified radius of your location
- **Places Search**: Integrated Google Places autocomplete for easy location discovery
- **Rich Notes**: Add detailed notes to each saved location

### User Experience
- **Responsive Design**: Clean, Material Design interface that works on all devices
- **Real-time Search**: Filter saved pins by title, notes, or tags
- **Visual Feedback**: Loading states, notifications, and smooth animations
- **Location Services**: Automatic geolocation detection for nearby searches

## 🛠️ Technology Stack

### Backend
- **Java 17** with **Spring Boot 3.4.4**
- **Spring Data JPA** for database operations
- **MySQL** for data persistence
- **Maven** for dependency management
- **RESTful API** architecture

### Frontend
- **React 19.1.0** with functional components and hooks
- **Material-UI (MUI) 7.0.2** for component library
- **Google Maps JavaScript API** via `@react-google-maps/api`
- **Axios** for HTTP client
- **Create React App** for build tooling

## 📋 Prerequisites

Before running this application, ensure you have:

- **Java 17** or higher
- **Node.js 16** or higher
- **MySQL 8.0** or higher
- **Google Maps API Key** with the following APIs enabled:
  - Maps JavaScript API
  - Places API
  - Geocoding API

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Geopin 2.0 - Mapstash"
```

### 2. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE mapstashdb;
```

2. Update database credentials in `mapstash/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mapstashdb?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Backend Setup

```bash
cd mapstash
./mvnw clean install
./mvnw spring-boot:run
```

The backend server will start on `http://localhost:8080`

### 4. Frontend Setup

```bash
cd mapstash-frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_API_BASE_URL=http://localhost:8080
```

Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 🗄️ Database Schema

The application uses a simple but effective schema:

### Tables
- **pins**: Stores location data with coordinates, title, notes, and timestamps
- **tags**: Manages unique tag names
- **pin_tags**: Junction table for many-to-many relationship between pins and tags

### Key Features
- Automatic timestamp management
- Unique tag name constraints
- Cascading operations for data integrity

## 🔧 API Endpoints

### Pins
- `GET /api/pins` - Retrieve all pins
- `POST /api/pins` - Create a new pin
- `GET /api/pins/{id}` - Get pin by ID
- `PUT /api/pins/{id}` - Update existing pin
- `DELETE /api/pins/{id}` - Delete pin
- `GET /api/pins/nearby?lat={lat}&lng={lng}&radius={meters}` - Find nearby pins

### Tags
- `GET /api/tags` - Get all unique tag names

## 🎯 Usage Guide

### Adding a New Pin
1. Click anywhere on the map or use the "+" button in the sidebar
2. Fill in the title (required), notes, and tags
3. Tags support autocomplete from existing tags
4. Click "Save Pin" to persist the location

### Managing Pins
- **View Details**: Click any pin marker or list item to see full details
- **Edit**: Use the edit button in pin cards or detail view
- **Delete**: Use the delete button with confirmation dialog
- **Search**: Use the search bar to filter pins by title, notes, or tags

### Finding Nearby Pins
1. Click the location button (📍) in the bottom-right corner
2. Allow location access when prompted
3. The map will show pins within 5km of your current location
4. Click the list button to return to all pins

### Location Search
- Use the search bar at the top of the map
- Search for addresses, businesses, or landmarks
- Click a result to pan the map to that location

## 🏗️ Architecture

### Backend Architecture
```
├── config/          # CORS and web configuration
├── controller/      # REST API endpoints
├── dto/             # Data Transfer Objects
├── exception/       # Custom exception handling
├── model/           # JPA entities
├── repository/      # Data access layer
└── service/         # Business logic layer
```

### Frontend Architecture
```
├── components/
│   ├── MapContainer/     # Google Maps integration
│   ├── MapControls/      # Map-related controls
│   └── Sidebar/          # Pin management interface
├── services/             # API communication
└── App.js               # Main application logic
```



## 🐛 Known Issues

- Nearby search requires browser geolocation permission
- Google Maps API quota limits may apply for heavy usage
- Mobile responsiveness could be enhanced for very small screens

## 🔮 Future Enhancements

- [ ] User accounts
- [ ] Deploy to Digital Ocean
- [ ] Mobile app



**Happy Mapping! 🗺️**