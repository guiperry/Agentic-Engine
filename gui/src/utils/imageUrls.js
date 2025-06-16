/**
 * Sample image URLs for agent creation
 * These images are used as default profile pictures when creating new agents
 * @type {string[]}
 */
export const sampleAgentImages = [
  'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/5380617/pexels-photo-5380617.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/5380613/pexels-photo-5380613.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/5380665/pexels-photo-5380665.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/5380668/pexels-photo-5380668.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/5380671/pexels-photo-5380671.jpeg?auto=compress&cs=tinysrgb&w=400'
];

/**
 * Get a random image URL from the sample images
 * @returns {string} A randomly selected image URL
 */
export const getRandomAgentImage = () => {
  const randomIndex = Math.floor(Math.random() * sampleAgentImages.length);
  return sampleAgentImages[randomIndex];
};