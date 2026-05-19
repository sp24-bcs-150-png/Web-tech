const express = require('express');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const flash = require('connect-flash');
const User = require('./models/User');
const { isLoggedIn, isAdmin } = require('./middleware/auth');

const app = express();

// CONNECTING TO LOCAL MONGODB CONTAINER
mongoose.connect('mongodb://127.0.0.1:27017/labtask3_db')
    .then(() => console.log('MongoDB is connected successfully! 🚀'))
    .catch(err => console.log('Database connection error:', err));

// CONFIGURATIONS
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));

// TRACKING USER STATES WITH SECURE SESSIONS
app.use(session({
    secret: 'mysecretkey123',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// GLOBAL VARIABLE PIPELINES FOR VIEWS (NAVBAR & ALERTS)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    next();
});

// ------------------- APPLICATION ENDPOINTS -------------------

// Home Endpoint Default Redirection
app.get('/', (req, res) => { 
    res.render('login', { title: 'Account Login' }); 
});

// SIGNUP LOGIC PIPELINE
app.get('/register', (req, res) => res.render('register', { title: 'Create Account' }));
app.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email account is already registered!');
            return res.redirect('/register');
        }

        // PASSWORD SECURITY: BCRYPT HASHING
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({ name, email, password: hashedPassword, role });
        req.flash('success', 'Registration complete! You can log in now.');
        res.redirect('/login');
    } catch (err) { 
        res.status(500).send("Error compiling system authorization accounts."); 
    }
});

// SECURE LOGIN SYSTEM
app.get('/login', (req, res) => res.render('login', { title: 'Secure Login' }));
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Invalid username identity or password match.');
            return res.redirect('/login');
        }

        // BCRYPT DECRYPTION AND VERIFICATION
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error', 'Invalid username identity or password match.');
            return res.redirect('/login');
        }

        // INJECTING COOKIE ACTIVE STATE SESSIONS
        req.session.user = { id: user._id, name: user.name, role: user.role };
        req.flash('success', `Welcome back, ${user.name}! 👋`);
        
        if (user.role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/checkout');
        }
    } catch (err) { 
        res.status(500).send("System initialization verification failure."); 
    }
});

// ROUTE LOCK 1: SECURE CUSTOMER ENDPOINT
app.get('/checkout', isLoggedIn, (req, res) => {
    res.send(`
        <div style="font-family:sans-serif; padding:40px; text-align:center;">
            <h1>🛒 Checkout Platform Page</h1>
            <p>Verification Passed! Account holder: <b>${req.session.user.name}</b> can securely purchase store items.</p>
            <br><a href="/logout" style="color:red;">Terminate Session (Logout)</a>
        </div>
    `);
});

// ROUTE LOCK 2: AUTHORIZED ADMINISTRATOR SYSTEM PANEL (RBAC PROTECTION)
app.get('/admin', isAdmin, (req, res) => {
    res.send(`
        <div style="font-family:sans-serif; padding:40px; text-align:center; background:#fff3cd; border: 2px solid #ffeba2; border-radius:8px; max-width:600px; margin:40px auto;">
            <h1 style="color:#856404;">⚙️ System Administration Terminal Panel</h1>
            <p>Access Granted! Welcome <b>Admin ${req.session.user.name}</b>. This terminal holds clearance restrictions.</p>
            <br><a href="/logout" style="color:red; font-weight:bold;">Exit Administration Core Console</a>
        </div>
    `);
});

// LOGOUT TRIGGER TERMINATION
app.get('/logout', (req, res) => { 
    req.session.destroy(() => { 
        res.redirect('/login'); 
    }); 
});

app.listen(3000, () => console.log('Server initialized at: http://localhost:3000'));