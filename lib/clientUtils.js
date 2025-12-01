export function toFormData(file, lat, lon, mlResult) {
  const formData = new FormData();
  formData.append('file', file);
  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);
  if (mlResult) formData.append('mlResult', JSON.stringify(mlResult));
  return formData;
}

export function scaleBoxes(boxes, imgNaturalWidth, imgNaturalHeight, displayWidth, displayHeight) {
  const scaleX = displayWidth / imgNaturalWidth;
  const scaleY = displayHeight / imgNaturalHeight;
  
  return boxes.map(box => ({
    ...box,
    x1: box.x1 * scaleX,
    y1: box.y1 * scaleY,
    x2: box.x2 * scaleX,
    y2: box.y2 * scaleY,
  }));
}

export function validateFile(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }
  
  return { valid: true };
}
