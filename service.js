const express = require("express");
const app = express();

// 中间件
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// 路由
app.post("/api", (req, res) => {
    console.log("接收到请求体:", req.body);
    res.json({ status: "success", data: req.body });
});

// 启动服务（建议使用3001端口）
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`后端运行在 http://localhost:${PORT}`);
});