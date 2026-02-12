const pool = require("../config/db");
exports.saveUser = async ({name,email,age}) =>{
    const result = await pool.query(
        "INSERT INTO users (name,email,age) values ($1,$2,$3) RETURNING *",
        [name,email,age]    
    );
    return result.rows[0];
}
exports.getAllUsers = async () =>{
    const result = await pool.query("SELECT * FROM users order by id ASC");
    return result.rows;
}
exports.getUserById = async (id) =>{
    const result = await pool.query("SELECT * FROM users WHERE id = $1",[id]);
    return result.rows[0];
}
exports.updateUser = async (id,name,email,age) =>{
    const result = await pool.query(
        "UPDATE users SET name=$1,email=$2,age=$3 WHERE id=$4 RETURNING *",
        [name,email,age,id]
    );
    return result.rows[0];
}
exports.deleteUser = async (id) =>{
    await pool.query("DELETE FROM users WHERE id=$1",[id]);
}