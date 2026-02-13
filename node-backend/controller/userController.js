const userService = require("../services/userService");


const OK = 200;
const CREATED = 201;
const INTERNAL_SERVER_ERROR = 500;
const NOT_FOUND = 404;

class UserController {
    async createUser(req, res){
        try{
            // const {name, email, age} = req.body;
            const newUser = await userService.createUser(req.body);
            const io= req.app.get('io');
            io.emit("userCreated", newUser);
            res.status(CREATED).json(newUser);
        }
        catch(error){
            res.status(INTERNAL_SERVER_ERROR).json({error: error.message});
        }
    }
    async getAllUsers(req, res){
        try{
        const users = await userService.getAllUsers();
        res.status(OK).json(users);            
        }catch(error){
            res.status(INTERNAL_SERVER_ERROR).json({error: error.message});
        }
    }
    async getUserById(req, res){
        try{
            const {id}= req.params;
            const user = await userService.getUserById(id);
            res.status(OK).json(user);
        }catch(error){
            res.status(INTERNAL_SERVER_ERROR).json({error: error.message});
        }
    }
    async updateUser(req, res){
        try{
            const {id}=req.params;
            /** for pg */            
            // const {name,email,age} = req.body; // for pg
            // const updateUser = await userService.updateUser(id, name,email,age)
            /** for mongos DB */
            const updateUser = await userService.updateUser(id, req.body)
            res.status(OK).json(updateUser);
        }catch(error){
            res.status(INTERNAL_SERVER_ERROR).json({error: error.message});
        }
    }
    async deleteUser(req, res){
        try{
            const {id} = req.params;
            await userService.deleteUser(id);
            res.status(OK).json({message:"User deleted successfully"})
        }catch(error){
            res.status(INTERNAL_SERVER_ERROR).json({error: error.message});
        }
    }
    async exportUsers(req, res) {
        try{
            const users = await userService.getExportUsers();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
            await users.xlsx.write(res);
            res.status(OK).end();
        }catch(error){
            res.status(INTERNAL_SERVER_ERROR).json({error: error.message});
        }
    }
}

module.exports = new UserController();