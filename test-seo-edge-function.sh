#!/bin/bash

# Test Script for SEO Edge Function
# This script tests the serve-seo-meta Edge Function by simulating various crawlers

echo "🔍 Testing SEO Edge Function"
echo "=============================="
echo ""

# Configuration
EDGE_FUNCTION_URL="https://fhtuqmdlgzmpsbflxhra.supabase.co/functions/v1/serve-seo-meta"
BASE_URL="https://spirit-candle.com"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test a URL with a specific user agent
test_url() {
    local url=$1
    local user_agent=$2
    local page_name=$3
    
    echo -e "${YELLOW}Testing: ${page_name}${NC}"
    echo "URL: ${url}"
    echo "User-Agent: ${user_agent}"
    echo ""
    
    # Make the request
    response=$(curl -s -H "User-Agent: ${user_agent}" "${EDGE_FUNCTION_URL}?path=${url}")
    
    # Check if we got HTML back
    if echo "$response" | grep -q "<title>"; then
        title=$(echo "$response" | grep -o '<title>[^<]*</title>' | sed 's/<[^>]*>//g')
        og_title=$(echo "$response" | grep -o 'og:title" content="[^"]*"' | sed 's/og:title" content="//;s/"//')
        og_image=$(echo "$response" | grep -o 'og:image" content="[^"]*"' | sed 's/og:image" content="//;s/"//')
        
        echo -e "${GREEN}✓ Success${NC}"
        echo "Title: $title"
        echo "OG Title: $og_title"
        echo "OG Image: $og_image"
    else
        echo -e "${RED}✗ Failed - No HTML returned${NC}"
        echo "Response: $response"
    fi
    
    echo ""
    echo "---"
    echo ""
}

# Test Homepage (English)
test_url "/" "facebookexternalhit/1.0" "Homepage (EN)"

# Test Homepage (Polish)
test_url "/pl" "facebookexternalhit/1.0" "Homepage (PL)"

# Test Shop Page (English)
test_url "/en/shop" "twitterbot/1.0" "Shop (EN)"

# Test About Page (English)
test_url "/en/about" "linkedinbot/1.0" "About (EN)"

# Test About Page (Polish)
test_url "/pl/about" "facebookexternalhit/1.0" "About (PL)"

# Test Contact Page
test_url "/contact" "facebookexternalhit/1.0" "Contact"

# Test Custom Candles Page
test_url "/en/custom-candles" "twitterbot/1.0" "Custom Candles"

# Test with non-crawler user agent (should return JSON message)
echo -e "${YELLOW}Testing: Non-crawler user agent${NC}"
echo "URL: /"
echo "User-Agent: Mozilla/5.0 (regular browser)"
echo ""

non_crawler_response=$(curl -s -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${EDGE_FUNCTION_URL}?path=/")
if echo "$non_crawler_response" | grep -q "This endpoint is for crawlers only"; then
    echo -e "${GREEN}✓ Correctly returns message for non-crawlers${NC}"
else
    echo -e "${RED}✗ Unexpected response for non-crawler${NC}"
    echo "Response: $non_crawler_response"
fi

echo ""
echo "---"
echo ""
echo "=============================="
echo "Testing Complete!"
echo ""
echo "Next Steps:"
echo "1. Deploy the Edge Function: supabase functions deploy serve-seo-meta"
echo "2. Update netlify.toml or vercel.json with correct Supabase URL"
echo "3. Test with Facebook Debugger: https://developers.facebook.com/tools/debug/"
echo "4. Test with Twitter Card Validator: https://cards-dev.twitter.com/validator"
echo ""

