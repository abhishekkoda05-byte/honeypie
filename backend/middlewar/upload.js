
const multer = require("multer");
const cloudinary = require("../cloudinary/clodinary");

const storage = {
    _handleFile(req, file, callback) {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "honeypie/products"
            },
            (error, result) => {
                if (error) {
                    return callback(error);
                }

                if (!result || !result.public_id) {
                    return callback(
                        new Error("Cloudinary did not return a public ID")
                    );
                }

                console.log("Cloudinary uploaded:", result.public_id);

                callback(null, {
                    path: result.secure_url,
                    filename: result.public_id
                });
            }
        );

        file.stream.pipe(stream);
    },

    _removeFile(req, file, callback) {
        console.log("Removing Cloudinary file:", file.filename);

        if (!file.filename) {
            console.log("Missing public ID during cleanup");
            return callback(null);
        }

        cloudinary.uploader.destroy(file.filename)
            .then((result) => {
                console.log("Cloudinary delete result:", result);
                callback(null);
            })
            .catch(callback);
    }
};

const upload = multer({ storage });
console.log("UPDATED CLOUDINARY MIDDLEWARE LOADED");

module.exports = upload;