const axios = require('axios');

async function testPriceBreakdown() {
    const baseUrl = 'http://localhost:3000/api';
    
    console.log('=== TESTING PRICE BREAKDOWN ===\n');
    
    try {
        const response = await axios.post(`${baseUrl}/search`, {
            origin: 'BRU',
            destination: 'OSL',
            departureDate: '2025-10-17',
            returnDate: '2025-10-23',
            passengers: '1',
            cabinClass: 'Economy',
            flightType: 'StopDirect',
            carriers: ''
        });
        
        const offerings = response.data.CatalogProductOfferingsResponse?.CatalogProductOfferings?.CatalogProductOffering || [];
        
        console.log(`Found ${offerings.length} offerings\n`);
        
        if (offerings.length > 0) {
            const firstOffering = offerings[0];
            console.log('=== FIRST OFFERING PRICE BREAKDOWN ===');
            
            // Check if offering has ProductBrandOptions
            if (firstOffering.ProductBrandOptions && firstOffering.ProductBrandOptions.length > 0) {
                const firstBrandOption = firstOffering.ProductBrandOptions[0];
                if (firstBrandOption.ProductBrandOffering && firstBrandOption.ProductBrandOffering.length > 0) {
                    const firstBrandOffering = firstBrandOption.ProductBrandOffering[0];
                    const priceData = firstBrandOffering.BestCombinablePrice;
                    
                    if (priceData) {
                        console.log('Currency:', priceData.CurrencyCode?.value || 'EUR');
                        console.log('Base Fare:', priceData.Base || 0);
                        console.log('Total Taxes:', priceData.TotalTaxes || 0);
                        console.log('Total Fees:', priceData.TotalFees || 0);
                        console.log('Total Price:', priceData.TotalPrice || 0);
                        
                        // Show detailed tax breakdown
                        if (priceData.PriceBreakdown && priceData.PriceBreakdown.length > 0) {
                            const priceBreakdown = priceData.PriceBreakdown[0];
                            if (priceBreakdown.Amount && priceBreakdown.Amount.Taxes && priceBreakdown.Amount.Taxes.Tax) {
                                console.log('\nDetailed Tax Breakdown:');
                                priceBreakdown.Amount.Taxes.Tax.forEach(tax => {
                                    console.log(`  ${tax.taxCode}: ${tax.value}`);
                                });
                            }
                        }
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('Error testing price breakdown:', error.response?.data || error.message);
    }
}

testPriceBreakdown();
