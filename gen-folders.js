///$:  node  gen-folders
const fs = require("fs");
const path = require("path");

function getFolders(dir) {
  const folders = [];

  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      if (item[0] === ".") return;
      folders.push(item);
      // Get subfolders recursively
      if (item[0] !== "+") return;
      const subFolders = getFolders(fullPath);
      subFolders.forEach((subFolder) => {
        folders.push(path.join(item, subFolder));
      });
    }
  });

  return folders;
}

const projectFolders = getFolders("./");

const foldersJson = JSON.stringify(
  {
    folders: projectFolders,
  },
  null,
  2
);

fs.writeFileSync("folders.json", foldersJson);
