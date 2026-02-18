const express = require("express");
const userController = require("../controller/userController");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(verifyToken, authorizeRole(["admin"]));

router.post("/save", userController.createUser);//.bind(userController)
router.get("/getAll", userController.getAllUsers); //.bind(userController)
router.get("/get/:id", userController.getUserById);//.bind(userController)
router.put("/update/:id", userController.updateUser);//.bind(userController)
router.delete("/delete/:id", userController.deleteUser);//.bind(userController)
router.get("/export", userController.exportUsers);


// ==================== LEVEL 1: BASIC STAGES ====================
router.get('/filter/:role', userController.filterUsersByRole); // Supports ?page=1&limit=10
router.get('/projected', userController.getUsersWithProjectedFields); // Supports ?page=1&limit=10
router.get('/sorted', userController.getUsersSortedByAge); // Supports ?sortOrder=1&page=1&limit=10
router.get('/top', userController.getTopUsers); // Supports ?limit=5&page=1&pageLimit=10
router.get('/skipped', userController.getUsersWithSkip); // Supports ?skip=10&limit=10&page=1&pageLimit=10

// ==================== LEVEL 2: GROUPING & CALCULATIONS ====================
router.get('/count-by-role', userController.getUserCountByRole);
router.get('/total-age-by-role', userController.getTotalAgeByRole);
router.get('/role-statistics', userController.getRoleStatistics);

// ==================== LEVEL 4: ADVANCED STAGES ====================
router.get('/with-role-details', userController.getUsersWithRoleDetails); // Supports ?page=1&limit=10
router.get('/age-distribution', userController.getAgeDistribution);
router.get('/dashboard-stats', userController.getDashboardStats);

// ==================== LEVEL 5: PERFORMANCE OPTIMIZATION ====================
router.get('/all-with-disk-use', userController.getAllUsersWithDiskUse);
router.get('/complex-stats', userController.getComplexStatsWithLargeData);
router.get('/paginated-aggregation', userController.getPaginatedUsersWithAggregation); // Supports ?page=1&limit=10

// ==================== ARRAY & NESTED QUERYING METHODS ====================
// LEVEL 1: Simple Arrays
router.get('/skill/:skill', userController.getUsersBySkill);  // ?page=1&limit=10
router.get('/skills-all', userController.getUsersBySkillsAll);  // ?skills=Java,React&page=1&limit=10
router.get('/skills-in', userController.getUsersBySkillsIn);  // ?skills=Python,MongoDB&page=1&limit=10
router.get('/skills-size/:size', userController.getUsersBySkillsSize);  // ?page=1&limit=10

// LEVEL 2: Nested Objects
router.get('/address-city/:city', userController.getUsersByAddressCity);  // ?page=1&limit=10
router.get('/address-pincode-gt/:pincode', userController.getUsersByAddressPincodeGt);  // ?page=1&limit=10

// LEVEL 3: Arrays of Objects
router.get('/project-title/:title', userController.getUsersByProjectTitle);  // ?page=1&limit=10
router.get('/projects-elem-match', userController.getUsersWithProjectsElemMatch);  // ?title=CRM&budget=50000&page=1&limit=10

// LEVEL 4: Nested Arrays inside Arrays
router.get('/project-technologies/:technology', userController.getUsersByProjectTechnologies);  // ?page=1&limit=10
router.get('/projects-elem-match-tech', userController.getUsersWithProjectsElemMatchTech);  // ?technology=MongoDB&budget=80000&page=1&limit=10

// LEVEL 5: Advanced Array Operators
router.get('/address-exists', userController.getUsersWithAddressExists);  // ?page=1&limit=10
router.get('/age-type/:type', userController.getUsersByAgeType);  // ?page=1&limit=10 (e.g., type=number)
router.get('/projects-slice/:slice', userController.getUsersWithProjectsSlice);  // ?page=1&limit=10 (e.g., slice=1 for first project)

// Real-World Example (Production-Level Query)
router.get('/production-query', userController.getUsersProductionQuery);  // ?city=Hyderabad&skillsSize=3&technology=MongoDB&budget=80000&page=1&limit=10


router.post('/:id/comments', userController.addComment);
router.put('/:id/comments/:commentId', userController.updateComment);  // PUT /api/users/:id/comments/:commentId
module.exports = router;