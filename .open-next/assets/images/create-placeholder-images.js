// Create placeholder images for development
const placeholderImages = [
  { name: 'hero.jpg', color: '#3B82F6' },
  { name: 'destinations-hero.jpg', color: '#1E40AF' },
  { name: 'activities-hero.jpg', color: '#047857' },
  { name: 'about-hero.jpg', color: '#1E3A8A' },
  { name: 'contact-hero.jpg', color: '#1E3A8A' },
  { name: 'havelock.jpg', color: '#60A5FA' },
  { name: 'neil.jpg', color: '#34D399' },
  { name: 'port_blair.jpg', color: '#F59E0B' },
  { name: 'baratang.jpg', color: '#8B5CF6' },
  { name: 'scuba.jpg', color: '#0EA5E9' },
  { name: 'sea-walking.jpg', color: '#0369A1' },
  { name: 'jet-ski.jpg', color: '#F43F5E' },
  { name: 'glass-boat.jpg', color: '#0EA5E9' },
  { name: 'trekking.jpg', color: '#65A30D' },
  { name: 'snorkeling.jpg', color: '#0891B2' },
  { name: 'team-1.jpg', color: '#6366F1' },
  { name: 'team-2.jpg', color: '#8B5CF6' },
  { name: 'team-3.jpg', color: '#EC4899' },
  { name: 'team-4.jpg', color: '#F97316' },
  { name: 'map.jpg', color: '#94A3B8' },
  { name: 'placeholder.jpg', color: '#CBD5E1' }
];

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create the public/images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Create placeholder images
placeholderImages.forEach(({ name, color }) => {
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  // Add text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, width / 2, height / 2);

  // Save the image
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(path.join(imagesDir, name), buffer);
  console.log(`Created placeholder image: ${name}`);
});

console.log('All placeholder images created successfully!');
