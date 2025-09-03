const express = require('express');
const app = express();

const PORT = 3001;

app.use(express.json());

// ตัวแปร agents
const agents = [
    {
        code: "A001",
        name: "John Doe",
        status: "Available",
        extension: "101",
        skill: ["Sales", "Support"],
        lastLogin: "2025-09-03T08:00:00.000Z"
    },
    {
        code: "A002",
        name: "Jane Smith",
        status: "Active",
        extension: "102",
        skill: ["Support"],
        lastLogin: "2025-09-03T08:15:00.000Z"
    },
    {
        code: "A003",
        name: "Bob Lee",
        status: "Wrap Up", // แก้ไข Wrap_Up → Wrap Up
        extension: "103",
        skill: ["Sales"],
        lastLogin: "2025-09-03T07:50:00.000Z"
    }
];

// Route หน้าแรก
app.get('/', (req, res) => {
    res.send("Hello Agent Wallboard!");
});

// /health route
app.get('/health', (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString()
    });
});

// GET agents ทั้งหมด
app.get('/api/agents', (req, res) => {
    res.json({
        success: true,
        data: agents,
        count: agents.length,
        timestamp: new Date().toISOString()
    });
});

// GET agents count
app.get('/api/agents/count', (req, res) => {
    res.json({
        success: true,
        count: agents.length,
        timestamp: new Date().toISOString()
    });
});


// PATCH เปลี่ยน agent status
app.patch('/api/agents/:code/status', (req, res) => {
    const agentCode = req.params.code;
    const newStatus = req.body.status;

    // หา agent
    const agent = agents.find(a => a.code === agentCode);
    if (!agent) {
        return res.status(404).json({ success: false, message: "Agent not found" });
    }

    // valid statuses
    const validStatuses = ["Available", "Active", "Wrap Up", "Not Ready", "Offline"];
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
    }

    // บันทึกสถานะเก่า
    const oldStatus = agent.status;
    agent.status = newStatus;

    // console.log ติดตาม status changes
    console.log(`[${new Date().toISOString()}] Agent ${agentCode}: ${oldStatus} → ${newStatus}`);

    // ส่ง response
    return res.json({
        success: true,
        code: agent.code,
        oldStatus,
        newStatus,
        timestamp: new Date().toISOString()
    });
});

// เริ่ม server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});