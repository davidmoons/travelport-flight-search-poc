const axios = require('axios');

async function testBrandDescriptions() {
    const baseUrl = 'http://localhost:3000/api';
    
    console.log('=== TESTING BRAND DESCRIPTIONS ===\n');
    
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
        const referenceList = response.data.CatalogProductOfferingsResponse?.ReferenceList || [];
        
        console.log(`Found ${offerings.length} offerings`);
        
        // Create brand map
        const brandMap = new Map();
        referenceList.forEach(ref => {
            if (ref['@type'] === 'ReferenceListBrand' && ref.Brand) {
                ref.Brand.forEach(brand => {
                    brandMap.set(brand.id, brand);
                });
            }
        });
        
        console.log(`Found ${brandMap.size} brands in reference list`);
        
        // Show first few brand descriptions
        console.log('\n=== BRAND DESCRIPTIONS ===');
        brandMap.forEach((brand, id) => {
            console.log(`${id}:`, JSON.stringify(brand, null, 2));
        });
        
        // Show first offering's brand information
        if (offerings.length > 0) {
            const firstOffering = offerings[0];
            console.log('\n=== FIRST OFFERING BRAND INFO ===');
            console.log('Offering ID:', firstOffering.id);
            
            if (firstOffering.Brand && firstOffering.Brand.length > 0) {
                console.log('Available brands:');
                firstOffering.Brand.forEach(brandRef => {
                    const brandInfo = brandMap.get(brandRef.BrandRef);
                    console.log(`  - ${brandRef.BrandRef}: ${brandInfo?.Description || 'No description'}`);
                });
            }
            
            if (firstOffering.ProductBrandOptions && firstOffering.ProductBrandOptions.length > 0) {
                console.log('Product brand options:');
                firstOffering.ProductBrandOptions.forEach((option, index) => {
                    if (option.ProductBrandOffering && option.ProductBrandOffering.length > 0) {
                        option.ProductBrandOffering.forEach(offering => {
                            if (offering.Brand && offering.Brand.BrandRef) {
                                const brandInfo = brandMap.get(offering.Brand.BrandRef);
                                console.log(`  - Option ${index + 1}: ${offering.Brand.BrandRef} - ${brandInfo?.Description || 'No description'}`);
                            }
                        });
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testBrandDescriptions();
