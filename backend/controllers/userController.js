import { supabase } from "../config/supabase.js";
import validator from "validator";

//login user (using Supabase Auth)
const loginUser = async (req,res) => {
    const {email, password} = req.body;
    try{
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.json({success:false,message: error.message || "Invalid credentials"})
        }

        // Get user profile from users table
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.log(profileError);
        }

        res.json({
            success:true,
            token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                name: userProfile?.full_name || ''
            }
        })
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error logging in"})
    }
}

//register user (using Supabase Auth)
const registerUser = async (req,res) => {
    const {name, email, password} = req.body;
    try{
        // validating email format & strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message: "Please enter a valid email"})
        }
        if(password.length<8){
            return res.json({success:false,message: "Please enter a strong password"})
        }

        // Create user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name
                }
            }
        });

        if (error) {
            if (error.message.includes('already registered')) {
                return res.json({success:false,message: "User already exists"})
            }
            return res.json({success:false,message: error.message})
        }

        // Create user profile in users table
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: data.user.id,
                email: email,
                full_name: name,
                role: 'customer'
            });

        if (profileError) {
            console.log('Profile creation error:', profileError);
        }

        res.json({
            success:true,
            token: data.session?.access_token,
            message: "Registration successful. Please check your email for verification."
        })

    } catch(error){
        console.log(error);
        res.json({success:false,message:"Error registering user"})
    }
}

export {loginUser, registerUser}