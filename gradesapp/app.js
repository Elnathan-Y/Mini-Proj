const express = require('express');
const mysql = require('mysql2');
const app = express();
const multer =require('multer');

//multer for file upload
const storage =multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/images'); //directory to save uploaded file
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    }
});
const upload=multer({storage:storage});
// Create MySQL connection
const connection = mysql.createConnection({
host: 'localhost',
user: 'root',
password: '',
database: 'miniproj'
});
connection.connect((error) => {
if (error) {
console.error('Error connecting to MySQL:', error);
return;
}
console.log('Connected to MySQL database');
});
// Set up view engine
app.set('view engine', 'ejs');


// enable static files
app.use(express.static('public'));


// form processing
app.use(express.urlencoded({
    extended:false
}));

// Example:
// app.get('/', (req, res) => {
// connection.query('SELECT * FROM TABLE', (error, results) => {
// if (error) throw error;
// res.render('index', { results }); // Render HTML page with data
// });
// });
app.get('/',(req,res)=>{
    const sql ='SELECT * FROM semesters';
    connection.query(sql,(error,results)=>{
        if (error){
            console.error('Database query error:',error.message);
            return res.status(500).send('Error Retrieving semesters');

        }
        res.render('index',{semesters:results});
    });
});




app.get('/semesters/:id',(req,res)=>{
    const semesterId=req.params.id;
    const sql="SELECT * FROM semesters WHERE semesterId = ?";
    connection.query(sql,[semesterId],(error,results)=>{
        if (error){
            console.error("Database query error:",error.message);
            return res.status(500).send("Error Retrieving semester by ID");
        }
        if (results.length >0){
            res.render('semester',{semester :results [0]});
        }else {
            res.status(404).send('semester not found');
        }
    });
});

app.get('/addSemester',(req,res)=>{
    res.render('addSemester');
});
app.post('/addSemester',upload.single('image'),(req,res)=>{
        const {semestername,modulename,grade,coverimage}=req.body;
        let image;
        if (req.file){
            image=req.file.filename;//Save only filename
        }else{
            image=null;
        }
        const sql="INSERT INTO semesters (semestername,modulename,grade,coverimage) VALUES (?,?,?,?)";
        connection.query (sql, [semestername,modulename,grade,coverimage],(error,results)=>{
            if (error){
                console.error("Error adding semester:",error);
                res.status(500).send('Error Adding semester');
            } else {
                res.redirect('/');
            }
        });
    
});

app.get('/semester/:id/update',upload.single('image'),(req,res)=>{
    const semesterId =req.params.id;
    const sql ='SELECT * FROM semesters WHERE semesterId =?';
    //Fetch data from MYSQL based on ID 
    connection.query(sql,[semesterId],(error,results)=>{
        if (error){
            console("Datatbase query error:",error.message);
            return res.status(500).send('Error retrieving semester by ID');
        }
        //CHECK IF ANY Student WITH THE GIVEN ID WAS FOUND 
        if (results.length>0){
            //RENDER HTML PAGE WITH Student DATA
            res.render('editSemester',{semester:results[0]});
        
        } else {
            res.status(404).send('Semester not found');
        }
    });
});

app.post('/semester/:id/update',upload.single('image'),(req,res)=>{
    const semesterId=req.params.id;
    //extract product data from the request body
    const {semestername,modulename,grade}=req.body;

    let image=req.body.currentImage;//retrieve current img filename
    if (req.file){ //if new img is uploaded
        image=req.file.filename; //set img to be new img filename
    }
    const sql ='UPDATE semesters SET semestername =?,modulename=?,grade=? ,coverimage=?WHERE semesterId=?';

    //INSERTING THE NEW stu IN DATABASE
    connection.query(sql,[semestername,modulename,grade,coverimage,semesterId],(error,results)=>{
        if (error){
            //Handle any error that occurs during the database operation
            console.error("Error updating semester: ",error);
            res.status(500).send('Error updating semester');

        } else {
            //SUCESS RESPONSE
            res.redirect('/');
        }
    });
});

app.get('/deleteSemester/:id',(req,res)=>{
    const semesterId=req.params.id;
    const sql ='DELETE FROM semesters WHERE semesterId=?';
    connection.query(sql,[semesterId],(error,results)=>{
        if(error){
            //HANDLE ERRORS
            console.error("Error deleting semester:",error);
            res.status(500).send('Error deleting semester');

        }else{
            //success
            res.redirect('/');
        }
    });
});




const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

