// const userRepository = require("../repositories/userRepository");

const userRepository = require("../repositories/userMongoRepository");

exports.createUser = async ({name,email,age,password}) =>{
    const newUser = await userRepository.saveUser({name,email,age, password});
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