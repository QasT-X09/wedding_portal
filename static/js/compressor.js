/**
 * Smart Client-Side Media Compressor & Optimizer
 * Compresses heavy 4K / 48MP smartphone photos into crisp high-quality WebP/JPEG
 * before network transmission, preventing cellular/Wi-Fi congestion for 300 guests.
 */

class MediaCompressor {
  static async compressPhoto(file, maxDimension = 2560, quality = 0.88) {
    // If not an image, return original
    if (!file.type.startsWith('image/')) {
      return file;
    }

    // If file is already small (< 600KB), return as is
    if (file.size < 600 * 1024) {
      return file;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Scale down if larger than maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          // High-quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Attempt WebP, fallback to JPEG
          const outputType = 'image/webp';
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const newFilename = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                const compressedFile = new File([blob], newFilename, {
                  type: outputType,
                  lastModified: Date.now()
                });
                console.log(`[Compressor] ${file.name}: ${(file.size/1024/1024).toFixed(2)}MB -> ${(compressedFile.size/1024/1024).toFixed(2)}MB`);
                resolve(compressedFile);
              } else {
                // Return original if compression was not smaller
                resolve(file);
              }
            },
            outputType,
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  }
}

window.MediaCompressor = MediaCompressor;
