const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('public'));
app.use(express.static('.'));

// API Configuration
const API_CONFIG = {
    username: process.env.TRAVELPORT_USERNAME || 'TP83533767',
    password: process.env.TRAVELPORT_PASSWORD || 'Au3jYRkN',
    clientId: process.env.TRAVELPORT_CLIENT_ID || 'pp-2r85eJ8HT7YVZwUqVLPxZBjiEjpuUuP6r3zfLPjO',
    clientSecret: process.env.TRAVELPORT_CLIENT_SECRET || '98646e69cf56a339b24712aa9840c885db9dd338c06fd789f7b5533d4ac5ce27',
    oauthUrl: process.env.TRAVELPORT_OAUTH_URL || 'https://oauth.pp.travelport.com/oauth/oauth20/token',
    searchUrl: process.env.TRAVELPORT_SEARCH_URL || 'https://api.pp.travelport.com/11/air/catalog/search/catalogproductofferings'
};

// Store access token (in production, use proper session management)
let accessToken = null;
let tokenExpiry = null;

// Store last API request details for developer tools
let lastApiRequest = null;

// OAuth endpoint
app.post('/api/oauth', async (req, res) => {
    try {
        console.log('OAuth request received');
        
        const tokenData = new URLSearchParams({
            grant_type: 'password',
            username: API_CONFIG.username,
            password: API_CONFIG.password,
            client_id: API_CONFIG.clientId,
            client_secret: API_CONFIG.clientSecret,
            scope: 'openid'
        });

        const response = await axios.post(API_CONFIG.oauthUrl, tokenData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        accessToken = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in * 1000);
        
        console.log('OAuth successful, token received');
        res.json({ success: true, token: accessToken });
        
    } catch (error) {
        console.error('OAuth error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Authentication failed', 
            details: error.response?.data || error.message 
        });
    }
});

// Flight search endpoint
app.post('/api/search', async (req, res) => {
    try {
        console.log('Search request received:', req.body);
        
        // Check if we have a valid token
        if (!accessToken || (tokenExpiry && Date.now() > tokenExpiry)) {
            console.log('No valid token, requesting new one');
            // Request new token
            const tokenResponse = await axios.post(`http://localhost:${PORT}/api/oauth`);
            if (!tokenResponse.data.success) {
                throw new Error('Failed to get access token');
            }
        }

        // Check if custom PricingPCC is provided
        const hasCustomPCC = req.body.pricingPCC && req.body.pricingPCC.trim() !== '';
        
        if (hasCustomPCC) {
            console.log('Custom PricingPCC provided:', req.body.pricingPCC, '- Making dual requests for comparison');
            
            // Prepare request details for dual requests
            const requestHeaders = {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'XAUTH_TRAVELPORT_ACCESSGROUP': '006C2E1A-5BAF-4503-BA51-B51F163E4727',
                'Accept-Version': '11',
                'Content-Version': '11',
                'taxBreakDown': 'true'
            };

            const defaultBody = buildSearchRequestBody({...req.body, pricingPCC: null});
            const customBody = buildSearchRequestBody(req.body);

            // Store the actual Travelport API request details (custom PCC request)
            lastApiRequest = {
                url: API_CONFIG.searchUrl,
                method: 'POST',
                headers: requestHeaders,
                body: customBody,
                timestamp: new Date().toISOString(),
                dualRequest: {
                    default: {
                        body: defaultBody,
                        headers: requestHeaders
                    },
                    custom: {
                        body: customBody,
                        headers: requestHeaders
                    }
                }
            };

            // Make two requests: one with default PCC and one with custom PCC
            const [defaultResponse, customResponse] = await Promise.all([
                // Default request (without custom PCC)
                axios.post(API_CONFIG.searchUrl, defaultBody, {
                    headers: requestHeaders
                }),
                // Custom PCC request
                axios.post(API_CONFIG.searchUrl, customBody, {
                    headers: requestHeaders
                })
            ]);
            
            console.log('Dual search successful - both requests completed');
            console.log('Default PCC results:', defaultResponse.data.CatalogProductOfferingsResponse?.CatalogProductOfferings?.CatalogProductOffering?.length || 0);
            console.log('Custom PCC results:', customResponse.data.CatalogProductOfferingsResponse?.CatalogProductOfferings?.CatalogProductOffering?.length || 0);
            
            // Return combined response with both pricing options
            res.json({
                CatalogProductOfferingsResponse: {
                    ...defaultResponse.data.CatalogProductOfferingsResponse,
                    pricingComparison: {
                        defaultPCC: {
                            pcc: "23N1",
                            data: defaultResponse.data.CatalogProductOfferingsResponse
                        },
                        customPCC: {
                            pcc: req.body.pricingPCC,
                            data: customResponse.data.CatalogProductOfferingsResponse
                        }
                    }
                }
            });
        } else {
            // Single request with default PCC
            const searchBody = buildSearchRequestBody(req.body);
            console.log('Search request body:', JSON.stringify(searchBody, null, 2));
            console.log('ConnectionType being sent:', searchBody.CatalogProductOfferingsRequest.SearchModifiersAir?.ConnectionType);

            // Capture API request details for developer tools
            const requestHeaders = {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'XAUTH_TRAVELPORT_ACCESSGROUP': '006C2E1A-5BAF-4503-BA51-B51F163E4727',
                'Accept-Version': '11',
                'Content-Version': '11',
                'taxBreakDown': 'true'
            };

            // Store the actual Travelport API request details
            lastApiRequest = {
                url: API_CONFIG.searchUrl,
                method: 'POST',
                headers: requestHeaders,
                body: searchBody,
                timestamp: new Date().toISOString()
            };

            const response = await axios.post(API_CONFIG.searchUrl, searchBody, {
                headers: requestHeaders
            });

            console.log('Search successful, results received');
            console.log('Number of offerings returned:', response.data.CatalogProductOfferingsResponse?.CatalogProductOfferings?.CatalogProductOffering?.length || 0);
            
            // Log first few offerings to check their structure
            if (response.data.CatalogProductOfferingsResponse?.CatalogProductOfferings?.CatalogProductOffering) {
                const offerings = response.data.CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering;
                console.log('First offering structure:', JSON.stringify(offerings[0], null, 2));
            }
            
            res.json(response.data);
        }
        
        } catch (error) {
            console.error('Search error:', error.response?.data || error.message);
            console.error('Full error:', error);
            
            let errorDetails = 'Unknown error';
            if (error.response?.data) {
                errorDetails = JSON.stringify(error.response.data, null, 2);
            } else if (error.message) {
                errorDetails = error.message;
            }
            
            res.status(500).json({ 
                success: false, 
                error: 'Search failed', 
                details: errorDetails,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
        }
});

// Build search request body based on Travelport API requirements
function buildSearchRequestBody(params) {
    // Use the correct structure from the working example
    const requestBody = {
        "@type": "CatalogProductOfferingsQueryRequest",
        "CatalogProductOfferingsRequest": {
            "@type": "CatalogProductOfferingsRequestAir",
            "maxNumberOfUpsellsToReturn": 1,
            "contentSourceList": [
                "GDS"
            ],
            "PassengerCriteria": [
                {
                    "@type": "PassengerCriteria",
                    "number": parseInt(params.passengers),
                    "age": 25,
                    "passengerTypeCode": "ADT"
                }
            ],
            "SearchCriteriaFlight": [
                {
                    "@type": "SearchCriteriaFlight",
                    "departureDate": params.departureDate,
                    "From": {
                        "value": params.origin
                    },
                    "To": {
                        "value": params.destination
                    }
                }
            ],
            "CustomResponseModifiersAir": {
                "@type": "CustomResponseModifiersAir",
                "SearchRepresentation": "Journey"
            }
        }
    };

    // Add return flight if return date is provided
    if (params.returnDate) {
        requestBody.CatalogProductOfferingsRequest.SearchCriteriaFlight.push({
            "@type": "SearchCriteriaFlight",
            "departureDate": params.returnDate,
            "From": {
                "value": params.destination
            },
            "To": {
                "value": params.origin
            }
        });
    }

    // Initialize SearchModifiersAir if we have modifiers to add
    let searchModifiers = {};
    
    // Add carrier preference if carriers are specified
    if (params.carriers && params.carriers.trim()) {
        searchModifiers.CarrierPreference = [
            {
                "@type": "CarrierPreference",
                "preferenceType": "Preferred",
                "carriers": params.carriers.split(',').map(c => c.trim().toUpperCase())
            }
        ];
    }
    
    // Add connection type if flight type is specified
    if (params.flightType) {
        searchModifiers.ConnectionType = params.flightType;
    }
    
    // Add SearchModifiersAir to request if we have any modifiers
    if (Object.keys(searchModifiers).length > 0) {
        requestBody.CatalogProductOfferingsRequest.SearchModifiersAir = {
            "@type": "SearchModifiersAir",
            ...searchModifiers
        };
    }

    // Add PricingModifiersAir with PricingPCC (use provided PCC or default)
    const pricingPCC = params.pricingPCC || "23N1";
    requestBody.CatalogProductOfferingsRequest.PricingModifiersAir = {
        "@type": "PricingModifiersAir",
        "PricingPCC": pricingPCC
    };

    return requestBody;
}


// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Developer tools endpoint - get last API request details
app.get('/api/dev/last-request', (req, res) => {
    res.json(lastApiRequest);
});

// Serve static files explicitly
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'styles.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'script.js'));
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Travelport Flight Search POC server running on http://localhost:${PORT}`);
    console.log(`📱 Open your browser and navigate to http://localhost:${PORT}`);
    console.log(`🔧 API endpoints available at http://localhost:${PORT}/api/`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    process.exit(0);
});
