const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mock data
const mockColleges = [
  {
    id: 1,
    name: "Indian Institute of Technology Bombay",
    location: "Mumbai, Maharashtra",
    rating: 4.8,
    fees: "‚Çπ3.8L/year",
    placement: "‚Çπ21L average"
  },
  {
    id: 2,
    name: "Delhi Technological University",
    location: "Delhi",
    rating: 4.2,
    fees: "‚Çπ2.9L/year",
    placement: "‚Çπ12L average"
  }
];

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'EduPathfinder API is running (Mock Mode)',
    note: 'MongoDB not installed, using mock data'
  });
});

app.get('/api/v1/colleges', (req, res) => {
  res.json({
    success: true,
    count: mockColleges.length,
    data: mockColleges
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Ì∫Ä Server running on port ${PORT} (Mock Mode)`);
  console.log(`Ì≥ù Using mock data - MongoDB not installed`);
});
