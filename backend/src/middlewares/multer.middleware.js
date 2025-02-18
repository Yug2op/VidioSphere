import multer from 'multer';

// Storage configuration ke liye multer ka diskStorage use kar rahe hain
const storage = multer.diskStorage({
    // Ye function upload ki destination folder set karta hai
    destination: function (req, file, cb) {
        // Files ko './public/temp' folder mein save karenge
        cb(null, './public/temp');
    },
    // Ye function file ka naam set karta hai
    filename: function (req, file, cb) {
        // File ka naam 'fieldname-Date.now' format mein banate hain
        cb(null, file.fieldname + '-' + Date.now() + ".png");
    }
});

// Multer instance create karte hain storage config ke saath
export const upload = multer({ storage });
