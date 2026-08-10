// Converts a File (from a device file picker) into a base64 data URL,
// the same storage approach already used for profile pictures.
// Recipe images can get large, so we cap uploads at 3MB to keep documents/API payloads sane.
export function fileToDataURL(file, maxSizeMB = 3) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file provided"));
    if (file.size > maxSizeMB * 1024 * 1024) {
      return reject(new Error(`Image is too large — please use a file under ${maxSizeMB}MB`));
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}