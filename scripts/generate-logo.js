const fs = require('fs');
const path = require('path');

const generateLogo = () => {
  const width = 600;
  const height = 400;
  
  // Left Sphere: Purple Gradient
  const leftX = 220;
  const leftY = 200;
  const leftR = 150;
  
  // Right Sphere: Halftone Halves
  const rightX = 380;
  const rightY = 200;
  const rightR = 150;

  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <!-- Background Gradient for Left Sphere -->
    <radialGradient id="purpleGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#c084fc" />     <!-- light purple -->
      <stop offset="40%" stop-color="#8b5cf6" />    <!-- primary purple -->
      <stop offset="85%" stop-color="#5b21b6" />    <!-- dark purple -->
      <stop offset="100%" stop-color="#3b0764" />   <!-- deep shadow -->
    </radialGradient>

    <!-- Glowing Intersection Overlay -->
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#f5d0fe" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#d8b4fe" stop-opacity="0" />
    </radialGradient>

    <!-- Drop Shadow for Spheres -->
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Left Sphere (Solid Gradient) with shadow -->
  <circle cx="${leftX}" cy="${leftY}" r="${leftR}" fill="url(#purpleGrad)" filter="url(#shadow)" />

  <!-- Right Sphere (Halftone Dotted Sphere) -->
  <g filter="url(#shadow)">
`;

  // Generate 3D Spherical Halftone Dots for the Right Sphere
  // We use orthographic projection of points on a sphere
  // Latitude and Longitude steps
  const latSteps = 24;
  const lonSteps = 24;
  
  for (let i = 0; i <= latSteps; i++) {
    // Latitude angle from -90 to +90 degrees
    const lat = -Math.PI / 2 + (i / latSteps) * Math.PI;
    
    for (let j = 0; j <= lonSteps; j++) {
      // Longitude angle from -90 to +90 degrees (front hemisphere)
      const lon = -Math.PI / 2 + (j / lonSteps) * Math.PI;
      
      // Calculate 3D sphere coordinate
      const x = rightR * Math.cos(lat) * Math.sin(lon);
      const y = rightR * Math.sin(lat);
      const z = rightR * Math.cos(lat) * Math.cos(lon); // Depth
      
      // Only draw dots on the front hemisphere (z >= 0)
      if (z >= 0) {
        // Project onto 2D plane
        const px = rightX + x;
        const py = rightY - y;
        
        // Calculate distance from center to apply spherical perspective sizing
        // Dots are larger on the left (overlap region) and smaller/fading on the right
        // Left side corresponds to negative 'lon' values (-PI/2 is far left, +PI/2 is far right)
        // We calculate factor based on longitude: 0 at far right, 1 at far left
        const leftFactor = (Math.PI / 2 - lon) / Math.PI; // 1 at far left, 0 at far right
        
        // Sizing based on depth (z) and left factor
        const baseRadius = 4.2;
        // Dot radius shrinks as it goes right, and shrinks as it approaches the sphere edges (depth roll-off)
        const depthFactor = Math.sin(Math.acos(Math.sqrt(x*x + y*y) / rightR)); // edge fade
        
        if (!isNaN(depthFactor) && depthFactor > 0.15) {
          const dotRadius = baseRadius * (0.35 + 1.25 * leftFactor) * (0.4 + 0.6 * depthFactor);
          
          // Color transition: pure magenta on the left, fading to light pink/white dots on the right edge
          const opacity = 0.2 + 0.8 * depthFactor * (0.4 + 0.6 * leftFactor);
          const color = `rgb(${Math.floor(219 + 36 * (1 - leftFactor))}, ${Math.floor(39 + 180 * (1 - leftFactor))}, 119)`; // transitions from magenta (#db2777) to light pink/purple
          
          svgContent += `    <circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="${dotRadius.toFixed(2)}" fill="${color}" opacity="${opacity.toFixed(2)}" />\n`;
        }
      }
    }
  }

  svgContent += `  </g>

  <!-- Glowing Crescent Lens Intersection Overlay -->
  <!-- Intersection center lies between leftX and rightX -->
  <!-- We place a soft glowing white light mask right at the overlapping intersection boundary -->
  <path d="M 280,75 A 150,150 0 0,1 328,325 A 150,150 0 0,0 280,75 Z" fill="url(#glowGrad)" opacity="0.85" />
  <circle cx="300" cy="200" r="45" fill="#ffffff" opacity="0.3" filter="blur(8px)" />

</svg>
`;

  const imagesDir = path.join(__dirname, '..', 'assets', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const logoPath = path.join(imagesDir, 'logo.svg');
  fs.writeFileSync(logoPath, svgContent, 'utf8');
  console.log(`Successfully generated mathematical vector logo at ${logoPath}`);
};

generateLogo();
