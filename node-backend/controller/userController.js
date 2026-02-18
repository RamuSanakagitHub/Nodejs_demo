const { default: mongoose } = require("mongoose");
const generateExcelUsersStream = require("../middleware/userExportMiddleware");
const userService = require("../services/userService");


const OK = 200;
const CREATED = 201;
const INTERNAL_SERVER_ERROR = 500;
const NOT_FOUND = 404;
const BAD_REQUEST = 400;


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
          const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = parseInt(req.query.limit) || 10;
        const users = await userService.getAllUsers(page, limit);
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
    // async exportUsers(req, res) {
    //     try{
    //         const users = await userService.getExportUsers();
    //         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    //         res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
    //         await users.xlsx.write(res);
    //         res.status(OK).end();
    //     }catch(error){
    //         res.status(INTERNAL_SERVER_ERROR).json({error: error.message});
    //     }
    // }
    async exportUsers(req, res) {
    try {
        const users = await userService.getExportUsers();        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
        
        await generateExcelUsersStream(users, res);
        res.end();
    } catch(error) {
        console.error('Export error:', error);
        res.status(500).json({error: error.message});
    }
}

// ==================== LEVEL 1: BASIC STAGES ====================

  async filterUsersByRole(req, res) {
    try {
      const { role } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { data, total } = await userService.filterUsersByRole(role, page, limit);
      const total_pages = Math.ceil(total / limit);
      res.status(OK).json({ data, total_pages });
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async getUsersWithProjectedFields(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { data, total } = await userService.getUsersWithProjectedFields(page, limit);
      const total_pages = Math.ceil(total / limit);
      res.status(OK).json({ data, total_pages });
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async getUsersSortedByAge(req, res) {
    try {
      const sortOrder = parseInt(req.query.sortOrder) || 1;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { data, total } = await userService.getUsersSortedByAge(sortOrder, page, limit);
      const total_pages = Math.ceil(total / limit);
      res.status(OK).json({ data, total_pages });
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async getTopUsers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const page = parseInt(req.query.page) || 1;
      const pageLimit = parseInt(req.query.pageLimit) || 10;
      const { data, total } = await userService.getTopUsers(limit, page, pageLimit);
      const total_pages = Math.ceil(total / pageLimit);
      res.status(OK).json({ data, total_pages });
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async getUsersWithSkip(req, res) {
    try {
      const skip = parseInt(req.query.skip) || 10;
      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      const pageLimit = parseInt(req.query.pageLimit) || 10;
      const { data, total } = await userService.getUsersWithSkip(skip, limit, page, pageLimit);
      const total_pages = Math.ceil(total / pageLimit);
      res.status(OK).json({ data, total_pages });
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  // ==================== LEVEL 2: GROUPING & CALCULATIONS ====================

  async getUserCountByRole(req, res) {
    try {
      const stats = await userService.getUserCountByRole();
      res.status(OK).json(stats);
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async getTotalAgeByRole(req, res) {
    try {
      const stats = await userService.getTotalAgeByRole();
      res.status(OK).json(stats);
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async getRoleStatistics(req, res) {
    try {
      const stats = await userService.getRoleStatistics();
      res.status(OK).json(stats);
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  // ==================== LEVEL 4: ADVANCED STAGES ====================

  async getUsersWithRoleDetails(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { data, total } = await userService.getUsersWithRoleDetails(page, limit);
      const total_pages = Math.ceil(total / limit);
      res.status(OK).json({ data, total_pages });
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async getAgeDistribution(req, res) {
    try {
      const distribution = await userService.getAgeDistribution();
      res.status(OK).json(distribution);
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async getDashboardStats(req, res) {
    try {
      const stats = await userService.getDashboardStats();
      res.status(OK).json(stats);
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  // ==================== LEVEL 5: PERFORMANCE OPTIMIZATION ====================

  async getAllUsersWithDiskUse(req, res) {
    try {
      const users = await userService.getAllUsersWithDiskUse();
      res.status(OK).json(users);
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async getComplexStatsWithLargeData(req, res) {
    try {
      const stats = await userService.getComplexStatsWithLargeData();
      res.status(OK).json(stats);
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async getPaginatedUsersWithAggregation(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { data, total } = await userService.getPaginatedUsersWithAggregation(page, limit);
      const total_pages = Math.ceil(total / limit);
      res.status(OK).json({ data, total_pages });
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

 // ==================== ARRAY & NESTED QUERYING METHODS ====================

async getUsersBySkill(req, res) {
  try {
    const { skill } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data, total } = await userService.getUsersBySkill(skill, page, limit);
    const total_pages = Math.ceil(total / limit);
    res.status(OK).json({ data, total_pages });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

async getUsersBySkillsAll(req, res) {
  try {
    const skills = req.query.skills ? req.query.skills.split(',') : [];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data, total } = await userService.getUsersBySkillsAll(skills, page, limit);
    const total_pages = Math.ceil(total / limit);
    res.status(OK).json({ data, total_pages });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

async getUsersBySkillsIn(req, res) {
  try {
    const skills = req.query.skills ? req.query.skills.split(',') : [];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data, total } = await userService.getUsersBySkillsIn(skills, page, limit);
    const total_pages = Math.ceil(total / limit);
    res.status(OK).json({ data, total_pages });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

async getUsersBySkillsSize(req, res) {
  try {
    const { size } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data, total } = await userService.getUsersBySkillsSize(parseInt(size), page, limit);
    const total_pages = Math.ceil(total / limit);
    res.status(OK).json({ data, total_pages });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

async getUsersByAddressCity(req, res) {
  try {
    const { city } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data, total } = await userService.getUsersByAddressCity(city, page, limit);
    const total_pages = Math.ceil(total / limit);
    res.status(OK).json({ data, total_pages });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

async getUsersByAddressPincodeGt(req, res) {
  try {
    const { pincode } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data, total } = await userService.getUsersByAddressPincodeGt(parseInt(pincode), page, limit);
    const total_pages = Math.ceil(total / limit);
    res.status(OK).json({ data, total_pages });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

async getUsersByProjectTitle(req, res) {
  try {
    const { title } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data, total } = await userService.getUsersByProjectTitle(title, page, limit);
    const total_pages = Math.ceil(total / limit);
    res.status(OK).json({ data, total_pages });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

async getUsersWithProjectsElemMatch(req, res) {
  try {
    const { title, budget } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data, total } = await userService.getUsersWithProjectsElemMatch(title, parseInt(budget), page, limit);
    const total_pages = Math.ceil(total / limit);
    res.status(OK).json({ data, total_pages });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

async getUsersByProjectTechnologies(req, res) {
  try {
    const { technology } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data, total } = await userService.getUsersByProjectTechnologies(technology, page, limit);
    const total_pages = Math.ceil(total / limit);
    res.status(OK).json({ data, total_pages });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

async getUsersWithProjectsElemMatchTech(req, res) {
  try {
    const { technology, budget } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data, total } = await userService.getUsersWithProjectsElemMatchTech(technology, parseInt(budget), page, limit);
    const total_pages = Math.ceil(total / limit);
    res.status(OK).json({ data, total_pages });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

async getUsersWithAddressExists(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data, total } = await userService.getUsersWithAddressExists(page, limit);
    const total_pages = Math.ceil(total / limit);
    res.status(OK).json({ data, total_pages });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

async getUsersByAgeType(req, res) {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data, total } = await userService.getUsersByAgeType(type, page, limit);
    const total_pages = Math.ceil(total / limit);
    res.status(OK).json({ data, total_pages });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

async getUsersWithProjectsSlice(req, res) {
  try {
    const { slice } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data, total } = await userService.getUsersWithProjectsSlice(parseInt(slice), page, limit);
    const total_pages = Math.ceil(total / limit);
    res.status(OK).json({ data, total_pages });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

async getUsersProductionQuery(req, res) {
  try {
    const { city, skillsSize, technology, budget } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data, total } = await userService.getUsersProductionQuery(city, parseInt(skillsSize), technology, parseInt(budget), page, limit);
    const total_pages = Math.ceil(total / limit);
    res.status(OK).json({ data, total_pages });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

async addComment(req, res) {
  try {
    const { id } = req.params;  // User ID from URL params
    const { content, author } = req.body;  // Extract from request body

    // Basic validation
    if (!content || !author) {
      return res.status(BAD_REQUEST).json({ error: 'Content and author are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(author)) {
      return res.status(BAD_REQUEST).json({ error: 'Invalid user ID or author ID' });
    }

    // Call service to add comment
    const user = await userService.addCommentByUserId(id, content, author);
    res.status(OK).json(user);
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

async updateComment(req, res) {
  try{
    const {id} = req.params;
    const { content} = req.body;
    if(!content ){
      return res.status(BAD_REQUEST).json({error: 'Content is required'});
    }
    if(!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(author)){
      return res.status(BAD_REQUEST).json({error: 'Invalid user ID or author ID'});
    }
    const user = await userService.updateCommentByUserId(id, content, author);
    res.status(OK).json(user);
  }catch(error){
    res.status(INTERNAL_SERVER_ERROR).json({error: error.message});
  }
}
}

module.exports = new UserController();