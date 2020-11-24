const multer = require("multer");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_ID_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    acl: process.env.AWS_ACL,
    bucket: process.env.AWS_BUCKET_NAME,
    key: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(img||jpg||jpeg||png)/)) {
      return cb(new Error("Upload Image File!"));
    }
    cb(undefined, true);
  },
});

module.exports = {
  upload,
};
