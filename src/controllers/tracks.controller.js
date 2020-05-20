const multer = require('multer');
const {getConection} = require('../database');
const {GridFSBucket, ObjectID} = require('mongodb');
const {Readable} = require('stream');

const getTrack = (req,res) =>{

    let trackID;
    try {
        trackID = new ObjectID(req.params.trackID)
    } catch (error){
        return res.status(400).json({message:"Invalid track ID in URL"});
    }

    res.set('content-type', 'audio/mp3');
    res.set('accept-ranges', 'bytes');

    const db = getConection();
    const bucket = new GridFSBucket(db,{
        bucketName: 'tracks'
    });

    let downloadStream = bucket.openDownloadStream(trackID);

    downloadStream.on('data', chunk =>{
        res.write(chunk);
    });

    downloadStream.on('error', () =>{
        res.sendStatus(404);
    });

    downloadStream.on('end', () =>{
        res.end();
    });
}

const uploadTrack =(req,res) =>{
    const storage = multer.memoryStorage();
    const upload = multer({
        storage,
        limits:{
            fields:1,
            fieldSize:6000000,
            files:1,
            parts:2
        }
    });
    //tener el archivo
    upload.single('track')(req, res, (err) =>{
        if(err){
            console.log(err);
            return res.status(400).json({message : err.message});
        }else if(!req.body.name){
            return res.status(400).json({message : "No track name in request body"});
        }

        let trackName =req.body.name;

        //convertir en un string legible
        const readableTrackString = new Readable();
        readableTrackString.push(req.file.buffer);
        readableTrackString.push(null);

        //conexion con mongodb
        const db = getConection();
        const bucket = new GridFSBucket(db,{
            bucketName: 'tracks'
        });

        //Convertir buffer a un string
        let uploadStream = bucket.openUploadStream(trackName);
        const id = uploadStream.id;
        readableTrackString.pipe(uploadStream);

        //manejar eventos del string
        uploadStream.on('err', () =>{
            return res.status(500).json({message : "Error uploading you file"});
        });
        uploadStream.on('finish', () =>{
            return res.status(201).json({message:"File Uploaded Successfully, stored under ID " + id});
        });
        });
}

module.exports ={
    getTrack,
    uploadTrack
}