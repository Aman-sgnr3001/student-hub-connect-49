const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import all models
const Student = require('../models/student');
const Faculty = require('../models/admin');
const GPA = require('../models/academics');
const Activities = require('../models/curriculam');
const Extracurriculam = require('../models/extracurriculam');
const Interned = require('../models/inters');
const Company = require('../models/placed');
const Skill = require('../models/skills');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// File filter for PDF only
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('Connected to MongoDB successfully');
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Student Hub Connect API is running!',
        models: [
            'Student',
            'Faculty', 
            'GPA',
            'Activities',
            'Extracurriculam',
            'Interned',
            'Company',
            'Skill'
        ]
    });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API routes are working!' });
});

// Student Registration Route
app.post('/api/student/register', async (req, res) => {
    try {
        const { sid, sname, emailid, password, degree, course } = req.body;

        // Validate required fields
        if (!sid || !sname || !emailid || !password || !degree || !course) {
            return res.status(400).json({ 
                error: 'All fields are required: sid, sname, emailid, password, degree, course' 
            });
        }

        // Check if student already exists
        const existingStudent = await Student.findOne({ 
            $or: [{ sid }, { emailid }] 
        });
        
        if (existingStudent) {
            return res.status(400).json({ 
                error: 'Student with this ID or email already exists' 
            });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new student
        const newStudent = new Student({
            sid,
            sname,
            emailid,
            password: hashedPassword,
            degree,
            course
        });

        // Save student to database
        const savedStudent = await newStudent.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                studentId: savedStudent._id,
                sid: savedStudent.sid,
                emailid: savedStudent.emailid 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Prepare student data (exclude password)
        const studentData = {
            _id: savedStudent._id,
            sid: savedStudent.sid,
            sname: savedStudent.sname,
            emailid: savedStudent.emailid,
            degree: savedStudent.degree,
            course: savedStudent.course
        };

        // Send response with token and student data
        res.status(201).json({
            message: 'Student registered successfully',
            token,
            studentData
        });

    } catch (error) {
        console.error('Student registration error:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});

// Student Login Route
app.post('/api/student/login', async (req, res) => {
    try {
        const { emailid, password } = req.body;

        // Validate required fields
        if (!emailid || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }

        // Find student by email
        const student = await Student.findOne({ emailid });
        
        if (!student) {
            return res.status(401).json({ 
                error: 'Invalid credentials' 
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, student.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: 'Invalid credentials' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                studentId: student._id,
                sid: student.sid,
                emailid: student.emailid 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Prepare student data (exclude password)
        const studentData = {
            _id: student._id,
            sid: student.sid,
            sname: student.sname,
            emailid: student.emailid,
            degree: student.degree,
            course: student.course
        };

        // Send response with token and student data
        res.status(200).json({
            message: 'Student logged in successfully',
            token,
            studentData
        });

    } catch (error) {
        console.error('Student login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

// JWT Authentication Middleware for Students
const authenticateStudent = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const student = await Student.findById(decoded.studentId).select('-password');
        
        if (!student) {
            return res.status(401).json({ error: 'Invalid token. Student not found.' });
        }

        req.student = student;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// Admin Registration Route
app.post('/api/admin/register', async (req, res) => {
    console.log('Admin registration route reached');
    
    try {
        const { facultyname, facultyid, emailid, pass } = req.body;

        // Validate required fields
        if (!facultyname || !facultyid || !emailid || !pass) {
            return res.status(400).json({ 
                error: 'All fields are required: facultyname, facultyid, emailid, pass' 
            });
        }

        // Check if admin already exists
        const existingFaculty = await Faculty.findOne({ 
            $or: [{ facultyid }, { emailid }] 
        });
        
        if (existingFaculty) {
            return res.status(400).json({ 
                error: 'Faculty with this ID or email already exists' 
            });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(pass, saltRounds);

        // Create new faculty/admin
        const newFaculty = new Faculty({
            facultyname,
            facultyid,
            emailid,
            pass: hashedPassword
        });

        // Save faculty to database
        const savedFaculty = await newFaculty.save();

        // Generate JWT token
        const adminToken = jwt.sign(
            { 
                facultyId: savedFaculty._id,
                facultyid: savedFaculty.facultyid,
                emailid: savedFaculty.emailid,
                role: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Prepare faculty data (exclude password)
        const facultyData = {
            _id: savedFaculty._id,
            facultyname: savedFaculty.facultyname,
            facultyid: savedFaculty.facultyid,
            emailid: savedFaculty.emailid
        };

        // Send response with admin token and faculty data
        res.status(201).json({
            message: 'Admin registered successfully',
            adminToken,
            facultyData
        });

    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});

// Admin Login Route
app.post('/api/admin/login', async (req, res) => {
    try {
        const { emailid, pass } = req.body;

        // Validate required fields
        if (!emailid || !pass) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }

        // Find faculty by email
        const faculty = await Faculty.findOne({ emailid });
        
        if (!faculty) {
            return res.status(401).json({ 
                error: 'Invalid credentials' 
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(pass, faculty.pass);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: 'Invalid credentials' 
            });
        }

        // Generate JWT token
        const adminToken = jwt.sign(
            { 
                facultyId: faculty._id,
                facultyid: faculty.facultyid,
                emailid: faculty.emailid,
                role: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Prepare faculty data (exclude password)
        const facultyData = {
            _id: faculty._id,
            facultyname: faculty.facultyname,
            facultyid: faculty.facultyid,
            emailid: faculty.emailid
        };

        // Send response with admin token and faculty data
        res.status(200).json({
            message: 'Admin logged in successfully',
            adminToken,
            facultyData
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

// JWT Authentication Middleware for Admins
const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        
        const faculty = await Faculty.findById(decoded.facultyId).select('-pass');
        
        if (!faculty) {
            return res.status(401).json({ error: 'Invalid token. Faculty not found.' });
        }

        req.faculty = faculty;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// Academic Records Upload Route (Admin Only)
app.post('/api/academics', authenticateAdmin, upload.single('pdfFile'), async (req, res) => {
    try {
        const { sid, gpa, sem } = req.body;
        
        // Validate required fields
        if (!sid || !gpa || !sem) {
            return res.status(400).json({ 
                error: 'Missing required fields: sid (student ID), gpa, sem (semester)' 
            });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ 
                error: 'PDF file is required' 
            });
        }

        // Validate semester range (1-8)
        const semesterNum = parseInt(sem);
        if (semesterNum < 1 || semesterNum > 8) {
            return res.status(400).json({ 
                error: 'Semester must be between 1 and 8' 
            });
        }

        // Verify student exists
        const student = await Student.findOne({ sid: sid });
        if (!student) {
            return res.status(404).json({ error: 'Student not found with this student ID' });
        }

        // Create academic record according to academics.js schema
        const academicRecord = new GPA({
            sid: sid.toString(),
            gpa: parseFloat(gpa),
            url: `/uploads/${req.file.filename}`, // Store relative path
            sem: semesterNum
        });

        const savedRecord = await academicRecord.save();

        res.status(201).json({
            message: 'Academic record created successfully',
            record: savedRecord,
            fileName: req.file.filename
        });

    } catch (error) {
        console.error('Academic upload error:', error);
        
        // Delete uploaded file if database save fails
        if (req.file) {
            const filePath = path.join(__dirname, '../uploads', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        res.status(500).json({ 
            error: 'Failed to create academic record',
            details: error.message 
        });
    }
});

// Get Academic Records by Student ID Route
app.get('/api/academics/student/:sid', async (req, res) => {
    try {
        const { sid } = req.params;
        
        // Validate sid parameter
        if (!sid) {
            return res.status(400).json({ 
                error: 'Student ID (sid) is required' 
            });
        }

        // Find all academic records for the student
        const academicRecords = await GPA.find({ sid: sid })
            .sort({ sem: 1 }); // Sort by semester ascending

        // Transform records to include full URL
        const recordsWithFullUrl = academicRecords.map(record => ({
            ...record.toObject(),
            url: `http://localhost:${process.env.PORT || 5000}${record.url}`
        }));

        // Return the list of academic records
        res.status(200).json({
            message: 'Academic records retrieved successfully',
            sid: sid,
            count: recordsWithFullUrl.length,
            records: recordsWithFullUrl
        });

    } catch (error) {
        console.error('Get student academics error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve academic records',
            details: error.message 
        });
    }
});

// Student Document Submission Route (Student Only)
app.post('/api/student/submit-document', authenticateStudent, upload.single('pdfFile'), async (req, res) => {
    try {
        const { key, ...documentData } = req.body;
        
        console.log("Received submission request:");
        console.log("Key:", key);
        console.log("Document data:", documentData);
        console.log("Student SID from token:", req.student.sid);
        
        // Validate key parameter
        if (!key) {
            return res.status(400).json({ 
                error: 'Document key is required' 
            });
        }

        // Get student ID from JWT token
        const studentSid = req.student.sid;

        // Define schema mapping
        const schemaMap = {
            'curriculam': Activities,
            'extracurriculam': Extracurriculam,
            'internship': Interned, 
            'placement': Company,
            'skill': Skill
        };

        // Validate key exists in mapping
        const DocumentModel = schemaMap[key];
        console.log("Schema mapping result:", DocumentModel?.modelName || "NOT FOUND");
        console.log("Available keys:", Object.keys(schemaMap));
        
        if (!DocumentModel) {
            console.log("ERROR: Invalid document key received:", key);
            return res.status(400).json({ 
                error: 'Invalid document key. Allowed values: curriculam, extracurriculam, internship, placement, skill' 
            });
        }

        // Prepare document data based on key
        let documentToSave = {
            sid: studentSid,
            status: 'pending'
        };

        // Add PDF URL if file was uploaded
        if (req.file) {
            documentToSave.url = `/uploads/${req.file.filename}`;
        }

        // Validate and add fields based on document type
        switch (key) {
            case 'curriculam':
                if (!documentData.activities || !documentData.description) {
                    return res.status(400).json({ 
                        error: 'Missing required fields for curriculam: activities, description' 
                    });
                }
                documentToSave.activities = documentData.activities;
                documentToSave.description = documentData.description;
                break;

            case 'extracurriculam':
                if (!documentData.activities || !documentData.description) {
                    return res.status(400).json({ 
                        error: 'Missing required fields for extracurriculam: activities, description' 
                    });
                }
                documentToSave.activities = documentData.activities;
                documentToSave.description = documentData.description;
                break;

            case 'internship':
                if (!documentData.companyname || !documentData.duration || !documentData.companytype) {
                    return res.status(400).json({ 
                        error: 'Missing required fields for internship: companyname, duration, companytype' 
                    });
                }
                if (!['government', 'private'].includes(documentData.companytype)) {
                    return res.status(400).json({ 
                        error: 'Company type must be either government or private' 
                    });
                }
                if (!req.file) {
                    return res.status(400).json({ 
                        error: 'PDF file is required for internship documents' 
                    });
                }
                documentToSave.companyname = documentData.companyname;
                documentToSave.duration = documentData.duration;
                documentToSave.companytype = documentData.companytype;
                break;

            case 'placement':
                if (!documentData.companyname || !documentData.companytype) {
                    return res.status(400).json({ 
                        error: 'Missing required fields for placement: companyname, companytype' 
                    });
                }
                if (!['government', 'private'].includes(documentData.companytype)) {
                    return res.status(400).json({ 
                        error: 'Company type must be either government or private' 
                    });
                }
                if (!req.file) {
                    return res.status(400).json({ 
                        error: 'PDF file is required for placement documents' 
                    });
                }
                documentToSave.companyname = documentData.companyname;
                documentToSave.companytype = documentData.companytype;
                break;

            case 'skill':
                if (!documentData.skillname) {
                    return res.status(400).json({ 
                        error: 'Missing required field for skill: skillname' 
                    });
                }
                if (!req.file) {
                    return res.status(400).json({ 
                        error: 'PDF file is required for skill documents' 
                    });
                }
                documentToSave.skillname = documentData.skillname;
                break;

            default:
                return res.status(400).json({ 
                    error: 'Invalid document key' 
                });
        }

        // Create and save document
        const newDocument = new DocumentModel(documentToSave);
        const savedDocument = await newDocument.save();

        res.status(201).json({
            message: `${key} document submitted successfully`,
            documentType: key,
            document: savedDocument,
            fileName: req.file ? req.file.filename : null
        });

    } catch (error) {
        console.error('Student document submission error:', error);
        
        // Delete uploaded file if database save fails
        if (req.file) {
            const filePath = path.join(__dirname, '../uploads', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        res.status(500).json({ 
            error: 'Failed to submit document',
            details: error.message 
        });
    }
});

// Get All Pending Documents Route (Admin Only)
app.get('/api/admin/pending-documents', authenticateAdmin, async (req, res) => {
    try {
        // Fetch all pending documents from different schemas
        const [pendingActivities, pendingInterns, pendingPlacements, pendingSkills] = await Promise.all([
            Activities.find({ status: 'pending' }).lean(),
            Interned.find({ status: 'pending' }).lean(),
            Company.find({ status: 'pending' }).lean(),
            Skill.find({ status: 'pending' }).lean()
        ]);

        // Add document type to each record for identification
        const activitiesWithType = pendingActivities.map(doc => ({
            ...doc,
            documentType: 'curriculam',
            title: doc.activities,
            subtitle: doc.description
        }));

        const internsWithType = pendingInterns.map(doc => ({
            ...doc,
            documentType: 'internship',
            title: doc.companyname,
            subtitle: `${doc.duration} - ${doc.companytype}`
        }));

        const placementsWithType = pendingPlacements.map(doc => ({
            ...doc,
            documentType: 'placement',
            title: doc.companyname,
            subtitle: doc.companytype
        }));

        const skillsWithType = pendingSkills.map(doc => ({
            ...doc,
            documentType: 'skill',
            title: doc.skillname,
            subtitle: 'Skill Certificate'
        }));

        // Combine all pending documents
        const allPendingDocuments = [
            ...activitiesWithType,
            ...internsWithType,
            ...placementsWithType,
            ...skillsWithType
        ];

        // Transform URLs to full paths
        const documentsWithFullUrls = allPendingDocuments.map(doc => ({
            ...doc,
            url: doc.url ? `http://localhost:${process.env.PORT || 5000}${doc.url}` : null
        }));

        // Sort by creation date (most recent first)
        documentsWithFullUrls.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        res.status(200).json({
            message: 'Pending documents retrieved successfully',
            totalCount: documentsWithFullUrls.length,
            breakdown: {
                curriculam: activitiesWithType.length,
                internships: internsWithType.length,
                placements: placementsWithType.length,
                skills: skillsWithType.length
            },
            documents: documentsWithFullUrls
        });

    } catch (error) {
        console.error('Get pending documents error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve pending documents',
            details: error.message 
        });
    }
});

// Get All Internship Documents Route (Student Only)
app.get('/api/student/internships', authenticateStudent, async (req, res) => {
    try {
        // Get student ID from JWT token
        const studentSid = req.student.sid;

        // Fetch all internship documents for this student from Interned schema
        const internshipDocuments = await Interned.find({ sid: studentSid }).lean();

        // Transform URLs to full paths
        const documentsWithFullUrls = internshipDocuments.map(doc => ({
            ...doc,
            url: doc.url ? `http://localhost:${process.env.PORT || 5000}${doc.url}` : null
        }));

        // Sort by creation date (most recent first)
        documentsWithFullUrls.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        res.status(200).json({
            message: 'Internship documents retrieved successfully',
            totalCount: documentsWithFullUrls.length,
            documents: documentsWithFullUrls
        });

    } catch (error) {
        console.error('Get internship documents error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve internship documents',
            details: error.message 
        });
    }
});

// Get All Extracurricular Documents Route (Student Only)
app.get('/api/student/extracurricular', authenticateStudent, async (req, res) => {
    try {
        // Get student ID from JWT token
        const studentSid = req.student.sid;

        // Fetch all extracurricular documents for this student from Extracurriculam schema
        const extracurricularDocuments = await Extracurriculam.find({ sid: studentSid }).lean();

        // Transform URLs to full paths
        const documentsWithFullUrls = extracurricularDocuments.map(doc => ({
            ...doc,
            url: doc.url ? `http://localhost:${process.env.PORT || 5000}${doc.url}` : null
        }));

        // Sort by creation date (most recent first)
        documentsWithFullUrls.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        res.status(200).json({
            message: 'Extracurricular documents retrieved successfully',
            totalCount: documentsWithFullUrls.length,
            documents: documentsWithFullUrls
        });

    } catch (error) {
        console.error('Get extracurricular documents error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve extracurricular documents',
            details: error.message 
        });
    }
});

// Get All Placement Documents Route (Student Only)
app.get('/api/student/placements', authenticateStudent, async (req, res) => {
    try {
        // Get student ID from JWT token
        const studentSid = req.student.sid;

        // Fetch all placement documents for this student from Company schema
        const placementDocuments = await Company.find({ sid: studentSid }).lean();

        // Transform URLs to full paths
        const documentsWithFullUrls = placementDocuments.map(doc => ({
            ...doc,
            url: doc.url ? `http://localhost:${process.env.PORT || 5000}${doc.url}` : null
        }));

        // Sort by creation date (most recent first)
        documentsWithFullUrls.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        res.status(200).json({
            message: 'Placement documents retrieved successfully',
            totalCount: documentsWithFullUrls.length,
            documents: documentsWithFullUrls
        });

    } catch (error) {
        console.error('Get placement documents error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve placement documents',
            details: error.message 
        });
    }
});

// Get All Skills Documents Route (Student Only)
app.get('/api/student/skills', authenticateStudent, async (req, res) => {
    try {
        // Get student ID from JWT token
        const studentSid = req.student.sid;

        // Fetch all skills documents for this student from Skill schema
        const skillsDocuments = await Skill.find({ sid: studentSid }).lean();

        // Transform URLs to full paths
        const documentsWithFullUrls = skillsDocuments.map(doc => ({
            ...doc,
            url: doc.url ? `http://localhost:${process.env.PORT || 5000}${doc.url}` : null
        }));

        // Sort by creation date (most recent first)
        documentsWithFullUrls.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        res.status(200).json({
            message: 'Skills documents retrieved successfully',
            totalCount: documentsWithFullUrls.length,
            documents: documentsWithFullUrls
        });

    } catch (error) {
        console.error('Get skills documents error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve skills documents',
            details: error.message 
        });
    }
});

// Get All Curricular Documents Route (Student Only)
app.get('/api/student/curricular', authenticateStudent, async (req, res) => {
    try {
        // Get student ID from JWT token
        const studentSid = req.student.sid;

        // Fetch all curricular documents for this student from Activities schema
        const curricularDocuments = await Activities.find({ sid: studentSid }).lean();

        // Transform URLs to full paths
        const documentsWithFullUrls = curricularDocuments.map(doc => ({
            ...doc,
            url: doc.url ? `http://localhost:${process.env.PORT || 5000}${doc.url}` : null
        }));

        // Sort by creation date (most recent first)
        documentsWithFullUrls.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        res.status(200).json({
            message: 'Curricular documents retrieved successfully',
            totalCount: documentsWithFullUrls.length,
            documents: documentsWithFullUrls
        });

    } catch (error) {
        console.error('Get curricular documents error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve curricular documents',
            details: error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('- GET /');
    console.log('- POST /api/student/register');
    console.log('- POST /api/student/login');
    console.log('- POST /api/admin/register');
    console.log('- POST /api/admin/login');
    console.log('- POST /api/academics (Admin only - Upload academic records)');
    console.log('- GET /api/academics/student/:sid (Get all academic records by student ID)');
    console.log('- POST /api/student/submit-document (Student only - Submit documents by key)');
    console.log('- GET /api/student/internships (Student only - Get all internship documents)');
    console.log('- GET /api/student/extracurricular (Student only - Get all extracurricular documents)');
    console.log('- GET /api/student/curricular (Student only - Get all curricular documents)');
    console.log('- GET /api/student/placements (Student only - Get all placement documents)');
    console.log('- GET /api/student/skills (Student only - Get all skills documents)');
    console.log('- GET /api/admin/pending-documents (Admin only - Get all pending documents)');
});

module.exports = app;
