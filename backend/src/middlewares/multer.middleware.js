import multer from 'multer';
import path from "path";

// Storage configuration ke liye multer ka diskStorage use kar rahe hain
const storage = multer.diskStorage({
    // Ye function upload ki destination folder set karta hai
    destination: function (req, file, cb) {
        // Files ko './public/temp' folder mein save karenge
        cb(null, './public/temp');
    },
    // Ye function file ka naam set karta hai
    filename: function (req, file, cb) {
        if (!file) {
            return cb(new Error("File is undefined"), "default.png");
        }
        // File ka naam 'fieldname-Date.now' format mein banate hain
        const ext = file.originalname ? path.extname(file.originalname) : "";
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

// Multer instance create karte hain storage config ke saath
export const upload = multer({ storage });
