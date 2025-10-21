// Travelport Flight Search POC
class FlightSearchApp {
    constructor() {
        this.apiConfig = {
            username: 'TP83533767',
            password: 'Au3jYRkN',
            clientId: 'pp-2r85eJ8HT7YVZwUqVLPxZBjiEjpuUuP6r3zfLPjO',
            clientSecret: '98646e69cf56a339b24712aa9840c885db9dd338c06fd789f7b5533d4ac5ce27',
            // Use local server endpoints to avoid CORS issues
            baseUrl: '/api',
            oauthUrl: '/api/oauth',
            searchUrl: '/api/search'
        };
        
        this.accessToken = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedConfig();
        this.setDefaultDates();
    }

    setupEventListeners() {
        const form = document.getElementById('flightSearchForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Auto-fill return date when departure date changes
        const departureDateInput = document.getElementById('departureDate');
        departureDateInput.addEventListener('change', () => this.updateReturnDateMin());
    }

    setDefaultDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        document.getElementById('departureDate').value = tomorrow.toISOString().split('T')[0];
        document.getElementById('returnDate').value = nextWeek.toISOString().split('T')[0];
        
        this.updateReturnDateMin();
    }

    updateReturnDateMin() {
        const departureDate = document.getElementById('departureDate').value;
        const returnDateInput = document.getElementById('returnDate');
        
        if (departureDate) {
            returnDateInput.min = departureDate;
            if (returnDateInput.value && returnDateInput.value < departureDate) {
                returnDateInput.value = departureDate;
            }
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const searchParams = {
            origin: formData.get('origin').toUpperCase(),
            destination: formData.get('destination').toUpperCase(),
            departureDate: formData.get('departureDate'),
            returnDate: formData.get('returnDate'),
            passengers: formData.get('passengers'),
            cabinClass: formData.get('cabinClass'),
            flightType: formData.get('flightType'),
            carriers: formData.get('carriers'),
            pricingPCC: formData.get('pricingPCC')
        };

        // Validate form
        if (!this.validateForm(searchParams)) {
            return;
        }

        this.showLoading();
        this.hideError();
        this.hideResults();

        try {
            await this.searchFlights(searchParams);
        } catch (error) {
            console.error('Search error:', error);
            this.showError(error.message || 'Failed to search flights. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    validateForm(params) {
        if (!params.origin || params.origin.length < 3) {
            this.showError('Please enter a valid origin city or airport code.');
            return false;
        }
        
        if (!params.destination || params.destination.length < 3) {
            this.showError('Please enter a valid destination city or airport code.');
            return false;
        }
        
        if (params.origin === params.destination) {
            this.showError('Origin and destination cannot be the same.');
            return false;
        }
        
        if (!params.departureDate) {
            this.showError('Please select a departure date.');
            return false;
        }
        
        if (params.returnDate && params.returnDate < params.departureDate) {
            this.showError('Return date must be after departure date.');
            return false;
        }
        
        // Validate carriers format if provided
        if (params.carriers && params.carriers.trim()) {
            const carrierCodes = params.carriers.split(',').map(c => c.trim().toUpperCase());
            const invalidCodes = carrierCodes.filter(code => !/^[A-Z0-9]{2,3}$/.test(code));
            if (invalidCodes.length > 0) {
                this.showError(`Invalid airline codes: ${invalidCodes.join(', ')}. Please use 2-3 letter airline codes.`);
                return false;
            }
        }
        
        return true;
    }

    async searchFlights(params) {
        try {
            // Get access token
            await this.getAccessToken();
            
            // Make search request
            const results = await this.makeSearchRequest(params);
            
            // Display results
            this.displayResults(results);
            
        } catch (error) {
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    async getAccessToken() {
        if (this.accessToken) {
            return this.accessToken;
        }

        try {
            const response = await fetch(this.apiConfig.oauthUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OAuth failed: ${errorData.details || response.statusText}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(`Authentication failed: ${data.details || 'Unknown error'}`);
            }
            
            this.accessToken = data.token;
            return this.accessToken;
            
        } catch (error) {
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    async makeSearchRequest(params) {
        try {
            const response = await fetch(this.apiConfig.searchUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Search request failed: ${errorData.details || response.statusText}`);
            }

            const data = await response.json();
            if (data.success === false) {
                let errorMsg = `Search failed: ${data.details || 'Unknown error'}`;
                if (data.status) {
                    errorMsg += ` (Status: ${data.status} ${data.statusText || ''})`;
                }
                throw new Error(errorMsg);
            }

            return data;
            
        } catch (error) {
            throw new Error(`Search request failed: ${error.message}`);
        }
    }

    buildSearchRequestBody(params) {
        // This is a simplified request body structure
        // You may need to adjust this based on the actual Travelport API requirements
        return {
            "CatalogProductOfferingQuery": {
                "@type": "CatalogProductOfferingQuery",
                "SearchCriteriaFlight": [
                    {
                        "@type": "SearchCriteriaFlight",
                        "departureDate": params.departureDate,
                        "returnDate": params.returnDate || null,
                        "from": params.origin,
                        "to": params.destination,
                        "cabinClass": params.cabinClass,
                        "passengerQuantity": parseInt(params.passengers)
                    }
                ]
            }
        };
    }

    displayResults(data) {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = '';

        if (!data.CatalogProductOfferingsResponse) {
            this.showError('No flight data received');
            return;
        }

        // Check if we have pricing comparison data
        const hasPricingComparison = data.CatalogProductOfferingsResponse.pricingComparison;
        
        if (hasPricingComparison) {
            console.log('Displaying pricing comparison results');
            this.displayPricingComparison(data.CatalogProductOfferingsResponse.pricingComparison);
        } else {
            // Regular single pricing display
            if (!data.CatalogProductOfferingsResponse.CatalogProductOfferings ||
                !data.CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering) {
                this.showError('No flights found for your search criteria.');
                return;
            }

            let offerings = data.CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering;
            const referenceList = data.CatalogProductOfferingsResponse.ReferenceList || [];
            
            // Filter offerings based on connection type if specified
            const flightType = document.getElementById('flightType').value;
            const originalCount = offerings.length;
            if (flightType && flightType !== 'StopAny') {
                offerings = this.filterByConnectionType(offerings, referenceList, flightType);
                console.log(`Filtered ${originalCount} offerings to ${offerings.length} based on connection type: ${flightType}`);
            }
            
            if (offerings.length === 0) {
                this.showError('No flights found matching your connection type preference.');
                return;
            }

            // Create a map of flight references for quick lookup
            const flightMap = new Map();
            referenceList.forEach(ref => {
                if (ref['@type'] === 'ReferenceListFlight' && ref.Flight) {
                    ref.Flight.forEach(flight => {
                        flightMap.set(flight.id, flight);
                    });
                }
            });

            // Create a map of brand references for quick lookup
            const brandMap = new Map();
            referenceList.forEach(ref => {
                if (ref['@type'] === 'ReferenceListBrand' && ref.Brand) {
                    ref.Brand.forEach(brand => {
                        brandMap.set(brand.id, brand);
                    });
                }
            });

            offerings.forEach((offering, index) => {
                const flightCard = this.createFlightCard(offering, index, flightMap, brandMap);
                resultsContainer.appendChild(flightCard);
            });
        }

        this.showResults();
    }

    displayPricingComparison(pricingComparison) {
        const resultsContainer = document.getElementById('resultsContainer');
        
        // Create comparison header
        const comparisonHeader = document.createElement('div');
        comparisonHeader.className = 'pricing-comparison-header';
        comparisonHeader.innerHTML = `
            <h3>Pricing Comparison</h3>
            <p>Comparing default pricing (${pricingComparison.defaultPCC.pcc}) with custom pricing (${pricingComparison.customPCC.pcc})</p>
        `;
        resultsContainer.appendChild(comparisonHeader);

        // Display default PCC results
        const defaultSection = document.createElement('div');
        defaultSection.className = 'pricing-section';
        defaultSection.innerHTML = `<h4>Default Pricing (${pricingComparison.defaultPCC.pcc})</h4>`;
        resultsContainer.appendChild(defaultSection);

        const defaultOfferings = pricingComparison.defaultPCC.data.CatalogProductOfferings?.CatalogProductOffering || [];
        const defaultReferenceList = pricingComparison.defaultPCC.data.ReferenceList || [];
        
        if (defaultOfferings.length > 0) {
            const defaultFlightMap = this.createFlightMap(defaultReferenceList);
            const defaultBrandMap = this.createBrandMap(defaultReferenceList);
            
            defaultOfferings.slice(0, 3).forEach((offering, index) => {
                const flightCard = this.createFlightCard(offering, index, defaultFlightMap, defaultBrandMap);
                flightCard.classList.add('default-pricing');
                resultsContainer.appendChild(flightCard);
            });
        }

        // Display custom PCC results
        const customSection = document.createElement('div');
        customSection.className = 'pricing-section';
        customSection.innerHTML = `<h4>Custom Pricing (${pricingComparison.customPCC.pcc})</h4>`;
        resultsContainer.appendChild(customSection);

        const customOfferings = pricingComparison.customPCC.data.CatalogProductOfferings?.CatalogProductOffering || [];
        const customReferenceList = pricingComparison.customPCC.data.ReferenceList || [];
        
        if (customOfferings.length > 0) {
            const customFlightMap = this.createFlightMap(customReferenceList);
            const customBrandMap = this.createBrandMap(customReferenceList);
            
            customOfferings.slice(0, 3).forEach((offering, index) => {
                const flightCard = this.createFlightCard(offering, index, customFlightMap, customBrandMap);
                flightCard.classList.add('custom-pricing');
                resultsContainer.appendChild(flightCard);
            });
        }
    }

    createFlightMap(referenceList) {
        const flightMap = new Map();
        referenceList.forEach(ref => {
            if (ref['@type'] === 'ReferenceListFlight' && ref.Flight) {
                ref.Flight.forEach(flight => {
                    flightMap.set(flight.id, flight);
                });
            }
        });
        return flightMap;
    }

    createBrandMap(referenceList) {
        const brandMap = new Map();
        referenceList.forEach(ref => {
            if (ref['@type'] === 'ReferenceListBrand' && ref.Brand) {
                ref.Brand.forEach(brand => {
                    brandMap.set(brand.id, brand);
                });
            }
        });
        return brandMap;
    }

    createFlightCard(offering, index, flightMap, brandMap) {
        const card = document.createElement('div');
        card.className = 'flight-result';
        
        // Extract basic flight information
        const departure = offering.Departure || 'N/A';
        const arrival = offering.Arrival || 'N/A';
        const priceInfo = this.extractPrice(offering);
        
        // Get detailed flight information from reference list
        const flightDetails = this.getFlightDetails(offering, flightMap, brandMap);
        
        // Get primary brand description
        const primaryBrand = this.getPrimaryBrandDescription(offering, brandMap);
        
        // Get price breakdown
        const priceBreakdown = this.getPriceBreakdown(offering);
        
        card.innerHTML = `
            <div class="flight-header">
                <div class="flight-route">
                    <div class="route-info">
                        <div class="airport">${departure}</div>
                        <div class="city">${this.getCityName(departure)}</div>
                    </div>
                    <div class="flight-arrow">
                        <i class="fas fa-plane"></i>
                    </div>
                    <div class="route-info">
                        <div class="airport">${arrival}</div>
                        <div class="city">${this.getCityName(arrival)}</div>
                    </div>
                </div>
                <div class="flight-price">
                    <div class="price">${priceInfo.amount}</div>
                    <div class="currency">${priceInfo.currency}</div>
                </div>
            </div>
            <div class="price-breakdown">
                <div class="breakdown-header">
                    <span>Price Breakdown</span>
                    <button class="toggle-breakdown" onclick="this.parentElement.parentElement.classList.toggle('expanded')">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <div class="breakdown-content">
                    ${priceBreakdown}
                </div>
            </div>
            <div class="flight-details">
                <div class="detail-item">
                    <div class="detail-label">Flight ID</div>
                    <div class="detail-value">${offering.id || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Sequence</div>
                    <div class="detail-value">${offering.sequence || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Primary Brand</div>
                    <div class="detail-value">${primaryBrand}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Options</div>
                    <div class="detail-value">${offering.ProductBrandOptions ? offering.ProductBrandOptions.length : 0}</div>
                </div>
            </div>
            <div class="flight-segments">
                ${flightDetails}
            </div>
        `;
        
        return card;
    }

    extractPrice(offering) {
        // Try to extract price from the offering
        // This is a simplified extraction - you may need to adjust based on actual response structure
        if (offering.ProductBrandOptions && offering.ProductBrandOptions.length > 0) {
            const firstOption = offering.ProductBrandOptions[0];
            if (firstOption.ProductBrandOffering && firstOption.ProductBrandOffering.length > 0) {
                const firstOffering = firstOption.ProductBrandOffering[0];
                if (firstOffering.BestCombinablePrice) {
                    return {
                        amount: firstOffering.BestCombinablePrice.TotalPrice || 'N/A',
                        currency: firstOffering.BestCombinablePrice.CurrencyCode?.value || 'EUR'
                    };
                }
            }
        }
        return { amount: 'N/A', currency: 'EUR' };
    }

    getFlightDetails(offering, flightMap, brandMap) {
        let flightDetailsHtml = '';

        // Check if offering has ProductBrandOptions with flightRefs
        if (offering.ProductBrandOptions && offering.ProductBrandOptions.length > 0) {
            offering.ProductBrandOptions.forEach((brandOption, brandIndex) => {
                if (brandOption.flightRefs && brandOption.flightRefs.length > 0) {
                    flightDetailsHtml += `<div class="brand-option">`;
                    if (brandOption.ProductBrandOffering && brandOption.ProductBrandOffering.length > 0) {
                        const brand = brandOption.ProductBrandOffering[0].Brand;
                        if (brand && brand.BrandRef) {
                            const brandInfo = brandMap.get(brand.BrandRef);
                            const brandDescription = brandInfo && brandInfo.name ? brandInfo.name : brand.BrandRef;
                            flightDetailsHtml += `<div class="brand-info"><strong>Brand:</strong> ${brandDescription}</div>`;
                        }
                    }

                    // Display flight details for each flight reference
                    brandOption.flightRefs.forEach(flightRef => {
                        const flight = flightMap.get(flightRef);
                        if (flight) {
                            flightDetailsHtml += this.formatFlightDetail(flight);
                        }
                    });

                    flightDetailsHtml += `</div>`;
                }
            });
        }

        // If no ProductBrandOptions, try to find flight details directly
        if (!flightDetailsHtml && offering.flightRefs) {
            offering.flightRefs.forEach(flightRef => {
                const flight = flightMap.get(flightRef);
                if (flight) {
                    flightDetailsHtml += this.formatFlightDetail(flight);
                }
            });
        }

        return flightDetailsHtml || '<div class="no-details">Flight details not available</div>';
    }

    formatFlightDetail(flight) {
        const departure = flight.Departure;
        const arrival = flight.Arrival;
        const carrier = flight.carrier;
        const number = flight.number;
        const equipment = flight.equipment;
        const duration = flight.duration;

        return `
            <div class="flight-segment">
                <div class="flight-header">
                    <span class="flight-number">${carrier} ${number}</span>
                    <span class="aircraft">${equipment}</span>
                    ${duration ? `<span class="duration">${duration}</span>` : ''}
                </div>
                <div class="flight-times">
                    <div class="departure">
                        <div class="time">${departure.time}</div>
                        <div class="date">${departure.date}</div>
                        <div class="airport">${departure.location}</div>
                    </div>
                    <div class="flight-arrow">
                        <i class="fas fa-plane"></i>
                    </div>
                    <div class="arrival">
                        <div class="time">${arrival.time}</div>
                        <div class="date">${arrival.date}</div>
                        <div class="airport">${arrival.location}</div>
                        ${arrival.terminal ? `<div class="terminal">Terminal ${arrival.terminal}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    filterByConnectionType(offerings, referenceList, connectionType) {
        // Create a map of products for quick lookup
        const productMap = new Map();
        referenceList.forEach(ref => {
            if (ref['@type'] === 'ReferenceListProduct' && ref.Product) {
                ref.Product.forEach(product => {
                    productMap.set(product.id, product);
                });
            }
        });

        return offerings.filter(offering => {
            // Check if offering has ProductBrandOptions with product references
            if (offering.ProductBrandOptions && offering.ProductBrandOptions.length > 0) {
                for (const brandOption of offering.ProductBrandOptions) {
                    if (brandOption.ProductBrandOffering && brandOption.ProductBrandOffering.length > 0) {
                        for (const brandOffering of brandOption.ProductBrandOffering) {
                            if (brandOffering.Product && brandOffering.Product.length > 0) {
                                for (const productRef of brandOffering.Product) {
                                    const product = productMap.get(productRef.productRef);
                                    if (product && this.matchesConnectionType(product, connectionType)) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return false;
        });
    }

    matchesConnectionType(product, connectionType) {
        if (!product.FlightSegment) return false;
        
        const segmentCount = product.FlightSegment.length;
        
        switch (connectionType) {
            case 'StopDirect':
                // Direct flights have only 1 segment
                return segmentCount === 1;
            case 'StopOne':
                // 1 stop or less means 1 or 2 segments
                return segmentCount <= 2;
            case 'StopTwo':
                // 2 stops or less means 1, 2, or 3 segments
                return segmentCount <= 3;
            case 'StopAny':
                // Any number of stops - no filtering
                return true;
            default:
                return true;
        }
    }

    getPrimaryBrandDescription(offering, brandMap) {
        // Try to get the first brand from ProductBrandOptions
        if (offering.ProductBrandOptions && offering.ProductBrandOptions.length > 0) {
            const firstBrandOption = offering.ProductBrandOptions[0];
            if (firstBrandOption.ProductBrandOffering && firstBrandOption.ProductBrandOffering.length > 0) {
                const brand = firstBrandOption.ProductBrandOffering[0].Brand;
                if (brand && brand.BrandRef) {
                    const brandInfo = brandMap.get(brand.BrandRef);
                    if (brandInfo && brandInfo.name) {
                        return brandInfo.name;
                    }
                    return brand.BrandRef;
                }
            }
        }
        
        // Fallback to first brand in Brand array
        if (offering.Brand && offering.Brand.length > 0) {
            const firstBrand = offering.Brand[0];
            if (firstBrand.BrandRef) {
                const brandInfo = brandMap.get(firstBrand.BrandRef);
                if (brandInfo && brandInfo.name) {
                    return brandInfo.name;
                }
                return firstBrand.BrandRef;
            }
        }
        
        return 'N/A';
    }

    getPriceBreakdown(offering) {
        // Try to get price breakdown from ProductBrandOptions first
        if (offering.ProductBrandOptions && offering.ProductBrandOptions.length > 0) {
            const firstBrandOption = offering.ProductBrandOptions[0];
            if (firstBrandOption.ProductBrandOffering && firstBrandOption.ProductBrandOffering.length > 0) {
                const firstBrandOffering = firstBrandOption.ProductBrandOffering[0];
                return this.formatPriceBreakdown(firstBrandOffering.BestCombinablePrice);
            }
        }
        
        // Fallback to direct BestCombinablePrice
        if (offering.BestCombinablePrice) {
            return this.formatPriceBreakdown(offering.BestCombinablePrice);
        }
        
        return '<div class="no-breakdown">Price breakdown not available</div>';
    }

    formatPriceBreakdown(priceData) {
        if (!priceData) {
            return '<div class="no-breakdown">Price breakdown not available</div>';
        }

        const currency = priceData.CurrencyCode?.value || 'EUR';
        const base = priceData.Base || 0;
        const taxes = priceData.TotalTaxes || 0;
        const fees = priceData.TotalFees || 0;
        const total = priceData.TotalPrice || 0;

        let breakdownHtml = `
            <div class="breakdown-item">
                <span class="breakdown-label">Base Fare:</span>
                <span class="breakdown-value">${base.toFixed(2)} ${currency}</span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Taxes & Charges:</span>
                <span class="breakdown-value">${taxes.toFixed(2)} ${currency}</span>
            </div>
        `;

        if (fees > 0) {
            breakdownHtml += `
                <div class="breakdown-item">
                    <span class="breakdown-label">Fees:</span>
                    <span class="breakdown-value">${fees.toFixed(2)} ${currency}</span>
                </div>
            `;
        }

        breakdownHtml += `
            <div class="breakdown-item total">
                <span class="breakdown-label">Total:</span>
                <span class="breakdown-value">${total.toFixed(2)} ${currency}</span>
            </div>
        `;

        // Add detailed tax breakdown if available
        if (priceData.PriceBreakdown && priceData.PriceBreakdown.length > 0) {
            const priceBreakdown = priceData.PriceBreakdown[0];
            if (priceBreakdown.Amount && priceBreakdown.Amount.Taxes && priceBreakdown.Amount.Taxes.Tax) {
                breakdownHtml += '<div class="tax-details">';
                breakdownHtml += '<div class="tax-header">Tax Details:</div>';
                priceBreakdown.Amount.Taxes.Tax.forEach(tax => {
                    breakdownHtml += `
                        <div class="tax-item">
                            <span class="tax-code">${tax.taxCode}:</span>
                            <span class="tax-amount">${tax.value.toFixed(2)} ${currency}</span>
                        </div>
                    `;
                });
                breakdownHtml += '</div>';
            }
        }

        return breakdownHtml;
    }

    getCityName(airportCode) {
        // Simple airport code to city mapping
        const airportMap = {
            'BRU': 'Brussels',
            'OSL': 'Oslo',
            'LHR': 'London',
            'CDG': 'Paris',
            'FRA': 'Frankfurt',
            'AMS': 'Amsterdam',
            'MAD': 'Madrid',
            'FCO': 'Rome',
            'VIE': 'Vienna',
            'ZUR': 'Zurich',
            'JFK': 'New York',
            'LAX': 'Los Angeles',
            'ORD': 'Chicago',
            'DFW': 'Dallas',
            'ATL': 'Atlanta'
        };
        return airportMap[airportCode] || airportCode;
    }

    // UI State Management
    showLoading() {
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('searchBtn').disabled = true;
    }

    hideLoading() {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('searchBtn').disabled = false;
    }

    showResults() {
        document.getElementById('resultsSection').classList.remove('hidden');
    }

    hideResults() {
        document.getElementById('resultsSection').classList.add('hidden');
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorState').classList.remove('hidden');
    }

    hideError() {
        document.getElementById('errorState').classList.add('hidden');
    }

    // Configuration Management
    loadSavedConfig() {
        const saved = localStorage.getItem('travelportConfig');
        if (saved) {
            const config = JSON.parse(saved);
            this.apiConfig = { ...this.apiConfig, ...config };
        }
    }

    saveConfig() {
        const config = {
            username: document.getElementById('apiUsername').value,
            password: document.getElementById('apiPassword').value,
            clientId: document.getElementById('clientId').value,
            clientSecret: document.getElementById('clientSecret').value
        };
        
        this.apiConfig = { ...this.apiConfig, ...config };
        localStorage.setItem('travelportConfig', JSON.stringify(config));
        this.closeConfigModal();
        
        // Clear the access token to force re-authentication with new credentials
        this.accessToken = null;
    }
}

// Modal Functions
function openConfigModal() {
    const modal = document.getElementById('configModal');
    const config = app.apiConfig;
    
    document.getElementById('apiUsername').value = config.username;
    document.getElementById('apiPassword').value = config.password;
    document.getElementById('clientId').value = config.clientId;
    document.getElementById('clientSecret').value = config.clientSecret;
    
    modal.classList.remove('hidden');
}

function closeConfigModal() {
    document.getElementById('configModal').classList.add('hidden');
}

function saveConfig() {
    app.saveConfig();
}

function hideError() {
    app.hideError();
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FlightSearchApp();
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('configModal');
    if (e.target === modal) {
        closeConfigModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeConfigModal();
    }
});

// Developer Tools Functions
function toggleDevTools() {
    const devTools = document.getElementById('devTools');
    devTools.classList.toggle('hidden');
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        // Show a brief success message
        const button = event.target.closest('.copy-btn');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.style.background = '#10b981';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '#667eea';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy to clipboard');
    });
}

// Store request/response data for developer tools
let lastRequestData = null;
let lastResponseData = null;
let requestStartTime = null;

// Override the original search method to capture request/response data
const originalSearch = FlightSearchApp.prototype.searchFlights;

FlightSearchApp.prototype.searchFlights = async function(searchParams) {
    // Capture request data
    lastRequestData = {
        endpoint: this.apiConfig.searchUrl,
        method: 'POST',
        timestamp: new Date().toISOString(),
        params: searchParams
    };
    
    // Update developer tools display
    updateDevToolsDisplay();
    
    // Start timing
    requestStartTime = Date.now();
    
    try {
        const result = await originalSearch.call(this, searchParams);
        
        // Fetch the actual Travelport API request details from server
        try {
            const apiRequestResponse = await fetch('/api/dev/last-request');
            if (apiRequestResponse.ok) {
                const apiRequestData = await apiRequestResponse.json();
                lastRequestData = {
                    ...lastRequestData,
                    travelportApi: apiRequestData
                };
            }
        } catch (err) {
            console.log('Could not fetch API request details:', err);
        }
        
        // Capture response data
        lastResponseData = {
            success: true,
            timestamp: new Date().toISOString(),
            data: result
        };
        
        // Update developer tools display
        updateDevToolsDisplay();
        
        return result;
    } catch (error) {
        // Capture error response
        lastResponseData = {
            success: false,
            timestamp: new Date().toISOString(),
            error: error.message,
            details: error
        };
        
        // Update developer tools display
        updateDevToolsDisplay();
        
        throw error;
    }
};

function updateDevToolsDisplay() {
    // Update request display
    if (lastRequestData) {
        const requestDisplay = document.getElementById('lastRequest');
        if (requestDisplay) {
            // Show the actual Travelport API request if available
            if (lastRequestData.travelportApi) {
                requestDisplay.textContent = JSON.stringify(lastRequestData.travelportApi, null, 2);
            } else {
                requestDisplay.textContent = JSON.stringify(lastRequestData, null, 2);
            }
        }
        
        // Update request details
        if (lastRequestData.travelportApi) {
            document.getElementById('requestEndpoint').textContent = lastRequestData.travelportApi.url;
            document.getElementById('requestMethod').textContent = lastRequestData.travelportApi.method;
        } else {
            document.getElementById('requestEndpoint').textContent = lastRequestData.endpoint;
            document.getElementById('requestMethod').textContent = lastRequestData.method;
        }
    }
    
    // Update response display
    if (lastResponseData) {
        const responseDisplay = document.getElementById('lastResponse');
        if (responseDisplay) {
            responseDisplay.textContent = JSON.stringify(lastResponseData, null, 2);
        }
        
        // Update status
        document.getElementById('requestStatus').textContent = lastResponseData.success ? 'Success' : 'Error';
        
        // Update response time
        if (requestStartTime) {
            const responseTime = Date.now() - requestStartTime;
            document.getElementById('requestTime').textContent = `${responseTime}ms`;
        }
    }
}
