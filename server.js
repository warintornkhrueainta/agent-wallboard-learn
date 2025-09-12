// ขั้นที่ 1: Import Express
const express = require('express');
const cors = require('cors');

// ขั้นที่ 2: สร้าง app  
const app = express();

// ขั้นที่ 3: กำหนด PORT
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ขั้นที่ 4: สร้าง route แรก
app.get('/', (req, res) => {
    res.send("Hello Agent Wallboard!");
});

app.get('/Hello', (req, res) => {
    res.send("Hello");
});

app.get('/health', (req, res) => {
    res.send({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

/*
Statuses:
Available  = พร้อมรับสาย
Active     = กำลังคุยกับลูกค้า  
Wrap Up    = บันทึกหลังจบสาย
Not Ready  = ไม่พร้อมรับสาย (พัก/ประชุม)
Offline    = ออฟไลน์
*/

let agents = [
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
        status: "Wrap Up",
        extension: "103",
        skill: ["Sales"],
        lastLogin: "2025-09-03T07:50:00.000Z"
    }
];

// GET /api/agents
app.get('/api/agents', (req, res) => {
    res.json({
        success: true,
        data: agents,
        count: agents.length,
        timestamp: new Date().toISOString()
    });
});

// GET /api/agents/count
app.get('/api/agents/count', (req, res) => {
    res.json({
        success: true,
        count: agents.length,
        timestamp: new Date().toISOString()
    });
});

// PATCH /api/agents/:code/status
app.patch('/api/agents/:code/status', (req, res) => {
    const agentCode = req.params.code;
    const newStatus = req.body.status;

    console.log('Agent Code:', agentCode);
    console.log('New Status:', newStatus);

    const agent = agents.find(a => a.code === agentCode);
    if (!agent) {
        return res.status(404).json({
            success: false,
            error: "Agent not found",
            timestamp: new Date().toISOString()
        });
    }

    const validStatuses = ["Available", "Active", "Wrap Up", "Not Ready", "Offline"];
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({
            success: false,
            error: "Invalid status",
            validStatuses,
            timestamp: new Date().toISOString()
        });
    }

    const oldStatus = agent.status;
    agent.status = newStatus;
    agent.lastStatusChange = new Date();

    console.log(`[${new Date().toISOString()}] Agent ${agentCode}: ${oldStatus} → ${newStatus}`);

    res.json({
        success: true,
        message: `Agent ${agentCode} status changed from ${oldStatus} to ${newStatus}`,
        data: agent,
        timestamp: new Date().toISOString()
    });
});

// GET /api/dashboard/stats
app.get('/api/dashboard/stats', (req, res) => {
    const totalAgents = agents.length;

    const available = agents.filter(a => a.status === "Available").length;
    const active = agents.filter(a => a.status === "Active").length;
    const wrapUp = agents.filter(a => a.status === "Wrap Up").length;
    const notReady = agents.filter(a => a.status === "Not Ready").length;
    const offline = agents.filter(a => a.status === "Offline").length;

    const calcPercent = (count) => totalAgents > 0 ? Math.round((count / totalAgents) * 100) : 0;

    res.json({
        success: true,
        totalAgents,
        stats: {
            available: { count: available, percent: calcPercent(available) },
            active: { count: active, percent: calcPercent(active) },
            wrapUp: { count: wrapUp, percent: calcPercent(wrapUp) },
            notReady: { count: notReady, percent: calcPercent(notReady) },
            offline: { count: offline, percent: calcPercent(offline) },
        },
        timestamp: new Date().toISOString()
    });
});

// POST /api/agents/:code/login
app.post('/api/agents/:code/login', (req, res) => {
    const agentCode = req.params.code;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            error: "Missing 'name' in request body",
            timestamp: new Date().toISOString()
        });
    }

    let agent = agents.find(a => a.code === agentCode);

    if (!agent) {
        agent = {
            code: agentCode,
            name,
            status: "Available",
            loginTime: new Date(),
        };
        agents.push(agent);
    } else {
        agent.name = name;
        agent.status = "Available";
        agent.loginTime = new Date();
    }

    res.json({
        success: true,
        message: `Agent ${agentCode} logged in successfully`,
        data: agent,
        timestamp: new Date().toISOString()
    });
});

// POST /api/agents/:code/logout
app.post('/api/agents/:code/logout', (req, res) => {
    const agentCode = req.params.code;
    const agent = agents.find(a => a.code === agentCode);

    if (!agent) {
        return res.status(404).json({
            success: false,
            error: "Agent not found",
            timestamp: new Date().toISOString()
        });
    }

    agent.status = "Offline";
    delete agent.loginTime;

    res.json({
        success: true,
        message: `Agent ${agentCode} logged out successfully`,
        data: agent,
        timestamp: new Date().toISOString()
    });
});

// ขั้นที่ 5: เริ่ม server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
