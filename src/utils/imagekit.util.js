const ImageKit = require("imagekit");
require("dotenv").config({ path: "./.env" });

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

/**
 * Upload image to ImageKit
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileName - Name of the file
 * @returns {Promise<Object>} - Upload response with fileId and url
 */
const uploadImage = async (fileBuffer, fileName) => {
  try {
    const result = await imagekit.upload({
      file: fileBuffer,
      fileName: fileName,
      folder: "/blog-images", // Organize images in a folder
    });

    return {
      fileId: result.fileId,
      url: result.url,
      name: result.name,
    };
  } catch (error) {
    console.error("ImageKit upload error:", error);
    throw new Error("Failed to upload image to ImageKit");
  }
};

/**
 * Delete image from ImageKit
 * @param {string} fileId - ImageKit file ID
 * @returns {Promise<void>}
 */
const deleteImage = async (fileId) => {
  try {
    await imagekit.deleteFile(fileId);
    console.log(`✅ Image deleted from ImageKit: ${fileId}`);
  } catch (error) {
    console.error("ImageKit delete error:", error);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
