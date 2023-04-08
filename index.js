const http = require('http');
const fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');

const hostname = '127.0.0.1';
const port = 3000;
const url = require('url');

const { render } = require('ejs');
const express = require('express')
const flash = require('express-flash')
const session = require('express-session');
const exp = require('constants');
const app = express();

const mysql = require('mysql');
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "furniturestoreproject"
});

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")



app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: '123@123abc',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 60000 },
    }),
);
app.use(flash());

//set css
app.use(express.static(path.join(__dirname, 'public')));

//set favi
app.use(favicon(path.join(__dirname, 'public', 'img/core-img/favicon.ico')));


app.get('/', function (req, res) {
    con.query('SELECT * FROM tb_product LIMIT 6', (err, results) => {
        if (err) throw err;
        res.render('pages/index', { pro: results });
    });
});
app.get('/getHomeData', function (req, res) {
    con.query('SELECT * FROM tb_product LIMIT 10', (err, results) => {
        if (err) throw err;
        res.end(JSON.stringify(results));
    });
});
app.get('/getDataInCart', function (req, res) {
    var sql = 'SELECT * FROM tb_product';
    if (req.query.id !== undefined && req.query.id.length > 0) {
        sql += " WHERE ID IN (" + req.query.id + ")";
        con.query(sql, (err, results) => {
            if (err) throw err;
            res.end(JSON.stringify(results));
        });
    } else {
        res.render('pages/detail');
    }
});
app.get('/cart', function (req, res) {
    res.render('pages/cart');
});

app.get('/checkOut', function (req, res) {
    
    var sql = `INSERT INTO cart (CustomerName, Address, PaymentMethod, TotalPrice) VALUES ("${req.query.cusName}", "${req.query.cusAddress}", "${req.query.payMethod}", "${req.query.totalPrice}")`;
    var sqlCDetails = `INSERT INTO cartdetails (CartID, ProductID, Quantity) VALUES ("${req.query.cusName}", "${req.query.payMethod}", "${req.query.totalPrice}")`;
    con.query(sql, (err, results) => {
        console.log(results.insertId);
        if (err) throw err;
        if(results.insertId>0){
            res.end('1');
        }
        else
            res.end('0');
    });
});

app.get('/detail', function (req, res) {
    var sql = 'SELECT * FROM tb_product';
    if (req.query.id !== undefined && req.query.id.length > 0) {
        sql += " WHERE ID=" + req.query.id;
        console.log(sql);
        con.query(sql, (err, results) => {
            if (err) throw err;
            console.log(results);
            res.render('pages/detail', { pro: results[0] });
        });
    } else {
        res.render('pages/detail');
    }

});
app.get('/shop', function (req, res) {
    var type = 0;
    if (req.query.type !== undefined && req.query.type.length > 0) {
        type = req.query.type;
    }
    con.query('SELECT * FROM tb_product_type', (err, resultsT) => {
        if (err) throw err;
        res.render('pages/shop', { proT: resultsT, type: type });
    });
});

app.get('/getData', function (req, res) {
    var sql = 'SELECT * FROM tb_product';
    if (req.query.type !== undefined && req.query.type.length > 0) {
        sql += " WHERE ProductType=" + req.query.type;
    }

    if (req.query.keyword !== undefined && req.query.keyword.length > 0) {
        if (req.query.type !== undefined && req.query.type.length > 0)
            sql += " AND";
        else
            sql += " WHERE";
        sql += " Name LIKE '%" + req.query.keyword + "%'";
    }

    con.query('SELECT * FROM tb_product_type', (err1, resultsT) => {
        if (err1) throw err1;
        console.log(sql);
        con.query(sql, (err2, results) => {
            if (err2) throw err2;
            res.end(JSON.stringify(results));
        });
    });
});

app.get('/addproduct', function (req, res) {
    con.query('SELECT * FROM tb_product_type', (err, results) => {
        if (err) throw err;
        res.render('pages/addproduct', { proT: results });
    });
});
app.get('/cartcontrol', function (req, res) {
    con.query('SELECT * FROM cart', (err, results) => {
        if (err) throw err;
        res.render('pages/cartcontrol', { cart: results });
    });
});
app.post('/addproduct', function (req, res, next) {
    console.log(req.body);
    var sql = `INSERT INTO tb_product (Name, Description, Price, Image, ProductType) VALUES ("${req.body.pro.proName}", "${req.body.pro.proDes}", "${req.body.pro.proPrice}", "${req.body.pro.proImage}", "${req.body.pro.proType}")`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        res.redirect('/addproduct');
    });
});
console.log('--incomming request--');

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
module.exports = app;