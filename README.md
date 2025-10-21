# Travelport Flight Search POC

A proof of concept flight search engine built with the Travelport JSON API. This application provides a modern, responsive web interface for searching flights using the Travelport catalog product offerings API.

## Features

- **Modern UI**: Beautiful, responsive design with gradient backgrounds and smooth animations
- **Flight Search**: Search for flights with origin, destination, departure/return dates
- **OAuth Integration**: Secure authentication with Travelport OAuth 2.0
- **Real-time Results**: Display flight results with pricing and details
- **Form Validation**: Client-side validation for all input fields
- **Configuration Management**: Easy API credential management
- **Error Handling**: Comprehensive error handling and user feedback

## Files Structure

```
Travelport_POC/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript application logic
├── README.md           # This documentation
├── request_OATH.txt    # OAuth request example
├── request_catalogproductofferings.txt  # Search API request example
├── response_OAUTH.json # OAuth response example
└── response_catalogproductresponseofferings.json  # Search API response example
```

## Setup and Usage

### Prerequisites

- **Node.js** (version 14 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)

### 1. Start the Server

**Option A: Using the startup script (Recommended)**
- **Windows**: Double-click `start.bat`
- **Mac/Linux**: Run `./start.sh` in terminal

**Option B: Manual setup**
```bash
# Install dependencies
npm install

# Start the server
npm start
```

The server will start on `http://localhost:3000`

### 2. Open the Application

Open your web browser and navigate to `http://localhost:3000`. The application will load with default API credentials from your existing files.

### 3. Configure API Credentials (Optional)

Click the "API Configuration" button in the footer to update your Travelport API credentials:

- **Username**: Your Travelport username (default: TP83533767)
- **Password**: Your Travelport password
- **Client ID**: Your OAuth client ID
- **Client Secret**: Your OAuth client secret

### 4. Search for Flights

1. **Enter Origin**: Type the departure city or airport code (e.g., "BRU" for Brussels)
2. **Enter Destination**: Type the arrival city or airport code (e.g., "OSL" for Oslo)
3. **Select Dates**: Choose departure and return dates
4. **Choose Options**: Select number of passengers and cabin class
5. **Click Search**: The application will authenticate and search for flights

### 5. View Results

The application will display flight results including:
- Route information (origin → destination)
- Pricing information
- Flight details and options
- Available brands and product offerings

## API Integration

### Server Architecture

The application now uses a Node.js server to handle API calls and avoid CORS issues:

- **Frontend**: HTML/CSS/JavaScript served from `http://localhost:3000`
- **Backend**: Express.js server with proxy endpoints
- **API Proxy**: Server makes requests to Travelport API on behalf of the frontend

### Authentication Flow

1. Frontend sends OAuth request to `/api/oauth`
2. Server forwards request to `https://oauth.pp.travelport.com/oauth/oauth20/token`
3. Server returns access token to frontend
4. Access token is stored server-side for subsequent API calls

### Search API

- **Frontend Endpoint**: `POST /api/search`
- **Backend Proxy**: Forwards to `https://api.pp.travelport.com/11/air/catalog/search/catalogproductofferings`
- **Method**: POST
- **Headers**: Includes Bearer token, content type, and Travelport-specific headers
- **Response**: JSON containing catalog product offerings

### Request Structure

The application builds requests in the following format:

```json
{
  "CatalogProductOfferingQuery": {
    "@type": "CatalogProductOfferingQuery",
    "SearchCriteriaFlight": [
      {
        "@type": "SearchCriteriaFlight",
        "departureDate": "2024-01-15",
        "returnDate": "2024-01-22",
        "from": "BRU",
        "to": "OSL",
        "cabinClass": "Economy",
        "passengerQuantity": 2
      }
    ]
  }
}
```

## Technical Details

### Technologies Used

- **Frontend**:
  - **HTML5**: Semantic markup and form elements
  - **CSS3**: Modern styling with Flexbox, Grid, and animations
  - **Vanilla JavaScript**: ES6+ features, async/await, classes
  - **Font Awesome**: Icons for enhanced UI
  - **Google Fonts**: Inter font family for modern typography

- **Backend**:
  - **Node.js**: JavaScript runtime
  - **Express.js**: Web framework
  - **Axios**: HTTP client for API requests
  - **CORS**: Cross-origin resource sharing middleware

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Security Features

- Credentials stored in localStorage (consider server-side storage for production)
- HTTPS-only API calls
- Input validation and sanitization
- Error handling without exposing sensitive information

## Customization

### Styling

Modify `styles.css` to customize:
- Color scheme and gradients
- Typography and spacing
- Component layouts
- Responsive breakpoints

### Functionality

Update `script.js` to:
- Modify API request structure
- Add new form fields
- Customize result display
- Implement additional features

### API Configuration

The application can be easily configured for different environments by updating the `apiConfig` object in `script.js`:

```javascript
this.apiConfig = {
    username: 'YOUR_USERNAME',
    password: 'YOUR_PASSWORD',
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    baseUrl: 'https://api.pp.travelport.com/11/air/catalog/search',
    oauthUrl: 'https://oauth.pp.travelport.com/oauth/oauth20/token'
};
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Verify your API credentials in the configuration modal
2. **No Results**: Check that airport codes are valid and dates are in the future
3. **Server Not Starting**: Ensure Node.js is installed and dependencies are installed with `npm install`
4. **Port Already in Use**: If port 3000 is busy, the server will show an error. Change the PORT in server.js
5. **Network Errors**: Ensure you have internet connectivity and the Travelport API is accessible

### Debug Mode

Open browser developer tools (F12) to view:
- Network requests and responses
- Console errors and warnings
- Application state and variables

## Future Enhancements

Potential improvements for production use:

- Server-side API proxy to handle CORS
- User authentication and session management
- Flight booking functionality
- Advanced filtering and sorting options
- Price alerts and notifications
- Mobile app version
- Multi-language support
- Accessibility improvements

## Support

For issues related to:
- **Travelport API**: Contact Travelport support
- **Application bugs**: Check browser console for error messages
- **Customization**: Refer to the code comments and documentation

---

**Note**: This is a proof of concept application. For production use, implement proper security measures, error handling, and server-side components as needed.
