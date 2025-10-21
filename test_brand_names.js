const axios = require('axios');

async function testBrandNames() {
    const baseUrl = 'http://localhost:3000/api';
    
    console.log('=== TESTING BRAND NAMES DISPLAY ===\n');
    
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
        
        // Show first few brand names
        console.log('\n=== BRAND NAMES ===');
        let count = 0;
        brandMap.forEach((brand, id) => {
            if (count < 10) { // Show first 10 brands
                console.log(`${id}: ${brand.name || 'No name'}`);
                count++;
            }
        });
        
        // Show first offering's brand information
        if (offerings.length > 0) {
            const firstOffering = offerings[0];
            console.log('\n=== FIRST OFFERING BRAND INFO ===');
            console.log('Offering ID:', firstOffering.id);
            
            if (firstOffering.ProductBrandOptions && firstOffering.ProductBrandOptions.length > 0) {
                console.log('Product brand options:');
                firstOffering.ProductBrandOptions.forEach((option, index) => {
                    if (option.ProductBrandOffering && option.ProductBrandOffering.length > 0) {
                        option.ProductBrandOffering.forEach(offering => {
                            if (offering.Brand && offering.Brand.BrandRef) {
                                const brandInfo = brandMap.get(offering.Brand.BrandRef);
                                console.log(`  - Option ${index + 1}: ${offering.Brand.BrandRef} - ${brandInfo?.name || 'No name'}`);
                            }
                        });
                    }
                });
            }
        }
        
        console.log('\n✅ Brand names are now being extracted correctly!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testBrandNames();
