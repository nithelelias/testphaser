fetch("folders.json")
  .then((response) => response.json())
  .then((data) => {
    renderTerminal(data);
  });

function renderTerminal(data) {
  const mapRoutes = {};
  data.folders.forEach((folder) => {
    if (folder[0] === "+") {
      const slashIndex = folder.indexOf("/");
      if (slashIndex > -1) {
        const mainfolder = folder.substring(0, slashIndex);
        const sub = folder.substring(slashIndex + 1, folder.length);
        mapRoutes[mainfolder].push(sub);
      } else {
        mapRoutes[folder] = [];
      }
    } else {
      mapRoutes[folder] = folder;
    }
  });

  const app = document.createElement("div");
  app.innerHTML = `<div class="terminal"> 
  <div class="terminal-body"> 
    <div class="output grid-responsive-8 " id="routes-output" ></div> 
  </div>
</div>`;
  document.body.appendChild(app);
  const output = document.getElementById("routes-output");
  const renderOutput = (folders) => {
    output.innerHTML = "";
    let i = 0;
    for (let key in folders) {
      const value = folders[key];
      const div = document.createElement("div");
      const isFolder = Array.isArray(value);
      const isFunction = typeof value === "function";
      const icon = isFolder ? "📁" : "🎮";
      div.innerHTML = ` <a href='#' class='box-option' > <span class="dir">${icon}</span> ${key}</a> `;

      div.onclick = () => {
        if (isFunction) {
          value();
          return;
        }
        if (isFolder) {
          const map = {
            "..": () => {
              renderOutput(mapRoutes);
            },
          };
          value.forEach((folder) => {
            map[folder] = folder;
          });
          renderOutput(map);
        } else {
          location.href = value;
        }
      };

      setTimeout(() => {
        output.appendChild(div);
      }, i * 30);
      i++;
    }
  };
  renderOutput(mapRoutes);
}
