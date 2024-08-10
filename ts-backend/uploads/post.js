const multer = require('multer');
const upload = multer();
const { File } = require('../mongo');
const router = require('../consumptionsroutes/postHeat');


router.post('/upload', upload.none(), async (req, res) => {
    try {
        // Save the file information in the database
        const newFile = new File({
            name: req.body.name,
            propertyId: req.body.propertyId,
            url: req.body.url,
        });
    
        newFile.save()
            .then(() => res.json(newFile))
            .catch(err => res.status(500).json({ error: err.message }));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    });

module.exports = router ;