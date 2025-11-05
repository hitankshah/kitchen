import { supabase } from "../config/supabase.js";

const authMiddleware = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.json({success:false,message:'Not Authorized Login Again'});
    }
    try {
        // Verify Supabase token
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.json({success:false,message:'Invalid token or session expired'});
        }

        req.body.userId = user.id;
        req.user = user;
        next();
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}

export default authMiddleware;