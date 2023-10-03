const Pool = require("pg").Pool;
const { Client } = require("pg");
const { io } = require(".");
const { Expo } = require("expo-server-sdk");
require("dotenv").config({ path: "./.env" });
const expo = new Expo();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: true,
});

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: true,
});

client.connect();

client.on("notification", (notification) => {
  switch (notification.payload) {
    case "manufacturers_changed":
      pool.query("SELECT * FROM manufacturers", (error, results) => {
        if (error) {
          console.error("Error executing query", error);
        } else {
          io.emit("manufacturers_changed", results.rows);
        }
      });

      break;
    case "organizations_changed":
      pool.query("SELECT * FROM organizations", (error, results) => {
        if (error) {
          console.error("Error executing query", error);
        } else {
          console.log("Changed");
          io.emit("organizations_changed", results.rows);
        }
      });
      break;
    case "printers_changed":
      pool.query("SELECT * FROM printers", (error, results) => {
        if (error) {
          console.error("Error executing query", error);
        } else {
          io.emit("printers_changed", results.rows);
        }
      });
      break;

    case "printers_history_changed":
      io.emit("printers_history_changed", "The Data has Changed");

      break;
    case "users_changed":
      io.emit("users_changed", "The Data has Changed");

      break;
    default:
      break;
  }
  // Perform the PostgreSQL query
});

client.query("LISTEN trigger_event");

const getOrganizations = (request, response) => {
  pool.query(
    "SELECT * FROM organizations ORDER BY id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }

      response.status(200).json(results.rows);
    }
  );
};

const getOrganizationById = (request, response) => {
  const id = request.params.id;

  pool.query(
    "SELECT * FROM organizations WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }

      response.status(200).json(results.rows);
    }
  );
};

const createOrganization = (request, response) => {
  const { name, photo } = request.body;

  pool.query(
    "INSERT INTO organizations (name, photo) VALUES ($1, $2) ",
    [name, photo],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Organization added`);
    }
  );
};

const updateOrganization = (request, response) => {
  const id = request.params.id;
  const { name, photo } = request.body;

  pool.query(
    "UPDATE organizations SET name = $1, photo = $2 WHERE id = $3",
    [name, photo, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Organization modified`);
    }
  );
};

const deleteOrganization = (request, response) => {
  const id = request.params.id;

  pool.query(
    "DELETE FROM organizations WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Organization deleted`);
    }
  );
};

const getOrganizationUsers = (request, response) => {
  const id = request.params.id;

  pool.query(
    "SELECT * FROM users WHERE organization = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }

      response.status(200).json(results.rows);
    }
  );
};

const getOrganizationPrinters = (request, response) => {
  const id = request.params.id;

  pool.query(
    "SELECT printers.id, printers.name, printers.serial_number, printers.bw_count, printers.color_count, printers.total_count, manufacturers.id AS manufacturer_id,  models.id AS model_id, manufacturers.name AS manufacturer, models.name AS model,  models.photo AS printer_photo, printer_types.name AS type FROM printers LEFT JOIN models ON printers.model = models.id LEFT JOIN manufacturers ON models.manufacturer = manufacturers.id LEFT JOIN printer_types ON models.type = printer_types.id WHERE organization = $1 ORDER BY id ASC",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getUsers = (request, response) => {
  pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getPrinterHistoryProblemTypes = (request, response) => {
  pool.query(
    "SELECT * FROM printer_history_problem_types ORDER BY id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getPrinterTypes = (request, response) => {
  console.log("Getting Parts");

  pool.query(
    "SELECT * FROM printer_types ORDER BY id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      console.log("Printer Types", results.rows);
      response.status(200).json(results.rows);
    }
  );
};

const getPartTypes = (request, response) => {
  console.log("Getting Parts");

  pool.query("SELECT * FROM part_types ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    console.log("Part Types", results.rows);

    response.status(200).json(results.rows);
  });
};

const getUserById = (request, response) => {
  const id = request.params.id;
  pool.query("SELECT * FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createUser = (request, response) => {
  const {
    id,
    name,
    email,
    photo,
    organization,
    activated,
    is_manager,
    is_super_user,
    expo_push_token,
  } = request.body;

  pool.query(
    "INSERT INTO users (id, name, email, photo, organization, activated, is_manager, is_super_user, expo_push_token) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ",
    [
      id,
      name,
      email,
      photo,
      organization,
      activated,
      is_manager,
      is_super_user,
      expo_push_token,
    ],
    (error, results) => {
      if (error) {
        console.log(error);
      }
      response.status(201).send(`User added`);
    }
  );
};

const updateUser = (request, response) => {
  const id = request.params.id;
  const {
    name,
    email,
    photo,
    organization,
    activated,
    is_manager,
    is_super_user,
  } = request.body;

  pool.query(
    "UPDATE users SET name = $1, email = $2, photo = $3, organization = $4, activated = $5, is_manager = $6, is_super_user = $7 WHERE id = $8",
    [
      name,
      email,
      photo,
      organization,
      activated,
      is_manager,
      is_super_user,
      id,
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User modified`);
    }
  );
};

const deleteUser = (request, response) => {
  const id = request.params.id;

  pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted`);
  });
};

// Printers

const getPrinters = (request, response) => {
  pool.query(
    "SELECT printers.id, printers.name, printers.serial_number, printers.bw_count, printers.color_count, printers.total_count, manufacturers.id AS manufacturer_id,  models.id AS model_id, manufacturers.name AS manufacturer, models.name AS model,  models.photo AS printer_photo, printer_types.name AS type FROM printers LEFT JOIN models ON printers.model = models.id LEFT JOIN manufacturers ON models.manufacturer = manufacturers.id LEFT JOIN printer_types ON models.type = printer_types.id ORDER BY id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getPrinterById = (request, response) => {
  const id = request.params.id;
  pool.query(
    "SELECT printers.id, printers.name, printers.serial_number, printers.bw_count, printers.color_count, printers.total_count, manufacturers.id AS manufacturer_id, manufacturers.name AS manufacturer, models.name AS model,  models.photo AS printer_photo, printer_types.name AS type FROM printers LEFT JOIN models ON printers.model = models.id LEFT JOIN manufacturers ON models.manufacturer = manufacturers.id LEFT JOIN printer_types ON models.type = printer_types.id WHERE printers.id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const createPrinter = (request, response) => {
  const {
    name,
    serial_number,
    bw_count,
    color_count,
    total_count,
    organization,
    model,
  } = request.body;

  pool.query(
    "INSERT INTO printers (name, serial_number, bw_count, color_count, total_count, organization, model) VALUES ($1, $2, $3, $4, $5, $6, $7) ",
    [
      name,
      serial_number,
      bw_count,
      color_count,
      total_count,
      organization,
      model,
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Printer added`);
    }
  );
};

const updatePrinter = (request, response) => {
  const id = request.params.id;
  const {
    name,
    serial_number,
    bw_count,
    color_count,
    total_count,
    organization,
    model,
  } = request.body;

  pool.query(
    "UPDATE printers SET name = $1, serial_number = $2, bw_count = $3, color_count = $4, total_count = $5, organization = $6, model = $7 WHERE id = $8",
    [
      name,
      serial_number,
      bw_count,
      color_count,
      total_count,
      organization,
      model,
      id,
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Printer modified`);
    }
  );
};

const deletePrinter = (request, response) => {
  const id = request.params.id;

  pool.query("DELETE FROM printers WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`Printer deleted`);
  });
};

// Manufacturers

const getManufacturers = (request, response) => {
  pool.query(
    "SELECT * FROM manufacturers ORDER BY id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getManufacturerParts = (request, response) => {
  const id = request.params.id;

  pool.query(
    "SELECT parts.id as id, manufacturers.id AS manufacturer_id, manufacturers.name AS manufacturer, parts.part_number FROM parts LEFT JOIN manufacturers ON parts.manufacturer = manufacturers.id WHERE manufacturer = $1 ORDER BY id ASC",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getManufacturerModels = (request, response) => {
  const id = request.params.id;

  pool.query(
    "SELECT models.id as id, manufacturers.id AS manufacturer_id, models.id AS model_id, manufacturers.name AS manufacturer, models.name FROM models LEFT JOIN manufacturers ON models.manufacturer = manufacturers.id WHERE manufacturer = $1 ORDER BY id ASC",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getManufacturerById = (request, response) => {
  const id = request.params.id;
  pool.query(
    "SELECT * FROM manufacturers WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const createManufacturer = (request, response) => {
  const { name } = request.body;

  pool.query(
    "INSERT INTO manufacturers (name ) VALUES ($1) ",
    [name],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Manufacturer added`);
    }
  );
};

const updateManufacturer = (request, response) => {
  const id = request.params.id;
  const { name } = request.body;

  pool.query(
    "UPDATE manufacturers SET name = $1 WHERE id = $2",
    [name, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Manufacturer modified`);
    }
  );
};

const deleteManufacturer = (request, response) => {
  const id = request.params.id;

  pool.query(
    "DELETE FROM manufacturers WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Manufacturer deleted`);
    }
  );
};

// Models

const getModels = (request, response) => {
  pool.query(
    "SELECT models.id, models.name, models.photo, manufacturers.id AS manufacturer_id, manufacturers.name AS manufacturer, printer_types.name AS type, printer_types.id AS type_id FROM models LEFT JOIN manufacturers ON models.manufacturer = manufacturers.id LEFT JOIN printer_types ON models.type = printer_types.id ORDER BY id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getModelById = (request, response) => {
  const id = request.params.id;
  pool.query(
    "SELECT models.id, models.name, manufacturers.id AS manufacturer_id, manufacturers.name AS manufacturer, printer_types.name AS type FROM models LEFT JOIN manufacturers ON models.manufacturer = manufacturers.id LEFT JOIN printer_types ON models.type = printer_types.id WHERE models.id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const createModel = (request, response) => {
  const { name, manufacturer, type } = request.body;

  pool.query(
    "INSERT INTO models (name, manufacturer, type) VALUES ($1, $2, $3) ",
    [name, manufacturer, type],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Model added`);
    }
  );
};

const updateModel = (request, response) => {
  const id = request.params.id;
  const { name, manufacturer, type } = request.body;

  pool.query(
    "UPDATE models SET name = $1, manufacturer = $2, type = $3 WHERE id = $4",
    [name, manufacturer, type, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Model modified`);
    }
  );
};

const deleteModel = (request, response) => {
  const id = request.params.id;

  pool.query("DELETE FROM models WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`Model deleted`);
  });
};

// Parts

const getParts = (request, response) => {
  pool.query(
    "SELECT parts.id, parts.part_number, parts.description, parts.photo, manufacturers.id AS manufacturer_id, manufacturers.name AS manufacturer, part_types.name AS type, part_types.id AS type_id FROM parts LEFT JOIN manufacturers ON parts.manufacturer = manufacturers.id LEFT JOIN part_types ON parts.part_type = part_types.id ORDER BY id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getPartById = (request, response) => {
  const id = request.params.id;
  pool.query("SELECT * FROM parts WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createPart = (request, response) => {
  const { part_number, description, manufacturer, part_type } = request.body;

  pool.query(
    "INSERT INTO parts (part_number, description, manufacturer, part_type) VALUES ($1, $2, $3, $4) ",
    [part_number, description, manufacturer, part_type],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Part added`);
    }
  );
};

const updatePart = (request, response) => {
  const id = request.params.id;
  const { part_number, description, manufacturer, part_type } = request.body;

  pool.query(
    "UPDATE parts SET part_number = $1, description=$2, manufacturer = $3, part_type = $4 WHERE id = $5",
    [part_number, description, manufacturer, part_type, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Part modified`);
    }
  );
};

const deletePart = (request, response) => {
  const id = request.params.id;

  pool.query("DELETE FROM parts WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`Part deleted`);
  });
};

// PrinterHistory

const getPrinterHistorySolutions = async (request, response) => {
  const id = request.params.id;
  const query1 =
    "SELECT printers_history.id AS id, printers_history.date_reported, printers_history.date_resolved, printers_history.printer, printers_history.reported_by, printers_history.solution_description, printers_history.resolved_by, printers_history.resolved, printers_history.problem_type AS problem_type_id, printer_history_problem_types.name AS problem_type_name, printers_history.bw_count, printers_history.color_count, printers_history.total_count, printers_history.problem_description, users.name AS user_name, users.photo AS user_photo, users.is_manager AS is_manager, users.is_technician AS is_technician, users.is_super_user AS is_super_user FROM printers_history LEFT JOIN users ON printers_history.reported_by = users.id LEFT JOIN printer_history_problem_types ON printers_history.problem_type = printer_history_problem_types.id WHERE printer = $1 AND resolved = true";

  const query2 =
    "SELECT printer_history_parts.id AS id, printer_history_parts.printer_history AS printer_history, printer_history_parts.part AS part_id, printer_history_parts.quantity, printer_history_parts.invoiced, printer_history_parts.invoice_number, manufacturers.id AS manufacturer_id, manufacturers.name AS manufacturer, parts.part_number AS part_number, parts.description AS description, parts.yield as part_yield, part_types.name AS part_type FROM printer_history_parts LEFT JOIN parts ON printer_history_parts.part = parts.id  LEFT JOIN manufacturers ON parts.manufacturer = manufacturers.id LEFT JOIN part_types ON parts.part_type = part_types.id WHERE printer_history IN (SELECT printer_history FROM printers_history WHERE printer = $1)";

  const query3 =
    "SELECT * FROM printer_history_solution_photos WHERE printer_history IN (SELECT printer_history FROM printers_history WHERE printer = $1)";

  const query4 =
    "SELECT * FROM printer_history_problem_photos WHERE printer_history IN (SELECT printer_history FROM printers_history WHERE printer = $1)";

  const result1 = await pool.query(query1, [id]);
  const result2 = await pool.query(query2, [id]);
  const result3 = await pool.query(query3, [id]);
  const result4 = await pool.query(query4, [id]);

  const combinedArray = result1.rows.map((printerHistory) => ({
    ...printerHistory,
    solution_photos: result3.rows.filter(
      (photo) => photo.printer_history === printerHistory.id
    ),
    problem_photos: result4.rows.filter(
      (photo) => photo.printer_history === printerHistory.id
    ),
    partsUsed: result2.rows.filter(
      (part) => part.printer_history === printerHistory.id
    ),
  }));

  response.status(200).json(combinedArray);
};

const getPrinterHistoryProblems = async (request, response) => {
  const id = request.params.id;

  const query1 =
    "SELECT printers_history.id AS id, printers_history.date_reported, printers_history.printer, printers_history.reported_by, printers_history.solution_description, printers_history.resolved_by, printers_history.resolved, printers_history.problem_type AS problem_type_id, printer_history_problem_types.name AS problem_type_name, printers_history.bw_count, printers_history.color_count, printers_history.total_count, printers_history.problem_description, users.name AS user_name, users.photo AS user_photo, users.is_manager AS is_manager, users.is_technician AS is_technician, users.is_super_user AS is_super_user FROM printers_history LEFT JOIN users ON printers_history.reported_by = users.id LEFT JOIN printer_history_problem_types ON printers_history.problem_type = printer_history_problem_types.id WHERE printer = $1 AND problem_type IS NOT NULL";

  const query2 =
    "SELECT * FROM printer_history_solution_photos WHERE printer_history IN (SELECT printer_history FROM printers_history WHERE printer = $1);";

  const query3 =
    "SELECT * FROM printer_history_problem_photos WHERE printer_history IN (SELECT printer_history FROM printers_history WHERE printer = $1);";

  const result1 = await pool.query(query1, [id]);
  const result2 = await pool.query(query2, [id]);
  const result3 = await pool.query(query3, [id]);

  const combinedArray = result1.rows.map((printerHistory) => ({
    ...printerHistory,

    problem_photos: result3.rows.filter(
      (photo) => photo.printer_history === printerHistory.id
    ),

    solution_photos: result2.rows.filter(
      (photo) => photo.printer_history === printerHistory.id
    ),
  }));

  response.status(200).json(combinedArray);
};

const getPrinterHistoryById = (request, response) => {
  const id = request.params.id;
  pool.query(
    "SELECT * FROM printers_history WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }

      response.status(200).json(results.rows);
    }
  );
};

const createPrinterHistorySolution = async (request, response) => {
  const {
    id,
    date_resolved,
    bw_count,
    color_count,
    total_count,
    solution_description,
    printer,
    parts,
    resolved_by,
    photos,
  } = request.body;

  const query1 =
    "INSERT INTO printers_history (id, date_resolved, bw_count, color_count, total_count, solution_description, printer, resolved_by, resolved) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) ;";

  const query2 =
    "INSERT INTO printer_history_parts (printer_history, part, quantity, invoiced, invoice_number) VALUES ($1, $2, $3, $4, $5) ;";

  const query3 =
    "INSERT INTO printer_history_solution_photos (printer_history, photo) VALUES ($1, $2) ;";

  const result1 = await pool.query(query1, [
    id,
    date_resolved,
    bw_count,
    color_count,
    total_count,
    solution_description,
    printer,
    resolved_by,
  ]);

  parts?.forEach(async (part) => {
    await pool.query(query2, [
      id,
      part.id,
      part.quantity,
      part.invoiced,
      part.invoice_number,
    ]);
  });

  photos?.forEach(async (photo) => {
    await pool.query(query3, [id, photo]);
  });

  const printerQuery = "SELECT * FROM printers WHERE id = $1";

  const printerObject = await pool.query(printerQuery, [printer]);

  const usersToBeNotifiedQuery =
    "SELECT * FROM users WHERE organization = $1 OR is_technician = true OR is_super_user = true;";

  const usersToNotify = await pool.query(usersToBeNotifiedQuery, [
    printerObject.rows[0].organization,
  ]);

  usersToNotify.rows.forEach(async (user) => {
    if (!Expo.isExpoPushToken(user.expo_push_token)) {
      console.log({ error: "Invalid push token" });
    } else {
      console.log({ success: "Valid push token" });

      const messages = [
        {
          to: user.expo_push_token,
          sound: "default",
          title: "Solution Reported for " + printerObject.rows[0].name,
          body: "Tap to view",
        },
      ];

      try {
        const receipts = await expo.sendPushNotificationsAsync(messages);
        console.log(receipts);
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
    }
  });

  response.status(201).send(`Printer History added`);
};

const createPrinterHistoryProblem = async (request, response) => {
  const {
    id,
    date_reported,
    bw_count,
    color_count,
    total_count,
    problem_description,
    printer,
    reported_by,
    problem_type,
    photos,
  } = request.body;

  const query1 =
    "INSERT INTO printers_history (id, date_reported, bw_count, color_count, total_count, problem_description, printer, reported_by, problem_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ;";

  const query3 =
    "INSERT INTO printer_history_problem_photos (printer_history, photo) VALUES ($1, $2) ;";

  const result1 = await pool.query(query1, [
    id,
    date_reported,
    bw_count,
    color_count,
    total_count,
    problem_description,
    printer,
    reported_by,
    problem_type,
  ]);

  photos?.forEach(async (photo) => {
    await pool.query(query3, [id, photo]);
  });

  const printerQuery = "SELECT * FROM printers WHERE id = $1";

  const printerObject = await pool.query(printerQuery, [printer]);

  const usersToBeNotifiedQuery =
    "SELECT * FROM users WHERE organization = $1 OR is_technician = true OR is_super_user = true;";

  const usersToNotify = await pool.query(usersToBeNotifiedQuery, [
    printerObject.rows[0].organization,
  ]);

  usersToNotify.rows.forEach(async (user) => {
    if (!Expo.isExpoPushToken(user.expo_push_token)) {
      console.log({ error: "Invalid push token" });
    } else {
      console.log({ success: "Valid push token" });

      const messages = [
        {
          to: user.expo_push_token,
          sound: "default",
          title: "Problem Reported for " + printerObject.rows[0].name,
          body: "Tap to view",
        },
      ];

      try {
        const receipts = await expo.sendPushNotificationsAsync(messages);
        console.log(receipts);
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
    }
  });

  response.status(201).send(`Printer History added`);
};

const updatePrinterHistory = async (request, response) => {
  const {
    id,
    date_reported,
    date_resolved,
    bw_count,
    color_count,
    total_count,
    solution_description,
    problem_description,
    printer,
    parts,
    resolved_by,
    reported_by,
    solution_photos,
    problem_photos,
    resolved,
    organizationId,
  } = request.body;

  const updatePrinterHistoryQuery =
    "UPDATE printers_history SET date_resolved = $1, date_reported = $2, bw_count = $3, color_count = $4, total_count = $5, solution_description = $6, problem_description = $7, printer = $8, resolved_by = $9, reported_by = $10, resolved= $11 WHERE id = $12";

  const deletePrinterHistoryPartsQuery =
    "DELETE FROM printer_history_parts WHERE printer_history = $1 ;";

  const deletePrinterHistorySolutionPhotosQuery =
    "DELETE FROM printer_history_solution_photos WHERE printer_history = $1 ;";

  const deletePrinterHistoryProblemPhotosQuery =
    "DELETE FROM printer_history_problem_photos WHERE printer_history = $1 ;";

  const createPrinterHistoryPartsQuery =
    "INSERT INTO printer_history_parts (printer_history, part, quantity, invoiced, invoice_number) VALUES ($1, $2, $3, $4, $5) ;";

  const createPrinterHistorySolutionPhotosQuery =
    "INSERT INTO printer_history_solution_photos (printer_history, photo) VALUES ($1, $2) ;";

  const createPrinterHistoryProblemPhotosQuery =
    "INSERT INTO printer_history_problem_photos (printer_history, photo) VALUES ($1, $2) ;";

  const result1 = await pool.query(updatePrinterHistoryQuery, [
    date_resolved,
    date_reported,
    bw_count,
    color_count,
    total_count,
    solution_description,
    problem_description,
    printer,
    resolved_by,
    reported_by,
    resolved,
    id,
  ]);

  await pool.query(deletePrinterHistoryPartsQuery, [id]);
  await pool.query(deletePrinterHistorySolutionPhotosQuery, [id]);
  await pool.query(deletePrinterHistoryProblemPhotosQuery, [id]);
  parts?.forEach(async (part) => {
    await pool.query(createPrinterHistoryPartsQuery, [
      id,
      part.id,
      part.quantity,
      part.invoiced,
      part.invoice_number,
    ]);
  });

  solution_photos?.forEach(async (photo) => {
    await pool.query(createPrinterHistorySolutionPhotosQuery, [id, photo]);
  });

  problem_photos?.forEach(async (photo) => {
    await pool.query(createPrinterHistoryProblemPhotosQuery, [id, photo]);
  });

  const printerQuery = "SELECT * FROM printers WHERE id = $1";

  const printerObject = await pool.query(printerQuery, [printer]);

  const usersToBeNotifiedQuery =
    "SELECT * FROM users WHERE organization = $1 OR is_technician = true OR is_super_user = true;";

  const usersToNotify = await pool.query(usersToBeNotifiedQuery, [
    printerObject.rows[0].organization,
  ]);

  usersToNotify.rows.forEach(async (user) => {
    if (!Expo.isExpoPushToken(user.expo_push_token)) {
      console.log({ error: "Invalid push token" });
    } else {
      console.log({ success: "Valid push token" });

      const messages = [
        {
          to: user.expo_push_token,
          sound: "default",
          title:
            printerObject.rows[0].name + "'s Printer History has been updated",
          body: "Tap to view changes",
        },
      ];

      try {
        const receipts = await expo.sendPushNotificationsAsync(messages);
        console.log(receipts);
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
    }
  });

  response.status(200).send(`PrinterHistory modified`);
};

const deletePrinterHistory = (request, response) => {
  const id = request.params.id;

  pool.query(
    "DELETE FROM printers_history WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`PrinterHistory deleted`);
    }
  );
};

// PrinterHistoryParts

const getPrinterHistoryParts = (request, response) => {
  const id = request.params.id;
  pool.query(
    "SELECT parts.part_number, manufacturers.id AS manufacturer_id, manufacturers.name AS manufacturer, part_types.name AS part_type, printer_history_parts.quantity FROM printer_history_parts LEFT JOIN parts ON printer_history_parts.part = parts.id LEFT JOIN manufacturers ON parts.manufacturer = manufacturers.id LEFT JOIN part_types ON parts.part_type = part_types.id WHERE printer_history_parts.printer_history = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getPrinterHistoryPartById = (request, response) => {
  const id = request.params.id;
  pool.query(
    "SELECT parts.part_number, manufacturers.id AS manufacturer_id, manufacturers.name AS manufacturer, part_types.name AS part_type, printer_history_parts.quantity FROM printer_history_parts LEFT JOIN parts ON printer_history_parts.part = parts.id LEFT JOIN manufacturers ON parts.manufacturer = manufacturers.id LEFT JOIN part_types ON parts.part_type = part_types.id WHERE printer_history_parts.id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const createPrinterHistoryPart = (request, response) => {
  const { printer_history, part, quantity } = request.body;

  pool.query(
    "INSERT INTO printer_history_parts (printer_history, part, quantity) VALUES ($1, $2, $3) ",
    [printer_history, part, quantity],
    (error, results) => {
      if (error) {
        throw error;
      }

      response.status(201).send(`PrinterHistoryPart added`);
    }
  );
};

const updatePrinterHistoryPart = (request, response) => {
  const id = request.params.id;
  const { printer_history, part, quantity } = request.body;

  pool.query(
    "UPDATE printer_history_parts SET printer_history = $1, part = $2, quantity = $3 WHERE id = $4",
    [printer_history, part, quantity, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`PrinterHistoryPart modified`);
    }
  );
};

const deletePrinterHistoryPart = (request, response) => {
  const id = request.params.id;

  pool.query(
    "DELETE FROM printer_history_parts WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`PrinterHistoryPart deleted`);
    }
  );
};

const getPrinterHistoryNonInvoicedParts = (request, response) => {
  pool.query(
    "SELECT printer_history_parts.id, manufacturers.name AS manufacturer, parts.part_number AS name, parts.yield AS expected_yield, printers_history.bw_count AS replacement_bw_count, printers_history.color_count AS replacement_color_count, printers_history.total_count AS replacement_total_count, printers.name AS printer_name, printers_history.problem_description, users.name AS replaced_by, printers_history.date_resolved AS replaced_on FROM printer_history_parts LEFT JOIN parts ON printer_history_parts.part = parts.id LEFT JOIN manufacturers ON parts.manufacturer = manufacturers.id LEFT JOIN printers_history ON printer_history_parts.printer_history = printers_history.id LEFT JOIN printers ON printers_history.printer = printers.id LEFT JOIN users ON printers_history.resolved_by = users.id WHERE invoiced = false ORDER BY id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getOrganizationPrinterHistoryNonInvoicedParts = (request, response) => {
  const id = request.params.id;

  pool.query(
    "SELECT printer_history_parts.id, manufacturers.name AS manufacturer, parts.part_number AS name, parts.yield AS expected_yield, printers_history.bw_count AS replacement_bw_count, printers_history.color_count AS replacement_color_count, printers_history.total_count AS replacement_total_count, printers.name AS printer_name, printers_history.problem_description, users.name AS replaced_by, printers_history.date_resolved AS replaced_on FROM printer_history_parts LEFT JOIN parts ON printer_history_parts.part = parts.id LEFT JOIN manufacturers ON parts.manufacturer = manufacturers.id LEFT JOIN printers_history ON printer_history_parts.printer_history = printers_history.id LEFT JOIN printers ON printers_history.printer = printers.id LEFT JOIN users ON printers_history.resolved_by = users.id WHERE invoiced = false AND printers.organization = $1 ORDER BY id ASC",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getPrinterHistoryUnresolvedProblems = (request, response) => {
  pool.query(
    "SELECT printers_history.id, printers_history.bw_count, printers_history.color_count, printers_history.total_count, printers_history.problem_description, printers_history.date_reported, printers.name AS printer_name, models.name AS model_name, manufacturers.name AS manufacturer_name, users.name AS reported_by, printer_history_problem_types.name AS problem_type FROM printers_history LEFT JOIN printer_history_problem_types ON printers_history.problem_type = printer_history_problem_types.id LEFT JOIN printers ON printers_history.printer = printers.id LEFT JOIN users ON printers_history.reported_by = users.id LEFT JOIN models ON printers.model = models.id LEFT JOIN manufacturers ON models.manufacturer = manufacturers.id WHERE resolved = false ORDER BY date_reported DESC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getOrganizationPrinterHistoryUnresolvedProblems = (request, response) => {
  const id = request.params.id;

  pool.query(
    "SELECT printers_history.id, printers_history.bw_count, printers_history.color_count, printers_history.total_count, printers_history.problem_description, printers_history.date_reported, printers.name AS printer_name, models.name AS model_name, manufacturers.name AS manufacturer_name, users.name AS reported_by, printer_history_problem_types.name AS problem_type FROM printers_history LEFT JOIN printer_history_problem_types ON printers_history.problem_type = printer_history_problem_types.id LEFT JOIN printers ON printers_history.printer = printers.id LEFT JOIN users ON printers_history.reported_by = users.id LEFT JOIN models ON printers.model = models.id LEFT JOIN manufacturers ON models.manufacturer = manufacturers.id WHERE resolved = false AND printers.organization = $1 ORDER BY date_reported DESC",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getPartLastReplacedCount = (request, response) => {
  const { parts } = request.body;

  pool.query(
    "SELECT printers_history.id, bw_count, color_count, total_count FROM printers_history LEFT JOIN printer_history_parts ON printer_history_parts.printer = printers_history.printer LEFT JOIN parts ON printer_history_parts.part = parts.id where printer = $1 AND parts.id = $2 ORDER BY date_resolved DESC",
    [printer_id, part_id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

module.exports = {
  getPrinterHistoryNonInvoicedParts,
  getOrganizationPrinterHistoryNonInvoicedParts,
  getOrganizationPrinterHistoryUnresolvedProblems,
  getPartLastReplacedCount,
  getPrinterHistoryUnresolvedProblems,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getPrinters,
  getPrinterById,
  createPrinter,
  updatePrinter,
  deletePrinter,
  getManufacturers,
  getManufacturerParts,
  getManufacturerModels,
  getManufacturerById,
  createManufacturer,
  updateManufacturer,
  deleteManufacturer,
  getModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
  getParts,
  getPartById,
  createPart,
  updatePart,
  deletePart,
  getPrinterHistorySolutions,
  getPrinterHistoryProblems,
  getPrinterHistoryById,
  createPrinterHistoryProblem,
  createPrinterHistorySolution,
  updatePrinterHistory,
  deletePrinterHistory,
  getPrinterHistoryParts,
  getPrinterHistoryPartById,
  createPrinterHistoryPart,
  updatePrinterHistoryPart,
  deletePrinterHistoryPart,
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationUsers,
  getOrganizationPrinters,
  getPrinterHistoryProblemTypes,
  getPrinterTypes,
  getPartTypes,
};
