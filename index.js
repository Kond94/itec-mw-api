const express = require("express");
const { createServer } = require("node:http");
var pg = require("pg").native;
require("dotenv").config({ path: "./.env" });
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
module.exports = { io };

const port = 3000;

const db = require("./queries");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.get("/organizations", db.getOrganizations);
app.get("/organizations/:id", db.getOrganizationById);
app.get("/organizations/users/:id", db.getOrganizationUsers);
app.get("/organizations/printers/:id", db.getOrganizationPrinters);
app.post("/organizations", db.createOrganization);
app.put("/organizations/:id", db.updateOrganization);
app.delete("/organizations/:id", db.deleteOrganization);

app.get("/users/:id", db.getUserById);
app.get("/users", db.getUsers);
app.post("/users", db.createUser);
app.put("/users/:id", db.updateUser);
app.delete("/users/:id", db.deleteUser);

app.get("/printers/:id", db.getPrinterById);
app.get("/printers", db.getPrinters);
app.post("/printers", db.createPrinter);
app.put("/printers/:id", db.updatePrinter);
app.delete("/printers/:id", db.deletePrinter);

app.get("/printers/problems/types", db.getPrinterIssueTypes);
app.get("/printers/:id", db.getPrinterById);
app.get("/printers", db.getPrinters);
app.post("/printers", db.createPrinter);
app.put("/printers/:id", db.updatePrinter);
app.delete("/printers/:id", db.deletePrinter);

app.get("/printers/histories/problems/:id", db.getPrinterHistoryProblems);
app.get("/printers/histories/solutions/:id", db.getPrinterHistoryResolutions);
app.post("/printers/histories/solutions/", db.createPrinterHistorySolution);
app.post("/printers/histories/problems/", db.createPrinterHistoryProblem);
app.put("/printers/history/:id", db.updatePrinterHistory);
app.delete("/printers/history/:id", db.deletePrinterHistory);
app.get("/printers/history/parts/count/", db.getPartLastReplacedCount);

app.get("/printers/history/parts/:id", db.getPrinterHistoryPartById);
app.get("/printers/histories/parts/:id", db.getPrinterHistoryParts);
app.post("/printers/history/parts", db.createPrinterHistoryPart);
app.put("/printers/history/parts/:id", db.updatePrinterHistoryPart);
app.delete("/printers/history/parts/:id", db.deletePrinterHistoryPart);

app.get("/manufacturers/:id", db.getManufacturerById);
app.get("/manufacturers/parts/:id", db.getManufacturerParts);
app.get("/manufacturers/models/:id", db.getManufacturerModels);
app.get("/manufacturers", db.getManufacturers);
app.post("/manufacturers", db.createManufacturer);
app.put("/manufacturers/:id", db.updateManufacturer);
app.delete("/manufacturers/:id", db.deleteManufacturer);

app.get("/models/:id", db.getModelById);
app.get("/models", db.getModels);
app.post("/models", db.createModel);
app.put("/models/:id", db.updateModel);
app.delete("/models/:id", db.deleteModel);

app.get("/parts/:id", db.getPartById);
app.get("/parts", db.getParts);
app.post("/parts", db.createPart);
app.put("/parts/:id", db.updatePart);
app.delete("/parts/:id", db.deletePart);

app.get("/pending/parts/nonInvoiced", db.getNonInvoicedParts);
app.get(
  "/pending/organizations/parts/nonInvoiced/:id",
  db.getOrganizationNonInvoicedParts
);
app.get("/pending/printers/history/unresolved", db.getUnresolvedProblems);
app.get(
  "/pending/organizations/printers/history/unresolved/:id",
  db.getOrganizationUnresolvedProblems
);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500).json(response.error(err.status || 500));
});
