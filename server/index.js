const express = require("express");
var cors = require("cors");

const app = express();
const port = 3030;

app.use(cors());
app.use(express.json());

let escrows = [];

app.post("/", (req, res) => {
  const data = req.body;
  escrows.push(data);
  res.status(201).json({ data });
});

app.post("/approved", (req, res) => {
  const { address } = req.body;
  let done = false;
  for (let i = 0; i < escrows.length; i++) {
    if (escrows[i].address == address) {
      escrows[i].approved = true;
      done = true;
      break;
    }
  }
  res.json({ done });
});

app.get("/", (req, res) => {
  res.json({ escrows });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
