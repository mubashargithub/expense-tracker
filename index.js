const express = require("express");
const app = express();
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const methodOverride = require('method-override');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// View engine setup
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, 'views'));

// ✅ FIXED: Use app.use() not app.set() for static files
app.use(express.static(path.join(__dirname, 'public')));
let expenses = [
    {
        id: "e1a9b8c7-d6e5-4f3a-8b2c-1d0e9f8a7b6c",
        title: "Groceries",
        amount: 85.50,
        category: "Food",
        date: "2023-10-15"
    },
    {
        id: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
        title: "Electricity Bill",
        amount: 120.75,
        category: "Utilities",
        date: "2023-10-10"
    },
    {
        id: "c3d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8",
        title: "Gasoline",
        amount: 45.30,
        category: "Transportation",
        date: "2025-12-27"
    },
    {
        id: "d4e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9",
        title: "Movie Tickets",
        amount: 32.00,
        category: "Entertainment",
        date: "2025-12-08"
    },
    {
        id: "f6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1",
        title: "Coffee",
        amount: 4.75,
        category: "Food",
        date: "2025-10-14"
    }
];

const Total_Expense_Function = ()=>{
    Total_Expenses = expenses.reduce((total, expense) => {
        return parseInt(total + expense.amount);
    }, 0);
} 

let Total_Expenses=0;


app.use((req, res, next) => {
    Total_Expense_Function();
    // Assuming expenses array is accessible globally or from database
    
    next()
});

app.get("/expense" , (req , res )=>{
    Total_Expense_Function();
    res.render("index.ejs" , {expenses , Total_Expenses});
})

app.get("/expense/add" , (req , res )=>{
    res.render("addExpense.ejs");
})

app.get("/expense/:id/delete", (req , res )=>{
    const id = req.params.id;
    expenses = expenses.filter(expense => expense.id !== id);
    // console.log(expenses);
    Total_Expense_Function();
    res.render("index.ejs" , {expenses , Total_Expenses});
})

app.get("/expense/:id/edit", (req , res )=>{
    const id = req.params.id;
    const E_expense = expenses.find(e => e.id === id);
    console.log(E_expense); 
    res.render("editExpense.ejs" ,{ E_expense});
})

app.get("/expense/:time/filter",(req,res)=>{
    const time = req.params.time;
    const new_expenses = expenses; 
    if(time === 'daily'){
        const today = new Date().toISOString().split('T')[0];  // "2023-10-15"
        let expenses = new_expenses.filter(e => e.date == today);
        Total_Expenses = expenses.reduce((total, expense) => {
            return parseInt(total + expense.amount);
        }, 0);
        res.render("index.ejs" , {expenses , Total_Expenses});        
    }
    if(time === 'monthly'){
        const today = new Date();
        const currentMonth = today.getMonth();  // 0-11
        const currentYear = today.getFullYear();
        
        let expenses = new_expenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate.getMonth() === currentMonth && 
                expenseDate.getFullYear() === currentYear;
        });
        
        Total_Expenses = expenses.reduce((total, expense) => {
            return parseInt(total + expense.amount);
        }, 0);
        
        res.render("index.ejs", {expenses, Total_Expenses});        
    }
    if(time == 'all'){
        expenses = new_expenses;
        res.render("index.ejs", {expenses, Total_Expenses}); 
    }
    if(time === 'yearly'){
        const currentYear = new Date().getFullYear();
        
        let expenses = new_expenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate.getFullYear() === currentYear;
        });
        
        Total_Expenses = expenses.reduce((total, expense) => {
            return parseInt(total + expense.amount);
        }, 0);
        
        res.render("index.ejs", {expenses, Total_Expenses});        
    }
    expenses = new_expenses;
})

app.patch("/expense/:id" , (req , res )=>{
    const {title , amount , category , date} = req.body;
     const id = req.params.id;

    let expense = expenses.find(e => e.id === id);
    expenses = expenses.filter(e => e.id !== id);
    expense.amount = parseFloat(amount);
    expense.category = category;
    console.log(date);
    expense.date = date;
    expense.title = title;
    expenses.push(expense);    

    Total_Expense_Function();
    res.render("index.ejs" , {expenses , Total_Expenses});
})

app.get("/expense/:id/detail" , (req , res)=>{
    const id = req.params.id;
    if(!id){
        return res.status(404).json({ 
            error: "Expense ID is required" 
        });
    }
    let expense = expenses.find(e => e.id === id);
    res.render("viewInDetail.ejs" , {expense});
})


app.post("/expense" , (req , res )=>{
    const {title , amount , category , date} = req.body;
    let new_expense = {
        id: uuidv4(),
        title:title,
        amount:parseInt(amount),
        category: category,
        date: date
    }
    expenses.push(new_expense);
    // console.log(expenses);
    Total_Expense_Function();
    res.render("index.ejs" , {expenses , Total_Expenses});
})

// Export for Vercel
module.exports = app;

// Local development
if (require.main === module) {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
}