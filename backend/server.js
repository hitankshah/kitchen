import express  from "express"
import cors from 'cors'
import userRouter from "./routes/userRoute.js"
import foodRouter from "./routes/foodRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import { supabase } from "./config/supabase.js"

// app config
const app = express()
const port = process.env.PORT || 4000;


// middlewares
app.use(express.json())
app.use(cors({
    origin: [
        'https://kitchen-peach.vercel.app',
        'https://kitchen-v2jj.vercel.app',
        'http://localhost:5173',
        'http://localhost:5174'
    ],
    credentials: true
}))

// Verify Supabase connection
console.log('✅ Supabase client initialized');

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/food", foodRouter)
app.use("/images",express.static('uploads'))
app.use("/api/cart", cartRouter)
app.use("/api/order",orderRouter)

app.get("/", (req, res) => {
    res.send("API Working")
  });

app.listen(port, () => console.log(`Server started on http://localhost:${port}`))