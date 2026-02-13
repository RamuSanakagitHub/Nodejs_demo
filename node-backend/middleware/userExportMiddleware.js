const ExcelJS = require('exceljs');

const generateExcelUsers = async (users) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Users');

  if (!users || users.length === 0) {
    return workbook;
  }

  // Define the fields you want in the Excel
  const fields = ['id', 'name', 'email', 'age', 'role', 'fileId', 'isDeleted', 'deletedAt', 'createdAt', 'updatedAt'];

  // Create columns: first column S.No, then the selected fields
  worksheet.columns = [
    { header: 'S.No', key: 'sno', width: 5 },
    ...fields.map((key) => ({
      header: key.charAt(0).toUpperCase() + key.slice(1),
      key,
      width: 20,
    })),
  ];

  // Add rows
  users.forEach((user, index) => {
    const plainUser = user.toObject ? user.toObject() : user;

    // Pick only the fields we need
    const row = { sno: index + 1 };
    fields.forEach((key) => {
      row[key] = plainUser[key];
    });

    worksheet.addRow(row);
  });

  return workbook;
};

module.exports = generateExcelUsers;

// const ExcelJS = require('exceljs');

// const generateExcelUsers = async (users) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet('Users');

//   if (!users || users.length === 0) {
//     return workbook;
//   }

//   // Convert first user to plain object if it's a Mongoose doc
//   const firstUser = users[0].toObject ? users[0].toObject() : users[0];

//   // Define keys to ignore (Mongo internal fields)
//   const ignoreKeys = ['__v', '$__', '$isNew'];

//   // Get dynamic fields from first user, filtering unwanted keys
//   const dynamicFields = Object.keys(firstUser).filter(key => !ignoreKeys.includes(key));

//   // Create columns: first column S.No, then the dynamic fields
//   worksheet.columns = [
//     { header: 'S.No', key: 'sno', width: 5 },
//     ...dynamicFields.map((key) => ({
//       header: key.charAt(0).toUpperCase() + key.slice(1),
//       key,
//       width: 20,
//     })),
//   ];

//   // Add rows
//   users.forEach((user, index) => {
//     const plainUser = user.toObject ? user.toObject() : user;

//     const row = { sno: index + 1 };
//     dynamicFields.forEach((key) => {
//       row[key] = plainUser[key];
//     });

//     worksheet.addRow(row);
//   });

//   return workbook;
// };

// module.exports = generateExcelUsers;