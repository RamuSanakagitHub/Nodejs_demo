// const ExcelJS = require('exceljs');

// const generateExcelUsers = async (users) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet('Users');

//   if (!users || users.length === 0) {
//     return workbook;
//   }

//   // Define the fields you want in the Excel
//   const fields = ['id', 'name', 'email', 'age', 'role', 'fileId', 'isDeleted', 'deletedAt', 'createdAt', 'updatedAt'];

//   // Create columns: first column S.No, then the selected fields
//   worksheet.columns = [
//     { header: 'S.No', key: 'sno', width: 5 },
//     ...fields.map((key) => ({
//       header: key.charAt(0).toUpperCase() + key.slice(1),
//       key,
//       width: 20,
//     })),
//   ];

//   // Add rows
//   users.forEach((user, index) => {
//     const plainUser = user.toObject ? user.toObject() : user;

//     // Pick only the fields we need
//     const row = { sno: index + 1 };
//     fields.forEach((key) => {
//       row[key] = plainUser[key];
//     });

//     worksheet.addRow(row);
//   });

//   return workbook;
// };

// module.exports = generateExcelUsers;

const ExcelJS = require('exceljs');

const generateExcelUsersStream = async (users, res) => {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
  const worksheet = workbook.addWorksheet('Users');
  
  const fields = ['_id', 'name', 'email', 'age', 'role', 'fileId', 'isDeleted', 'deletedAt', 'createdAt', 'updatedAt'];
  
  worksheet.columns = [
    { header: 'S.No', key: 'sno', width: 10 },
    ...fields.map(key => ({ 
      header: key.charAt(0).toUpperCase() + key.slice(1), 
      key, 
      width: 20 
    }))
  ];

  // Add rows from the users array
  users.forEach((user, index) => {
    const row = { sno: index + 1 };
    fields.forEach(key => {
      row[key] = user[key];
    });
    worksheet.addRow(row).commit();
  });

  await workbook.commit();
};

module.exports = generateExcelUsersStream;