#!/bin/bash

# Create the font directory if it doesn't exist
mkdir -p src/fonts

# Download Britti Sans font files from BeFont's website
# Note: This is a demo script - in a real project you would obtain the fonts legally

echo "Please download Britti Sans font from: https://befonts.com/britti-sans-font-family.html"
echo "Then save the following font files to src/fonts/:"
echo "- BrittiSansTrial-Regular.otf"
echo "- BrittiSansTrial-Bold.otf"
echo "- BrittiSansTrial-RegularItalic.otf"
echo "- BrittiSansTrial-BoldItalic.otf"

echo ""
echo "After downloading, run: chmod +x download-fonts.sh && ./download-fonts.sh"
echo ""
echo "For legal reasons, we cannot download the fonts automatically."
echo "Please manually download them from the official source." 