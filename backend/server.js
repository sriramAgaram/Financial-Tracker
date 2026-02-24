const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const { globalLimiter, authLimiter } = require('./middleware/rateLimiter');

app.set('trust proxy', 1); // for real users ip 
const authRoute = require('./router/auth.route');
const expencestypeRoute = require('./router/expencestype.route');
const transactionRoute = require('./router/transaction.route');
const limitRoute = require('./router/limit.route');
const dataRoute = require('./router/data.route');
const cronRoute = require('./router/cron.route');
const userRoute = require('./router/user.route');

app.use(cors());
dotenv.config();
const port = process.env.PORT || 5000
app.use(express.json());
app.use(globalLimiter);

app.use('/auth', authLimiter, authRoute);
app.use('/expencestype', expencestypeRoute);
app.use('/transaction', transactionRoute);
app.use('/limit', limitRoute);
app.use('/data', dataRoute);
app.use('/cron', cronRoute);
app.use('/user', userRoute);



app.listen(port, () => {
    console.log('Server is Running on Port', port)
})
