const outputDiv = document.getElementById("output");
const commandInput = document.getElementById("command");

const fileSystem = {}; // In-memory file system
const processes = []; // Simulated process list

const commands = {
  pwd: () => "/user/home",
  ls: () => Object.keys(fileSystem).join("\n") || "No files",

  cd: (args) => `Changed directory to ${args[0] || "/"}`,

  mkdir: (args) => {
    const dir = args[0];
    if (!dir) return "mkdir: missing directory name";
    fileSystem[dir] = {};
    return `Directory '${dir}' created`;
  },

  rmdir: (args) => {
    const dir = args[0];
    if (!dir || !fileSystem[dir]) return `rmdir: '${dir}' not found`;
    delete fileSystem[dir];
    return `Directory '${dir}' removed`;
  },

  rm: (args) => {
    const file = args[0];
    if (!file || !fileSystem[file]) return `rm: '${file}' not found`;
    delete fileSystem[file];
    return `File '${file}' removed`;
  },

  cp: (args) => {
    const [src, dest] = args;
    if (!fileSystem[src]) return `cp: '${src}' not found`;
    fileSystem[dest] = fileSystem[src];
    return `Copied '${src}' to '${dest}'`;
  },

  mv: (args) => {
    const [src, dest] = args;
    if (!fileSystem[src]) return `mv: '${src}' not found`;
    fileSystem[dest] = fileSystem[src];
    delete fileSystem[src];
    return `Moved '${src}' to '${dest}'`;
  },

  touch: (args) => {
    const file = args[0];
    fileSystem[file] = fileSystem[file] || "";
    return `File '${file}' created`;
  },

  cat: (args) => {
    const file = args[0];
    return fileSystem[file] || `cat: '${file}' not found`;
  },

  head: (args) => {
    const file = args[0];
    const lines = (fileSystem[file] || "").split("\n");
    return lines.slice(0, 5).join("\n") || `head: '${file}' not found`;
  },

  tail: (args) => {
    const file = args[0];
    const lines = (fileSystem[file] || "").split("\n");
    return lines.slice(-5).join("\n") || `tail: '${file}' not found`;
  },

  chmod: () => "chmod simulated (no effect)",
  chown: () => "chown simulated (no effect)",
  chgrp: () => "chgrp simulated (no effect)",

  find: () => Object.keys(fileSystem).join("\n"),
  grep: (args) => {
    const [pattern, file] = args;
    if (!fileSystem[file]) return `grep: '${file}' not found`;
    return fileSystem[file].split("\n").filter(line => line.includes(pattern)).join("\n");
  },

  wc: (args) => {
    const file = args[0];
    if (!fileSystem[file]) return `wc: '${file}' not found`;
    const lines = fileSystem[file].split("\n");
    const words = fileSystem[file].split(/\s+/);
    return `${lines.length} ${words.length} ${fileSystem[file].length}`;
  },

  bc: (args) => {
    try {
      return eval(args.join(" ")).toString();
    } catch {
      return "bc: invalid expression";
    }
  },

  whoami: () => "user",
  who: () => "user\nroot",
  uname: () => "UnixSim 1.0",
  date: () => new Date().toString(),
  year: () => new Date().getFullYear().toString(),
  month: () => (new Date().getMonth() + 1).toString(),

  echo: (args) => {
    const str = args.join(" ");
    const redir = args.indexOf("|=") > -1 ? "|=" : args.indexOf(">") > -1 ? ">" : null;
    if (redir) {
      const idx = args.indexOf(redir);
      const content = args.slice(0, idx).join(" ");
      const filename = args[idx + 1];
      if (redir === ">") fileSystem[filename] = content;
      else fileSystem[filename] += "\n" + content;
      return "";
    }
    return str;
  },

  man: (args) => {
    const cmd = args[0];
    if (!cmd) return "Usage: man command";
    if (!commands[cmd]) return `No manual entry for ${cmd}`;
    return `${cmd} - simulated manual page\nUsage: ${cmd} [args]`;
  },

  help: () => Object.keys(commands).join("  "),

  clear: () => {
    outputDiv.innerHTML = "";
    return "";
  },

  "./program": () => "Program executed (simulated)",
};

async function handleCommand(input) {
  const tokens = input.trim().split(/\s+/);
  const cmd = tokens[0];
  const args = tokens.slice(1);

  appendLine(`$ ${input}`);
  if (commands[cmd]) {
    const result = await commands[cmd](args);
    if (result) appendLine(result);
  } else {
    appendLine(`Command not found: ${cmd}`);
  }
}

function appendLine(text) {
  const line = document.createElement("div");
  line.className = "line";
  line.textContent = text;
  outputDiv.appendChild(line);
  outputDiv.scrollTop = outputDiv.scrollHeight;
}

commandInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const input = commandInput.value;
    commandInput.value = "";
    handleCommand(input);
  }
});
