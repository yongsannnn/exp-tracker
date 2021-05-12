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

async function main() {
    let db = await MongoUtil.connect(mongoUrl, "expense_tracker")
    console.log("Database connected")

    // Get all document
    app.get("/", async (req, res) => {
        let results = await db.collection("expenses").find().toArray();
        res.send(results)
    })

    // Get all expenses based on the user id
    app.post("/expenses", async (req, res) => {
        try {
            let results = await db.collection("expenses").find({
                user_id: req.body.user_id
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
                user_id: req.body.user_id,
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
                        user_id: req.body.user_id,
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
}

main()


// Route begins here
app.listen(3000, () => {
    console.log("server has started")
})