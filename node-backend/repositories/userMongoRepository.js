const User = require("../models/User");

// ==================== BASIC CRUD OPERATIONS ====================

exports.saveUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

exports.getAllUsers = async (page, limit) => {
  const skip = (page - 1) * limit;
  const [users, total] =await Promise.all([
    User.find({isDeleted: false})
    .select("-password")
    .sort({ _id: 1 })
    .skip(skip)
    .limit(limit)
    .lean(),
    User.countDocuments({isDeleted: false})
  ]);

  return {total,page,total_pages: Math.ceil(total / limit), pageSize: limit, data: users}
};

exports.getUserById = async (id) => {
  return await User.findById(id);
};

exports.updateUser = async (id, userData) => {
  return await User.findByIdAndUpdate(id, userData, { new: true });
};

exports.deleteUser = async (id) => {
  return await User.findByIdAndUpdate(
        id,
        {isDeleted: true,
        deletedAt: new Date()
        },
        {new: true}
    );
};

exports.getAllUsersForExport = async () => {
  return await User.find({ isDeleted: false })
    .select("-password")   // exclude sensitive info
    .sort({ _id: 1 })
    .lean();
};

// ==================== LEVEL 1: BASIC STAGES ====================

// $match - Filter users by role (with pagination for large data)
exports.filterUsersByRole = async (role, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { role: role, isDeleted: false } },
    { $project: { name: 1, email: 1, age: 1, role: 1, _id: 0 } },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });

  const totalResult = await User.aggregate([
    { $match: { role: role, isDeleted: false } },
    { $count: "total" }
  ], { allowDiskUse: true });

  const total = totalResult[0]?.total || 0;
  return { data, total };
};

// $project - Select/Modify fields (with pagination for large data)
exports.getUsersWithProjectedFields = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false } },
    { $sort: { createdAt: 1, _id: 1 } },  
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        userName: "$name",
        userEmail: "$email",
        userAge: "$age",
        userRole: "$role",
        _id: 0  
      }
    }
  ], { allowDiskUse: true });

  const totalResult = await User.aggregate([
    { $match: { isDeleted: false } },
    { $count: "total" }
  ], { allowDiskUse: true });

  const total = totalResult[0]?.total || 0;
  return { data, total };
};

// $sort - Sort users by age (with pagination for large data)
exports.getUsersSortedByAge = async (sortOrder = 1, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false } },
    { $sort: { age: sortOrder } },
    { $project: { name: 1, email: 1, age: 1, role: 1, _id: 0 } },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });

  const totalResult = await User.aggregate([
    { $match: { isDeleted: false } },
    { $count: "total" }
  ], { allowDiskUse: true });

  const total = totalResult[0]?.total || 0;
  return { data, total };
};

// $limit - Get top N users (with pagination, though limit is fixed)
exports.getTopUsers = async (limit = 5, page = 1, pageLimit = 10) => {
  const skip = (page - 1) * pageLimit;
  const data = await User.aggregate([
    { $match: { isDeleted: false } },
    { $sort: { createdAt: -1 } },
    { $limit: limit }, // Fixed limit for "top"
    { $skip: skip },
    { $limit: pageLimit },
    { $project: { name: 1, email: 1, age: 1, role: 1, _id: 0 } }
  ], { allowDiskUse: true });

  const total = Math.min(limit, await User.countDocuments({ isDeleted: false })); // Total is capped at limit
  return { data, total };
};

// $skip - Skip N users (with pagination for large data)
exports.getUsersWithSkip = async (skip = 10, limit = 10, page = 1, pageLimit = 10) => {
  const totalSkip = skip + (page - 1) * pageLimit;
  const data = await User.aggregate([
    { $match: { isDeleted: false } },
    { $skip: totalSkip },
    { $limit: pageLimit },
    { $project: { name: 1, email: 1, age: 1, role: 1, _id: 0 } }
  ], { allowDiskUse: true });

  const totalResult = await User.aggregate([
    { $match: { isDeleted: false } },
    { $count: "total" }
  ], { allowDiskUse: true });

  const total = totalResult[0]?.total || 0;
  return { data, total };
};

// ==================== LEVEL 2: GROUPING & CALCULATIONS ====================

// $group - Count users by role
exports.getUserCountByRole = async () => {
  return await User.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$role",
        totalUsers: { $sum: 1 }
      }
    }
  ], { allowDiskUse: true });
};

// $group - Total age sum by role
exports.getTotalAgeByRole = async () => {
    return await User.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$role",
        totalAge: { $sum: { $toDouble: "$age" } },
        averageAge: { $avg: { $toDouble: "$age" } },
        minAge: { $min: { $toDouble: "$age" } },
        maxAge: { $max: { $toDouble: "$age" } },
        totalUsers: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 1,
        totalAge: 1,
        averageAge: { $floor: "$averageAge" },  
        minAge: 1,
        maxAge: 1,
        totalUsers: 1
      }
    }
  ], { allowDiskUse: true });
};

// $group - Count users by role with detailed info
exports.getRoleStatistics = async () => {
  return await User.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$role",
        totalUsers: { $sum: {$toDouble: "$age" } },
        averageAge: { $avg: {$toDouble: "$age" } },
        youngestAge: { $min: {$toDouble: "$age"} },
        oldestAge: { $max: {$toDouble: "$age"} }
      }
    },
    {
      $project: {
        _id: 1,
        totalAge: 1,
        averageAge: { $floor: "$averageAge" },  
        minAge: 1,
        maxAge: 1,
        totalUsers: 1
      }
    },
    { $sort: { totalUsers: -1 } }
  ], { allowDiskUse: true });
};

// ==================== LEVEL 4: ADVANCED STAGES ====================

// $lookup - Join with roles collection (with pagination for large data)
exports.getUsersWithRoleDetails = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false } },
    {
      $lookup: {
        from: "roles",
        localField: "role",
        foreignField: "name",
        as: "roleDetails"
      }
    },
    { $unwind: "$roleDetails" },
    {
      $project: {
        name: 1,
        email: 1,
        age: 1,
        role: 1,
        roleDescription: "$roleDetails.description",
        rolePermissions: "$roleDetails.permissions",
        _id: 0
      }
    },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });

  const totalResult = await User.aggregate([
    { $match: { isDeleted: false } },
    { $count: "total" }
  ], { allowDiskUse: true });

  const total = totalResult[0]?.total || 0;
  return { data, total };
};

// $bucket - Group users by age ranges
exports.getAgeDistribution = async () => {
  return await User.aggregate([
    { $match: { isDeleted: false } },
    {
      $bucket: {
        groupBy: "$age",
        boundaries: [0, 20, 30, 40, 50, 60, 100],
        default: "Other",
        output: {
          count: { $sum: 1 },
          averageAge: { $avg: "$age" }
        }
      }
    }
  ], { allowDiskUse: true });
};

// $facet - Multiple aggregations in one query (Dashboard query)
exports.getDashboardStats = async () => {
  return await User.aggregate([
    { $match: { isDeleted: false } },
    {
      $facet: {
        totalUsers: [
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        usersByRole: [
          { $group: { _id: "$role", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        ageDistribution: [
          {
            $bucket: {
              groupBy: "$age",
              boundaries: [0, 20, 30, 40, 50, 60, 100],
              default: "Other",
              output: { count: { $sum: 1 } }
            }
          }
        ],
        averageAgeByRole: [
          { $group: { _id: "$role", averageAge: { $avg: "$age" } } }
        ],
        topOldestUsers: [
          { $sort: { age: -1 } },
          { $limit: 5 },
          { $project: { name: 1, age: 1, role: 1, _id: 0 } }
        ],
        topYoungestUsers: [
          { $sort: { age: 1 } },
          { $limit: 5 },
          { $project: { name: 1, age: 1, role: 1, _id: 0 } }
        ]
      }
    }
  ], { allowDiskUse: true });
};

// ==================== LEVEL 5: PERFORMANCE OPTIMIZATION ====================

// Using allowDiskUse for large datasets (50,000+ records)
exports.getAllUsersWithDiskUse = async () => {
  return await User.aggregate([
    { $match: { isDeleted: false } },
    { $project: { name: 1, email: 1, age: 1, role: 1, _id: 0 } }
  ], { allowDiskUse: true });
};

// Complex aggregation with allowDiskUse for large data
exports.getComplexStatsWithLargeData = async () => {
  return await User.aggregate([
    { $match: { isDeleted: false } },
    { $sort: { age: -1 } },
    {
      $facet: {
        totalCount: [{ $count: "total" }],
        byRole: [
          { $group: { _id: "$role", count: { $sum: 1 } } }
        ],
        byAgeRange: [
          {
            $bucket: {
              groupBy: "$age",
              boundaries: [0, 20, 30, 40, 50, 60, 100],
              default: "Other",
              output: { count: { $sum: 1 } }
            }
          }
        ]
      }
    }
  ], { allowDiskUse: true });
};

// Pagination with aggregation and allowDiskUse
exports.getPaginatedUsersWithAggregation = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false } },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    { $project: { name: 1, email: 1, age: 1, role: 1, createdAt: 1, _id: 0 } }
  ], { allowDiskUse: true });

  const totalResult = await User.aggregate([
    { $match: { isDeleted: false } },
    { $count: "total" }
  ], { allowDiskUse: true });

  const total = totalResult[0]?.total || 0;
  return { data, total };
};

// ==================== ARRAY & NESTED QUERYING METHODS ====================

// LEVEL 1: Simple Arrays
// 1. Find documents containing a value in array
exports.getUsersBySkill = async (skill, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false, skills: skill } },  // Simple array match
    { $project: { name: 1, email: 1, skills: 1, _id: 0 } },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });
  const total = await User.countDocuments({ isDeleted: false, skills: skill });
  return { data, total };
};

// 2. Find documents with multiple values ($all)
exports.getUsersBySkillsAll = async (skills, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false, skills: { $all: skills } } },  // Must contain ALL
    { $project: { name: 1, email: 1, skills: 1, _id: 0 } },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });
  const total = await User.countDocuments({ isDeleted: false, skills: { $all: skills } });
  return { data, total };
};

// 3. Match ANY value ($in)
exports.getUsersBySkillsIn = async (skills, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false, skills: { $in: skills } } },  // Match ANY
    { $project: { name: 1, email: 1, skills: 1, _id: 0 } },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });
  const total = await User.countDocuments({ isDeleted: false, skills: { $in: skills } });
  return { data, total };
};

// 4. Match array size
exports.getUsersBySkillsSize = async (size, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false, skills: { $size: size } } },
    { $project: { name: 1, email: 1, skills: 1, _id: 0 } },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });
  const total = await User.countDocuments({ isDeleted: false, skills: { $size: size } });
  return { data, total };
};

// LEVEL 2: Nested Objects
// 5. Query nested object fields (Dot Notation)
exports.getUsersByAddressCity = async (city, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false, "address.city": city } },
    { $project: { name: 1, email: 1, address: 1, _id: 0 } },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });
  const total = await User.countDocuments({ isDeleted: false, "address.city": city });
  return { data, total };
};

// 6. Query nested numeric fields
exports.getUsersByAddressPincodeGt = async (zipCode, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false, "address.zipCode": { $gt: zipCode } } },
    { $project: { name: 1, email: 1, address: 1, _id: 0 } },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });
  const total = await User.countDocuments({ isDeleted: false, "address.zipCode": { $gt: zipCode } });
  return { data, total };
};

// LEVEL 3: Arrays of Objects
// 7. Find users who worked on project titled "CRM"
exports.getUsersByProjectTitle = async (title, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false, "projects.title": title } },
    { $project: { name: 1, email: 1, projects: 1, _id: 0 } },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });
  const total = await User.countDocuments({ isDeleted: false, "projects.title": title });
  return { data, total };
};

// 8. Correct Way — Use $elemMatch
exports.getUsersWithProjectsElemMatch = async (title, budget, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false, projects: { $elemMatch: { title: title, budget: budget } } } },
    { $project: { name: 1, email: 1, projects: 1, _id: 0 } },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });
  const total = await User.countDocuments({ isDeleted: false, projects: { $elemMatch: { title: title, budget: budget } } });
  return { data, total };
};

// LEVEL 4: Nested Arrays inside Arrays
// 9. Find users using MongoDB in any project
exports.getUsersByProjectTechnologies = async (technology, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false, "projects.technologies": technology } },
    { $project: { name: 1, email: 1, projects: 1, _id: 0 } },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });
  const total = await User.countDocuments({ isDeleted: false, "projects.technologies": technology });
  return { data, total };
};

// 10. Using $elemMatch inside nested arrays
exports.getUsersWithProjectsElemMatchTech = async (technology, budget, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false, projects: { $elemMatch: { technologies: technology, budget: { $gt: budget } } } } },
    { $project: { name: 1, email: 1, projects: 1, _id: 0 } },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });
  const total = await User.countDocuments({ isDeleted: false, projects: { $elemMatch: { technologies: technology, budget: { $gt: budget } } } });
  return { data, total };
};

// LEVEL 5: Advanced Array Operators
// 11. $exists
exports.getUsersWithAddressExists = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false, "address.city": { $exists: true } } },
    { $project: { name: 1, email: 1, address: 1, _id: 0 } },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });
  const total = await User.countDocuments({ isDeleted: false, "address.city": { $exists: true } });
  return { data, total };
};

// 12. $type
exports.getUsersByAgeType = async (type, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false, age: { $type: type } } },  // e.g., "number"
    { $project: { name: 1, email: 1, age: 1, _id: 0 } },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });
  const total = await User.countDocuments({ isDeleted: false, age: { $type: type } });
  return { data, total };
};

// 13. $slice (Projection)
exports.getUsersWithProjectsSlice = async (slice, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const data = await User.aggregate([
    { $match: { isDeleted: false } },
    { $project: { name: 1, email: 1, projects: { $slice: ["$projects", slice] }, _id: 0 } },  // Fixed: $slice with array reference and slice value
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });
  const total = await User.countDocuments({ isDeleted: false });
  return { data, total };
};

// Real-World Example (Production-Level Query)
exports.getUsersProductionQuery = async (city, skillsSize, technology, budget, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const technologyArray = technology? technology.split(',').map(tech => tech.trim()) : [];
  const data = await User.aggregate([
    { $match: {
      isDeleted: false,
      "address.city": city,
      skills: { $size: skillsSize },
      projects: { $elemMatch: { budget: { $gt: budget }, technologies: {$all: technologyArray} } }
    } },
    { $project: { name: 1, email: 1, address: 1, skills: 1, _id: 0 ,projects: {
        $filter: {
          input: "$projects",
          as: "project",
          cond: {
            $and: [
              { $gt: ["$$project.budget", budget] },
              { $setIsSubset: [technologyArray, "$$project.technologies"] }  // Ensures all required technologies are present
            ]
          }
        }
      }} },
    { $skip: skip },
    { $limit: limit }
  ], { allowDiskUse: true });
  const total = await User.countDocuments({
    isDeleted: false,
    "address.city": city,
    skills: { $size: skillsSize },
    projects: { $elemMatch: { budget: { $gt: budget }, technologies: {$all: technologyArray} } }
  });
  return { data, total };
};

exports.addCommentByUserId = async (userId, content, author) => {
  // Find and update the user by adding the comment
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        comments: {
          content: content,
          author: author,
          createdAt: new Date()  // Explicitly set, though default handles it
        }
      }
    },
    { new: true, runValidators: true }  // Return updated doc, run schema validators
  );

  if (!user) {
    throw new Error('User not found or unable to update');
  }

  return user;
};

exports.updateCommentByUserId = async (userId, commentId, content) => {
  const user = await User.findOneAndUpdate(
    { _id: userId, 'comments._id': commentId },
    {$set: {
      'comments.$.content': content,
      'comments.$.updatedAt': new Date()
    }},
    { new: true, runValidators: true }
  );
    if(!user){
      throw new Error('User not found or unable to update');
    }
    return user;
}