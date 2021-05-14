// Setup start
const express = require("express");
const cors = require("cors")
require("dotenv").config();
const MongoUtil = require("./MongoUtil");
const mongoUrl = process.env.MONGO_URL;
const ObjectId = require("mongodb").ObjectId;
let app = express();
app.use(express.json());
app.use(cors());
// Setup end
const crypto = require("crypto")

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash("sha256")
    const hash = sha256.update(password).digest("base64")
    return hash
}

async function main() {
    let db = await MongoUtil.connect(mongoUrl, "expense_tracker")
    console.log("Database connected")

    // Get all document
    app.get("/all", async (req, res) => {
        let results = await db.collection("expenses").find().toArray();
        res.send(results)
    })

    // Get expenses based on the expense id
    app.post("/individual/expenses", async (req,res)=>{
        try {
            let results = await db.collection("expenses").findOne({
                _id: { $in: [ObjectId(req.body.id)] }
            })
            res.send(results)
        } catch (e){
            res.status(500)
            res.send("Unable to get data.")
        }
    })

    // Get expenses based on the expense id & search category
    app.post("/individual/expenses/search", async (req,res)=>{
        let criteria = {}
        if (req.body.user_id){
             criteria["user_id"] = {
                     $in : [ObjectId(req.body.user_id)]
            }
        }
        if (req.body.search){
            criteria["category"] = {
                $in : [req.body.search]
            }
        }
        try {
            let results = await db.collection("expenses").find(criteria).toArray()
            res.send(results)
        } catch (e){
            res.status(500)
            res.send("Unable to get data.")
        }
    })

    // Get all expenses based on the user id
    app.post("/expenses", async (req, res) => {
        try {
            let results = await db.collection("expenses").find({
                user_id: ObjectId(req.body.user_id)
            }).toArray()
            res.send(results)
        } catch (e) {
            console.log(e)
            res.status(500)
            res.send("Unable to get data.")
        }
    })

    // Create expenses 
    app.post("/expenses/add", async (req, res) => {
        try {
            await db.collection("expenses").insertOne({
                user_id: ObjectId(req.body.user_id),
                amount: req.body.amount,
                date: req.body.date,
                category: req.body.category,
                memo: req.body.memo
            })
            res.status(200)
            res.send("Expenses added.")
        } catch (e) {
            console.log(e)
            res.status(500)
            res.send("Unable to add expenses.")
        }
    })

    // Put - Update expenses
    app.put("/expenses/edit", async (req, res) => {
        try {
            let results = await db.collection("expenses").updateOne(
                {
                    _id: ObjectId(req.body.expense_id)
                },
                {
                    "$set": {
                        user_id: ObjectId(req.body.user_id),
                        amount: req.body.amount,
                        date: req.body.date,
                        category: req.body.category,
                        memo: req.body.memo
                    }
                })
            res.status(200)
            res.send("Expense updated.")
        } catch (e) {
            res.status(500)
            res.send("Unable to edit expenses.")
            console.log(e)
        }
    })

    // Delete expenses
    app.delete("/expenses/:id", async (req, res) => {
        try {
            await db.collection("expenses").deleteOne({
                _id: ObjectId(req.params.id)
            })
            res.status(200);
            res.send("Expense deleted.")
        } catch (e) {
            res.status(500);
            res.send("Unable to delete expenses.")
        }
    })

    // USERS 
    // Create account
    app.post("/account/create", async (req, res) => {
        // Check if email has been used
        // If used, return "Email in used" 
        // else, add account to db.
        let checkEmail = await db.collection("accounts").findOne({
            email: { $in: [req.body.email] }
        })
        if (!checkEmail) {
            try {
                await db.collection("accounts").insertOne({
                    email: req.body.email,
                    password: getHashedPassword(req.body.password)
                })
                res.status(200)
                res.send("Account created.")
            } catch (e) {
                console.log(e)
                res.status(500)
                res.send("Unable to create account.")
            }
        } else {
            res.send("Email in used.")
        }
    })

    // Login account
    app.post("/account/login", async (req, res) => {
        // Check if email is in db
        // If email and password is same grant access 
        // If email doesn't exist OR password not same, return "Invalid credentials"
        let checkEmail = await db.collection("accounts").findOne({
            email: { $in: [req.body.email] }
        })
        try{
            if (checkEmail.email && checkEmail.password == getHashedPassword(req.body.password)){
                // Add in JWT when possible
                res.send(checkEmail)
            } else {
                res.send("Invalid credentials.")
            }
        } catch (e){
            res.send("Unable to login")
        }
    })
}

main()


// Route begins here
app.listen(process.env.PORT, () => {
    console.log("server has started")
})