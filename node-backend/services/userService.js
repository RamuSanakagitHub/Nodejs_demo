// const userRepository = require("../repositories/userRepository");

const userRepository = require("../repositories/userMongoRepository");
const generateExcelUsers = require("../middleware/userExportMiddleware");
const bcrypt = require("bcryptjs");
const generateExcelUsersStream = require("../middleware/userExportMiddleware");
const { getOrSetCache, invalidateUserCache, cacheKeys, TTL } = require("../utils/cache");
const User = require("../models/User");

// ==================== BASIC CRUD OPERATIONS ====================

exports.createUser = async ({name,email,age,password, fileId}) =>{
    const hashedPassword = await bcrypt.hash(password, 10);
    password = hashedPassword;
    const newUser = await userRepository.saveUser({name,email,age, password, fileId});
    return newUser;
}
exports.getAllUsers = async (page, limit) =>{
    const users = await userRepository.getAllUsers(page, limit);
    return users;
}
// exports.getUserById = async (id) =>{
//     const user = await userRepository.getUserById(id);
//     return user;
// }
// Existing or new: Get a single user by ID
exports.getUserById = async (id) => {
  const key = cacheKeys.user(id);
  return await getOrSetCache(key, async () => {
    // Fetch from DB, excluding password (adjust if needed)
    return await User.findById(id).select('-password');
  }, TTL.SINGLE_USER);
};
  /** for pg */      
// exports.updateUser = async (id,name,email,age) =>{
//     const updateUser = await userRepository.updateUser(id,name,email,age);
//     return updateUser;
// }

   /** for mongos DB */
exports.updateUser = async (id,userData) =>{
    // const updateUser = await userRepository.updateUser(id,userData);
    const updateUser = await User.findByIdAndUpdate(id, userData, { returnDocument: 'after' }).select('-password');
      await invalidateUserCache(id);
    return updateUser;
}
exports.deleteUser = async (id) =>{
    await userRepository.deleteUser(id);
}

// exports.getExportUsers = async () =>{    
//     const users = await userRepository.getAllUsersForExport();
//     const excelResponse = await generateExcelUsersStream(users);
//     return excelResponse;
// }
exports.getExportUsers = async () => {
    const users = await userRepository.getAllUsersForExport();
    return users; // Just return the users array
}

// ==================== LEVEL 1: BASIC STAGES ====================

// $match - Filter users by role (with pagination)
exports.filterUsersByRole = async (role, page = 1, limit = 10) => {
  return await userRepository.filterUsersByRole(role, page, limit);
};

// $project - Select/Modify fields (with pagination)
exports.getUsersWithProjectedFields = async (page = 1, limit = 10) => {
  return await userRepository.getUsersWithProjectedFields(page, limit);
};

// $sort - Sort users by age (with pagination)
exports.getUsersSortedByAge = async (sortOrder = 1, page = 1, limit = 10) => {
  return await userRepository.getUsersSortedByAge(sortOrder, page, limit);
};

// $limit - Get top N users (with pagination)
exports.getTopUsers = async (limit = 5, page = 1, pageLimit = 10) => {
  return await userRepository.getTopUsers(limit, page, pageLimit);
};

// $skip - Skip N users (with pagination)
exports.getUsersWithSkip = async (skip = 10, limit = 10, page = 1, pageLimit = 10) => {
  return await userRepository.getUsersWithSkip(skip, limit, page, pageLimit);
};

// ==================== LEVEL 2: GROUPING & CALCULATIONS ====================

// $group - Count users by role
exports.getUserCountByRole = async () => {
  return await userRepository.getUserCountByRole();
};

// $group - Total age by role
exports.getTotalAgeByRole = async () => {
  return await userRepository.getTotalAgeByRole();
};

// $group - Role statistics
exports.getRoleStatistics = async () => {
  return await userRepository.getRoleStatistics();
};

// ==================== LEVEL 4: ADVANCED STAGES ====================

// $lookup - Join with roles collection (with pagination)
exports.getUsersWithRoleDetails = async (page = 1, limit = 10) => {
  return await userRepository.getUsersWithRoleDetails(page, limit);
};

// $bucket - Age distribution
exports.getAgeDistribution = async () => {
  return await userRepository.getAgeDistribution();
};

// $facet - Dashboard stats
exports.getDashboardStats = async () => {
  return await userRepository.getDashboardStats();
};

// ==================== LEVEL 5: PERFORMANCE OPTIMIZATION ====================

// Using allowDiskUse for large datasets (50,000+ records)
exports.getAllUsersWithDiskUse = async () => {
  return await userRepository.getAllUsersWithDiskUse();
};

// Complex aggregation with allowDiskUse
exports.getComplexStatsWithLargeData = async () => {
  return await userRepository.getComplexStatsWithLargeData();
};

// Pagination with aggregation and allowDiskUse
exports.getPaginatedUsersWithAggregation = async (page = 1, limit = 10) => {
  return await userRepository.getPaginatedUsersWithAggregation(page, limit);
};
// ==================== ARRAY & NESTED QUERYING METHODS ====================

exports.getUsersBySkill = async (skill, page = 1, limit = 10) => {
  return await userRepository.getUsersBySkill(skill, page, limit);
};

exports.getUsersBySkillsAll = async (skills, page = 1, limit = 10) => {
  return await userRepository.getUsersBySkillsAll(skills, page, limit);
};

exports.getUsersBySkillsIn = async (skills, page = 1, limit = 10) => {
  return await userRepository.getUsersBySkillsIn(skills, page, limit);
};

exports.getUsersBySkillsSize = async (size, page = 1, limit = 10) => {
  return await userRepository.getUsersBySkillsSize(size, page, limit);
};

exports.getUsersByAddressCity = async (city, page = 1, limit = 10) => {
  return await userRepository.getUsersByAddressCity(city, page, limit);
};

exports.getUsersByAddressPincodeGt = async (pincode, page = 1, limit = 10) => {
  return await userRepository.getUsersByAddressPincodeGt(pincode, page, limit);
};

exports.getUsersByProjectTitle = async (title, page = 1, limit = 10) => {
  return await userRepository.getUsersByProjectTitle(title, page, limit);
};

exports.getUsersWithProjectsElemMatch = async (title, budget, page = 1, limit = 10) => {
  return await userRepository.getUsersWithProjectsElemMatch(title, budget, page, limit);
};

exports.getUsersByProjectTechnologies = async (technology, page = 1, limit = 10) => {
  return await userRepository.getUsersByProjectTechnologies(technology, page, limit);
};

exports.getUsersWithProjectsElemMatchTech = async (technology, budget, page = 1, limit = 10) => {
  return await userRepository.getUsersWithProjectsElemMatchTech(technology, budget, page, limit);
};

exports.getUsersWithAddressExists = async (page = 1, limit = 10) => {
  return await userRepository.getUsersWithAddressExists(page, limit);
};

exports.getUsersByAgeType = async (type, page = 1, limit = 10) => {
  return await userRepository.getUsersByAgeType(type, page, limit);
};

exports.getUsersWithProjectsSlice = async (slice, page = 1, limit = 10) => {
  return await userRepository.getUsersWithProjectsSlice(slice, page, limit);
};

exports.getUsersProductionQuery = async (city, skillsSize, technology, budget, page = 1, limit = 10) => {
  return await userRepository.getUsersProductionQuery(city, skillsSize, technology, budget, page, limit);
};

exports.addCommentByUserId = async (userId, content, author) => {
  return await userRepository.addCommentByUserId(userId, content, author);
};

exports.updateCommentByUserId = async (userId, commentId, content) => {
  return await userRepository.updateCommentByUserId(userId, commentId, content);
};