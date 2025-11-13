const fs = require("fs");
const https = require("https");
const path = require("path");

// Cartella di destinazione
const folder = path.join(__dirname, "assets/img/champions");
if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

// Lista dei champion da scaricare
const champions = [
  "ChoGath",
  "KhaZix",
  "LeBlanc",
  "RenataGlasc",
  "KaiSa"
];

// Funzione per scaricare un file
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", err => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function downloadAll() {
  for (const champ of champions) {
    try {
      const iconUrl = `https://ddragon.leagueoflegends.com/cdn/15.22.1/img/champion/${champ}.png`;
      const loadingUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ}_0.jpg`;

      await downloadImage(iconUrl, path.join(folder, `${champ}.png`));
      console.log(`Scaricata icona di ${champ}`);
      await downloadImage(loadingUrl, path.join(folder, `${champ}_0.jpg`));
      console.log(`Scaricato loading screen di ${champ}`);
    } catch (err) {
      console.error(`Errore con ${champ}:`, err.message);
    }
  }
  console.log("Download completato!");
}

downloadAll();