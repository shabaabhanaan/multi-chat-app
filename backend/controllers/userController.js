import user from '..models/userModel.js';

export const getAllUsers = async (req, res){
    try {
        const users = await user.find();
        res.status(200).json(users);
    }catch(error){
        res.status(500).json({
            Message: "Error fetching users",
            Error: error.message
        })
    }
    }
export const createUser = async(req, res) => {
    try {
        const newUser = new user(req.body);
        
    }
}