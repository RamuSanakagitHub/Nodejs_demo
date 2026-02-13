// const userRepository = require("../repositories/userRepository");

const userRepository = require("../repositories/userMongoRepository");
const generateExcelUsers = require("../middleware/userExportMiddleware");
const bcrypt = require("bcryptjs");

exports.createUser = async ({name,email,age,password, fileId}) =>{
    const hashedPassword = await bcrypt.hash(password, 10);
    password = hashedPassword;
    const newUser = await userRepository.saveUser({name,email,age, password, fileId});
    return newUser;
}
exports.getAllUsers = async () =>{
    const users = await userRepository.getAllUsers();
    return users;
}
exports.getUserById = async (id) =>{
    const user = await userRepository.getUserById(id);
    return user;
}
  /** for pg */      
// exports.updateUser = async (id,name,email,age) =>{
//     const updateUser = await userRepository.updateUser(id,name,email,age);
//     return updateUser;
// }

   /** for mongos DB */
exports.updateUser = async (id,userData) =>{
    const updateUser = await userRepository.updateUser(id,userData);
    return updateUser;
}
exports.deleteUser = async (id) =>{
    await userRepository.deleteUser(id);
}

exports.getExportUsers = async () =>{    
    const users = await userRepository.getAllUsers();
    const excelResponse = await generateExcelUsers(users);
    return excelResponse;
}