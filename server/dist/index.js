"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const transaction_route_1 = __importDefault(require("./routes/transaction.route"));
const portfolio_route_1 = __importDefault(require("./routes/portfolio.route"));
const alert_route_1 = __importDefault(require("./routes/alert.route"));
const app = (0, express_1.default)();
const port = process.env.PORT || 5001;
app.use(express_1.default.json());
app.use('/api/auth', auth_route_1.default);
app.use('/api/transactions', transaction_route_1.default);
app.use('/api/portfolio', portfolio_route_1.default);
app.use('/api/alerts', alert_route_1.default);
app.get('/', (req, res) => {
    res.send('Hello from CryptoTrack Server!');
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
